using System.Net.Http.Headers;
using lol_twitch_vods_api.Configuration;
using Microsoft.Extensions.Options;
namespace lol_twitch_vods_api.Services;

public class SearchChannelResponseData
{
    public string broadcaster_language { get; set; } = "";
    public string broadcaster_login { get; set; } = "";
    public string display_name { get; set; } = "";
    public string game_id { get; set; } = "";
    public string game_name { get; set; } = "";
    public string id { get; set; } = "";
    public bool is_live { get; set; }
    public string[] tag_ids { get; set; } = [];
    public string[] tags { get; set; } = [];
    public string thumbnail_url { get; set; } = "";
    public string title { get; set; } = "";
    public string started_at { get; set; } = "";
}

public class SearchChannelResponse
{
    public SearchChannelResponseData[] data { get; set; } = [];
}

public class GetTokenResponse
{
    public string access_token { get; set; } = "";
    public int expires_in { get; set; }
    public string token_type { get; set; } = "";
}

// TODO: Add token error handling
public class TwitchService(IOptions<TwitchApiConfiguration> configuration, IHttpClientFactory clientFactory)
{
    private readonly TwitchApiConfiguration _configuration = configuration.Value;
    private readonly HttpClient _client = clientFactory.CreateClient();
    private string token = "";

    private async Task SetClientToken()
    {
        var response = await _client.PostAsync($"https://id.twitch.tv/oauth2/token?client_id={_configuration.ClientId}&client_secret={_configuration.ClientSecret}&grant_type=client_credentials", null);

        response.EnsureSuccessStatusCode();

        var responseBody = await response.Content.ReadFromJsonAsync<GetTokenResponse>();
        if (responseBody != null)
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", responseBody.access_token);
            _client.DefaultRequestHeaders.Add("Client-Id", _configuration.ClientId);
            token = responseBody.access_token;
        }
        else
        {
            Console.WriteLine("⚠️ Response body is NULL!");
        }
    }

    public async Task<string?> SearchStreamerAsync(string username)
    {
        if (token == "")
        {
            Console.WriteLine("Setting Twitch service token...");
            await SetClientToken();
        }

        var url = $"https://api.twitch.tv/helix/search/channels?query={username}";
        Console.WriteLine($"Fetching: {url}");

        // var httpResponse = await _client.GetAsync(url);
        // var rawJson = await httpResponse.Content.ReadAsStringAsync();
        // Console.WriteLine(rawJson);

        var response = await _client.GetFromJsonAsync<SearchChannelResponse>(url);

        if (response?.data != null && response.data.Length > 0)
        {
            Console.WriteLine($"Found {response.data.Length} results");

            var exactMatch = response.data.FirstOrDefault(s =>
                s.broadcaster_login.Equals(username, StringComparison.Ordinal));

            if (exactMatch != null)
            {
                Console.WriteLine($"Exact match found: {exactMatch.display_name}");
                return exactMatch.id;
            }

            Console.WriteLine($"No exact match, returning first result: {response.data[0].display_name}");
            return response.data[0].id;
        }

        Console.WriteLine("No results found");
        return null;
    }
}