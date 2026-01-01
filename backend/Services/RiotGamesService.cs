using lol_twitch_vods_api.Configuration;
using Microsoft.Extensions.Options;

namespace lol_twitch_vods_api.Services;

public class GetLolAccountResponse
{
    public string puuid { get; set; } = "";
    public string gameName { get; set; } = "";
    public string tagLine { get; set; } = "";
}

// TODO: handle expired api key
public class RiotGamesService(IOptions<RiotGamesApiConfiguration> configuration, IHttpClientFactory client)
{
    public readonly RiotGamesApiConfiguration _configuration = configuration.Value;
    public readonly HttpClient _client = client.CreateClient();

    public async Task<GetLolAccountResponse> GetLolAccount(string username, string tag)
    {
        var url = $"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{username}/{tag}?api_key={_configuration.Key}";
        Console.WriteLine(url);

        var response = await _client.GetFromJsonAsync<GetLolAccountResponse>(url);

        if (response != null)
        {
            return response;
        }

        Console.WriteLine("Error getting lol account");
        return null;
    }
}