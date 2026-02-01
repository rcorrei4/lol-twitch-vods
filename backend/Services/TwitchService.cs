using System.ComponentModel.DataAnnotations;
using System.Net.Http.Headers;
using lol_twitch_vods_api.Configuration;
using Microsoft.Extensions.Options;
namespace lol_twitch_vods_api.Services;

public class GetTokenResponse
{
    public string access_token { get; set; } = "";
    public int expires_in { get; set; }
    public string token_type { get; set; } = "";
}

public class SearchChannelResponseData
{
    [Required] public required string broadcaster_language { get; set; } = "";
    [Required] public required string broadcaster_login { get; set; } = "";
    [Required] public required string display_name { get; set; } = "";
    public string game_id { get; set; } = "";
    public string game_name { get; set; } = "";
    [Required] public required string id { get; set; } = "";
    public bool is_live { get; set; }
    public string[] tags { get; set; } = [];
    [Required] public required string thumbnail_url { get; set; } = "";
    public string title { get; set; } = "";
    public string started_at { get; set; } = "";
}

public class SearchChannelResponse
{
    public SearchChannelResponseData[] data { get; set; } = [];
}


public class GetStreamerVideoResponseMutedSegments
{
    [Required] public required int duration { get; set; }
    [Required] public required int offset { get; set; }
}

public class GetStreamerVideosResponseData
{
    [Required] public required string id { get; set; } = "";
    public string? stream_id { get; set; } = "";
    [Required] public required string user_id { get; set; } = "";
    [Required] public required string user_login { get; set; } = "";
    [Required] public required string user_name { get; set; } = "";
    [Required] public required string title { get; set; } = "";
    [Required] public required string description { get; set; } = "";
    [Required] public required string created_at { get; set; } = "";
    [Required] public required string published_at { get; set; } = "";
    [Required] public required string url { get; set; } = "";
    [Required] public required string thumbnail_url { get; set; } = "";
    [Required] public required string viewable { get; set; } = "";
    [Required] public required int view_count { get; set; }
    [Required] public required string language { get; set; } = "";
    [Required] public required string type { get; set; } = "";
    [Required] public required string duration { get; set; } = "";
    public GetStreamerVideoResponseMutedSegments? muted_segments { get; set; } = null;
}


public class GetStreamervideoResponsePagination
{
    public string? cursor { get; set; } = "";
}

public class GetStreamerVideosReponse
{
    public GetStreamerVideosResponseData[] data { get; set; } = [];
    public GetStreamervideoResponsePagination? pagination { get; set; } = null;
}

// TODO: Add token error handling
public class TwitchService(
    IOptions<TwitchApiConfiguration> configuration,
    IHttpClientFactory clientFactory,
    ILogger<TwitchService> logger) : ITwitchService
{
    private readonly TwitchApiConfiguration _configuration = configuration.Value;
    private readonly HttpClient _client = clientFactory.CreateClient();
    private readonly ILogger<TwitchService> _logger = logger;
    private string _token = "";

    private async Task SetClientToken()
    {
        _logger.LogDebug("Requesting Twitch OAuth token");

        var response = await _client.PostAsync($"https://id.twitch.tv/oauth2/token?client_id={_configuration.ClientId}&client_secret={_configuration.ClientSecret}&grant_type=client_credentials", null);

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<GetTokenResponse>() ?? throw new ApplicationException("Error getting twitch access token!");

        _token = result.access_token;
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
        _client.DefaultRequestHeaders.Add("Client-Id", _configuration.ClientId);

        _logger.LogDebug("Twitch OAuth token set successfully");
    }

    public async Task<SearchChannelResponseData?> SearchStreamerAsync(string username)
    {
        if (_token == "")
        {
            await SetClientToken();
        }

        var url = $"https://api.twitch.tv/helix/search/channels?query={username}";
        _logger.LogDebug("Searching Twitch channels: {Url}", url);

        var response = await _client.GetFromJsonAsync<SearchChannelResponse>(url);

        if (response?.data != null && response.data.Length > 0)
        {
            _logger.LogDebug("Found {Count} results for username {Username}", response.data.Length, username);

            var exactMatch = response.data.FirstOrDefault(s =>
                s.broadcaster_login.Equals(username, StringComparison.Ordinal));

            if (exactMatch != null)
            {
                _logger.LogDebug("Exact match found: {DisplayName}", exactMatch.display_name);
                return exactMatch;
            }

            _logger.LogDebug("No exact match, returning first result: {DisplayName}", response.data[0].display_name);
            return response.data[0];
        }

        _logger.LogWarning("No Twitch channels found for username {Username}", username);
        return null;
    }

    public async Task<GetStreamerVideosReponse?> ListStreamerVods(string streamerId)
    {
        if (_token == "")
        {
            await SetClientToken();
        }

        var url = $"https://api.twitch.tv/helix/videos?user_id={streamerId}";
        _logger.LogDebug("Fetching VODs for streamer: {StreamerId}", streamerId);

        var response = await _client.GetFromJsonAsync<GetStreamerVideosReponse>(url);

        if (response?.data != null && response.data.Length > 0)
        {
            _logger.LogDebug("Found {Count} VODs for streamer {StreamerId}", response.data.Length, streamerId);
            return response;
        }

        _logger.LogWarning("No VODs found for streamer {StreamerId}", streamerId);
        return null;
    }
}