using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.RegularExpressions;
using lol_twitch_vods_api.Data;
using lol_twitch_vods_api.Models;
using lol_twitch_vods_api.Services;
using lol_twitch_vods_api.Utils;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace lol_twitch_vods_api.Endpoints;

public class StreamerLolAccount
{
    [Required] public required string Puuid { get; set; } = "";
    [Required] public required string Username { get; set; } = "";
    [Required] public required string Tag { get; set; } = "";
    [Required] public required Server Server { get; set; }
}

public class CreateStreamer
{
    public string TwitchId { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string Login { get; set; } = "";
    public string ProfileImage { get; set; } = "";

    public ICollection<StreamerLolAccount> LolAccounts { get; set; } = [];
}

public static class StreamerEndpoints
{
    public static void MapStreamerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/streamer").WithTags("Streamer");

        group.MapGet("/", async Task<Results<Ok<List<Streamer>>, NotFound<NotFoundError>>> (
            AppDbContext context
        ) =>
        {
            var streamers = context.Streamers.ToList();

             if (streamers == null)
              {
                  return TypedResults.NotFound(new NotFoundError($"Not streamer found"));
              }

            return TypedResults.Ok(streamers);
        }).WithTags("Streamers");

        group.MapPut("/", async (
            CreateStreamer streamerData,
            AppDbContext context,
            TwitchService twitchService,
            RiotGamesService riotGamesService
        ) =>
        {
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(streamerData));

            Streamer? streamer = null;
            var existingStreamer = context.Streamers.Where(s => s.TwitchId == streamerData.TwitchId).Include(s => s.LolAccounts).FirstOrDefault();
            // var streamerAccountsPuuids = streamerData.LolAccounts.Select(la => la.Puuid);
            if (existingStreamer != null)
            {
                streamer = existingStreamer;
                foreach (StreamerLolAccount lolAccount in streamerData.LolAccounts)
                {
                    var existingLolAccount = existingStreamer.LolAccounts.First(la => la.Puuid == lolAccount.Puuid);

                    if (existingLolAccount != null)
                    {
                        existingLolAccount.Username = lolAccount.Username;
                        existingLolAccount.Tag = lolAccount.Tag;
                    }
                    else
                    {
                        var newLolAccount = new LolAccount
                        {
                            Puuid = lolAccount.Puuid,
                            Server = lolAccount.Server,
                            StreamerId = existingStreamer.Id,
                            Username = lolAccount.Username,
                            Tag = lolAccount.Tag
                        };
                        context.LolAccounts.Add(newLolAccount);
                    }
                }
            }
            else
            {
                var newStreamer = new Streamer
                {
                    TwitchId = streamerData.TwitchId,
                    DisplayName = streamerData.DisplayName,
                    Login = streamerData.Login,
                    ProfileImage = streamerData.ProfileImage,
                };

                newStreamer.LolAccounts = [.. streamerData.LolAccounts.Select(lolAccount => new LolAccount
                    {
                     Puuid = lolAccount.Puuid,
                     Server = lolAccount.Server,
                     StreamerId = newStreamer.Id,
                     Username = lolAccount.Username,
                     Tag = lolAccount.Tag
                    })];

                streamer = newStreamer;

                context.Streamers.Add(newStreamer);
            }

            context.SaveChanges();

            var streamerVideos = await twitchService.ListStreamerVods(streamer.TwitchId);

            var duration = streamerVideos.data.Last().duration;
            var lastVodStartTime = DateTime.Parse(streamerVideos.data.Last().created_at).ToUniversalTime();

            var lastVodEndTime = Vod.GetVodEndDateTime(lastVodStartTime, duration);
            var lastVodEndTimestamp = new DateTimeOffset(lastVodEndTime.ToUniversalTime()).ToUnixTimeSeconds();

            Console.WriteLine($"LolAccounts count: {streamer.LolAccounts.Count}");

            foreach (LolAccount lolAccount in streamer.LolAccounts)
            {
                Console.WriteLine($"Fetching matches for: {lolAccount.Puuid}");
                var accountMatches = await riotGamesService.ListAccountMatches(lolAccount.Puuid, lolAccount.Server, lastVodEndTimestamp);

                Console.WriteLine($"Found {accountMatches.Count} matches");
                foreach (string accountMatchId in accountMatches)
                {
                    Console.WriteLine($"Processing match: {accountMatchId}");
                    var lolMatch = await riotGamesService.GetLolMatch(accountMatchId, lolAccount.Server);

                    var streamerParticipant = lolMatch.info.participants.First(p => p.puuid == lolAccount.Puuid);

                    if (streamerParticipant == null)
                    {
                        Console.WriteLine($"No streamer participant found for matchId: {accountMatchId} and participantPuuid: {lolAccount.Puuid}");
                        continue;
                    }

                    foreach (GetStreamerVideosResponseData vod in streamerVideos.data)
                    {
                        var vodStart = DateTime.Parse(vod.created_at).ToUniversalTime();
                        var vodEnd = Vod.GetVodEndDateTime(vodStart, vod.duration);

                        DateTime matchStart = DateTimeOffset.FromUnixTimeMilliseconds(lolMatch.info.gameStartTimestamp).UtcDateTime;
                        DateTime matchEnd = DateTimeOffset.FromUnixTimeMilliseconds(lolMatch.info.gameEndTimestamp).UtcDateTime;

                        Console.WriteLine($"Checking VOD {vod.id}: vodStart={vodStart}, vodEnd={vodEnd}, matchStart={matchStart}, matchEnd={matchEnd}");
                        if ((vodStart <= matchStart && matchStart <= vodEnd) || (vodStart <= matchEnd && matchEnd <= vodEnd))
                        {
                            Console.WriteLine("Match fits in VOD - creating match and participants");
                            var newMatch = new Models.Match
                            {
                                GameEndDateTime = matchEnd,
                                GameStartDateTime = matchStart,
                            };

                            context.Matches.Add(newMatch);

                            string matchStartVod;

                            if (vodStart > matchStart)
                            {
                                matchStartVod = "00h00m";
                            }
                            else
                            {
                                // In C#, subtracting Dates gives you a TimeSpan object
                                TimeSpan diff = matchStart - vodStart;
                                matchStartVod = $"{(int)diff.TotalHours}h{diff.Minutes}m{diff.Seconds}s";
                            }

                            context.Participants.AddRange(lolMatch.info.participants.Select(p => new Participant
                            {
                                Puuid=p.puuid,
                                ChampionName=p.championName,
                                Kills=p.kills,
                                Deaths=p.deaths,
                                Assists=p.assists,
                                Position=Enum.Parse<Position>(p.teamPosition),
                                Win=p.win,
                                VodId=p.puuid == streamerParticipant.puuid ? long.Parse(vod.id) : null,
                                MatchStartVod=p.puuid == streamerParticipant.puuid ? matchStartVod : null,
                                MatchId=newMatch.Id,
                                StreamerId=p.puuid == streamerParticipant.puuid ? streamer.Id : null,
                            }));

                            context.SaveChanges();
                        }
                    }
                }
            }
        }
        );
    }
}