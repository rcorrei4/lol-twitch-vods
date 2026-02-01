using System.ComponentModel.DataAnnotations;
using System.Net;
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

public class RiotGamesService(
    IOptions<RiotGamesApiConfiguration> configuration,
    IHttpClientFactory client,
    ILogger<RiotGamesService> logger) : IRiotGamesService
{
    private readonly RiotGamesApiConfiguration _configuration = configuration.Value;
    private readonly HttpClient _client = client.CreateClient();
    private readonly ILogger<RiotGamesService> _logger = logger;

    // Rate limiting: ~1 request per 150ms to stay well under limits
    private static readonly SemaphoreSlim _rateLimiter = new(1, 1);
    private const int RequestDelayMs = 150;
    private const int MaxRetries = 3;

    private async Task<T?> ExecuteWithRateLimitAsync<T>(Func<Task<HttpResponseMessage>> request, string description)
    {
        await _rateLimiter.WaitAsync();
        try
        {
            for (int attempt = 0; attempt <= MaxRetries; attempt++)
            {
                var response = await request();

                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<T>();
                }

                if (response.StatusCode == HttpStatusCode.TooManyRequests ||
                    response.StatusCode == HttpStatusCode.ServiceUnavailable)
                {
                    var retryAfter = response.Headers.RetryAfter?.Delta?.TotalMilliseconds
                                     ?? (Math.Pow(2, attempt) * 1000);

                    _logger.LogWarning(
                        "Rate limited on {Description}, attempt {Attempt}/{MaxRetries}. Waiting {Delay}ms",
                        description, attempt + 1, MaxRetries, retryAfter);

                    await Task.Delay((int)retryAfter);
                    continue;
                }

                _logger.LogWarning(
                    "Request failed for {Description}: {StatusCode}",
                    description, response.StatusCode);
                return default;
            }

            _logger.LogError("Max retries exceeded for {Description}", description);
            return default;
        }
        finally
        {
            await Task.Delay(RequestDelayMs);
            _rateLimiter.Release();
        }
    }

    public async Task<GetLolAccountResponse?> GetLolAccount(string username, Server server, string tag)
    {
        var region = StringExtensions.GetRegionFromServer(server.ToString());
        var url = $"https://{region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{username}/{tag}?api_key={_configuration.Key}";

        _logger.LogDebug("Fetching LoL account: {Username}#{Tag} on {Server}", username, tag, server);

        var response = await ExecuteWithRateLimitAsync<GetLolAccountResponse>(
            () => _client.GetAsync(url),
            $"GetLolAccount({username}#{tag})");

        if (response != null)
        {
            _logger.LogDebug("Found LoL account with PUUID: {Puuid}", response.puuid);
        }
        else
        {
            _logger.LogWarning("LoL account not found: {Username}#{Tag} on {Server}", username, tag, server);
        }

        return response;
    }

    public async Task<List<string>?> ListAccountMatches(string puuid, Server server, long endTimestamp, int count = 100)
    {
        var region = StringExtensions.GetRegionFromServer(server.ToString());
        var url = $"https://{region}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?api_key={_configuration.Key}&startTime={endTimestamp}&count={count}&type=ranked";

        _logger.LogDebug("Fetching matches for PUUID: {Puuid}, count: {Count}, endTime: {EndTimestamp}", puuid, count, endTimestamp);

        var response = await ExecuteWithRateLimitAsync<List<string>>(
            () => _client.GetAsync(url),
            $"ListAccountMatches({puuid})");

        if (response != null)
        {
            _logger.LogDebug("Found {Count} matches for PUUID: {Puuid}", response.Count, puuid);
        }
        else
        {
            _logger.LogWarning("No matches found for PUUID: {Puuid}", puuid);
        }

        return response;
    }

    public async Task<GetLolMatchByUserResponse?> GetLolMatch(string matchId, Server server)
    {
        var region = StringExtensions.GetRegionFromServer(server.ToString());
        var url = $"https://{region}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={_configuration.Key}";

        _logger.LogDebug("Fetching match: {MatchId}", matchId);

        var response = await ExecuteWithRateLimitAsync<GetLolMatchByUserResponse>(
            () => _client.GetAsync(url),
            $"GetLolMatch({matchId})");

        if (response != null)
        {
            _logger.LogDebug("Found match: {MatchId}", matchId);
        }
        else
        {
            _logger.LogWarning("Match not found: {MatchId}", matchId);
        }

        return response;
    }
}
