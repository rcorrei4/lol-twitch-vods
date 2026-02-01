using System.ComponentModel.DataAnnotations;
using lol_twitch_vods_api.Configuration;
using lol_twitch_vods_api.Models;
using lol_twitch_vods_api.Utils;
using Microsoft.Extensions.Options;

namespace lol_twitch_vods_api.Services;

public class GetLolAccountResponse
{
    [Required] public required string puuid { get; set; } = "";
    [Required] public required string gameName { get; set; } = "";
    [Required] public required string tagLine { get; set; } = "";
}

public class MatchInfoParticipant
{
    [Required] public required string championName { get; set; }
    [Required] public required int kills { get; set; }
    [Required] public required int deaths { get; set; }
    [Required] public required int assists { get; set; }
    [Required] public required string teamPosition { get; set; }
    [Required] public required bool win { get; set; }
    [Required] public required string puuid { get; set; }
}

public class MatchInfo
{
    [Required] public required long gameStartTimestamp { get; set; }
    [Required] public required long gameEndTimestamp { get; set; }
    [Required] public required long gameId { get; set; }
    [Required] public required MatchInfoParticipant[] participants { get; set; }
}

public class GetLolMatchByUserResponse
{
    [Required] public required MatchInfo info { get; set; }
}

// TODO: handle expired api key
public class RiotGamesService(IOptions<RiotGamesApiConfiguration> configuration, IHttpClientFactory client)
{
    public readonly RiotGamesApiConfiguration _configuration = configuration.Value;
    public readonly HttpClient _client = client.CreateClient();

    public async Task<GetLolAccountResponse> GetLolAccount(string username, Server server, string tag)
    {
        var region = StringExtensions.GetRegionFromServer(server.ToString());
        var url = $"https://{region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{username}/{tag}?api_key={_configuration.Key}";

        var response = await _client.GetFromJsonAsync<GetLolAccountResponse>(url);

        if (response != null)
        {
            return response;
        }

        Console.WriteLine("Error getting lol account");
        return null;
    }

    public async Task<List<string>> ListAccountMatches (string puuid, Server server, long endTimestamp, int count = 20)
    {
        var region = StringExtensions.GetRegionFromServer(server.ToString());
        var url = $"https://{region}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?api_key={_configuration.Key}&endTime={endTimestamp}&count={count}";

        var response = await _client.GetFromJsonAsync<List<string>>(url);

        if (response != null)
        {
            return response;
        }

        Console.WriteLine("Error getting account matches");
        return null;
    }

    public async Task<GetLolMatchByUserResponse> GetLolMatch (string matchId, Server server)
    {
        var region = StringExtensions.GetRegionFromServer(server.ToString());
        var url = $"https://{region}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={_configuration.Key}";

        var response = await _client.GetFromJsonAsync<GetLolMatchByUserResponse>(url);

        if (response != null)
        {
            return response;
        }

        Console.WriteLine("Error getting match");
        return null;
    }
}