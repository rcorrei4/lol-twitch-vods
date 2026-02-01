using System.ComponentModel.DataAnnotations;
using System.Text.Json;
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
            AppDbContext context,
            ILogger<AppDbContext> logger
        ) =>
        {
            logger.LogDebug("Fetching all streamers");

            var streamers = await context.Streamers.ToListAsync();

            if (streamers == null || streamers.Count == 0)
            {
                logger.LogDebug("No streamers found");
                return TypedResults.NotFound(new NotFoundError("No streamer found"));
            }

            logger.LogDebug("Found {Count} streamers", streamers.Count);
            return TypedResults.Ok(streamers);
        }).WithTags("Streamers");

        group.MapPut("/", async (
            CreateStreamer streamerData,
            AppDbContext context,
            ITwitchService twitchService,
            IRiotGamesService riotGamesService,
            ILogger<AppDbContext> logger
        ) =>
        {
            logger.LogDebug("Creating/updating streamer with TwitchId: {TwitchId}", streamerData.TwitchId);
            logger.LogDebug("Streamer data: {Data}", JsonSerializer.Serialize(streamerData));

            Streamer? streamer = null;
            var existingStreamer = await context.Streamers
                .Where(s => s.TwitchId == streamerData.TwitchId)
                .Include(s => s.LolAccounts)
                .FirstOrDefaultAsync();

            if (existingStreamer != null)
            {
                streamer = existingStreamer;
                foreach (StreamerLolAccount lolAccount in streamerData.LolAccounts)
                {
                    var existingLolAccount = existingStreamer.LolAccounts.FirstOrDefault(la => la.Puuid == lolAccount.Puuid);

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

            await context.SaveChangesAsync();

            var streamerVideos = await twitchService.ListStreamerVods(streamer.TwitchId);

            if (streamerVideos?.data == null || streamerVideos.data.Length == 0)
            {
                logger.LogWarning("No VODs found for streamer {TwitchId}", streamer.TwitchId);
                return TypedResults.Ok(streamer);
            }

            var lastVod = streamerVideos.data.LastOrDefault();
            if (lastVod == null)
            {
                logger.LogWarning("No last VOD available for streamer {TwitchId}", streamer.TwitchId);
                return TypedResults.Ok(streamer);
            }

            var duration = lastVod.duration;
            var lastVodStartTime = DateTime.Parse(lastVod.created_at).ToUniversalTime();

            var lastVodEndTime = Vod.GetVodEndDateTime(lastVodStartTime, duration);
            logger.LogDebug("LastVodEndTime: {lastVodEndTime}", lastVodEndTime);
            var lastVodEndTimestamp = new DateTimeOffset(lastVodEndTime.ToUniversalTime()).ToUnixTimeSeconds();

            logger.LogDebug("LolAccounts count: {Count}", streamer.LolAccounts.Count);

            var matchesToAdd = new List<Models.Match>();
            var newMatchCount = 0;
            var updatedMatchCount = 0;

            foreach (LolAccount lolAccount in streamer.LolAccounts)
            {
                logger.LogDebug("Fetching matches for: {Puuid}", lolAccount.Puuid);
                var accountMatches = await riotGamesService.ListAccountMatches(lolAccount.Puuid, lolAccount.Server, lastVodEndTimestamp);

                if (accountMatches == null || accountMatches.Count == 0)
                {
                    logger.LogDebug("No matches found for account {Puuid}", lolAccount.Puuid);
                    continue;
                }

                logger.LogDebug("Found {Count} matches", accountMatches.Count);
                foreach (string accountMatchId in accountMatches)
                {
                    logger.LogDebug("Processing match: {MatchId}", accountMatchId);

                    // Check if match already exists
                    var existingMatch = await context.Matches
                        .Include(m => m.Participants)
                        .FirstOrDefaultAsync(m => m.Puuid == accountMatchId);

                    var lolMatch = await riotGamesService.GetLolMatch(accountMatchId, lolAccount.Server);

                    if (lolMatch == null)
                    {
                        logger.LogWarning("Could not fetch match {MatchId}", accountMatchId);
                        continue;
                    }

                    var streamerParticipant = lolMatch.info.participants.FirstOrDefault(p => p.puuid == lolAccount.Puuid);

                    if (streamerParticipant == null)
                    {
                        logger.LogWarning("No streamer participant found for matchId: {MatchId} and participantPuuid: {Puuid}",
                            accountMatchId, lolAccount.Puuid);
                        continue;
                    }

                    foreach (GetStreamerVideosResponseData vod in streamerVideos.data)
                    {
                        var vodStart = DateTime.Parse(vod.created_at).ToUniversalTime();
                        var vodEnd = Vod.GetVodEndDateTime(vodStart, vod.duration);

                        DateTime matchStart = DateTimeOffset.FromUnixTimeMilliseconds(lolMatch.info.gameStartTimestamp).UtcDateTime;
                        DateTime matchEnd = DateTimeOffset.FromUnixTimeMilliseconds(lolMatch.info.gameEndTimestamp).UtcDateTime;

                        logger.LogDebug("Checking VOD {VodId}: vodStart={VodStart}, vodEnd={VodEnd}, matchStart={MatchStart}, matchEnd={MatchEnd}",
                            vod.id, vodStart, vodEnd, matchStart, matchEnd);

                        if ((vodStart <= matchStart && matchStart <= vodEnd) || (vodStart <= matchEnd && matchEnd <= vodEnd))
                        {
                            logger.LogInformation("Match {MatchId} fits in VOD {VodId}", accountMatchId, vod.id);

                            string matchStartVod;
                            if (vodStart > matchStart)
                            {
                                matchStartVod = "00h00m";
                            }
                            else
                            {
                                TimeSpan diff = matchStart - vodStart;
                                matchStartVod = $"{(int)diff.TotalHours}h{diff.Minutes}m{diff.Seconds}s";
                            }

                            if (existingMatch != null)
                            {
                                // Update existing participant with VOD info
                                var existingParticipant = existingMatch.Participants
                                    .FirstOrDefault(p => p.Puuid == streamerParticipant.puuid);

                                if (existingParticipant != null)
                                {
                                    existingParticipant.VodId = long.Parse(vod.id);
                                    existingParticipant.MatchStartVod = matchStartVod;
                                    existingParticipant.StreamerId = streamer.Id;
                                    updatedMatchCount++;
                                    logger.LogInformation("Updated existing participant for match {MatchId}", accountMatchId);
                                }
                                else
                                {
                                    logger.LogWarning("Existing match found but participant {Puuid} not found", streamerParticipant.puuid);
                                }
                            }
                            else
                            {
                                logger.LogInformation("Creating new match {MatchId} with VOD {VodId}", accountMatchId, vod.id);

                                var newMatch = new Models.Match
                                {
                                    Puuid = accountMatchId,
                                    GameEndDateTime = matchEnd,
                                    GameStartDateTime = matchStart,
                                    Participants = lolMatch.info.participants.Select(p => new Participant
                                    {
                                        Puuid = p.puuid,
                                        ChampionName = p.championName,
                                        Kills = p.kills,
                                        Deaths = p.deaths,
                                        Assists = p.assists,
                                        Position = ParsePosition(p.teamPosition),
                                        Win = p.win,
                                        VodId = p.puuid == streamerParticipant.puuid ? long.Parse(vod.id) : null,
                                        MatchStartVod = p.puuid == streamerParticipant.puuid ? matchStartVod : null,
                                        StreamerId = p.puuid == streamerParticipant.puuid ? streamer.Id : null,
                                    }).ToList()
                                };

                                matchesToAdd.Add(newMatch);
                                newMatchCount++;
                            }

                            // Break after finding a matching VOD to avoid duplicates
                            break;
                        }
                    }
                }
            }

            if (matchesToAdd.Count > 0)
            {
                context.Matches.AddRange(matchesToAdd);
            }

            await context.SaveChangesAsync();
            logger.LogDebug("Added {NewCount} new matches, updated {UpdatedCount} existing matches",
                newMatchCount, updatedMatchCount);

            return TypedResults.Ok(streamer);
        });
    }

    private static Position ParsePosition(string teamPosition)
    {
        if (Enum.TryParse<Position>(teamPosition, ignoreCase: true, out var position))
        {
            return position;
        }
        return Position.UTILITY;
    }
}
