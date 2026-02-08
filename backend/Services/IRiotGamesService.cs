using lol_twitch_vods_api.Models;

namespace lol_twitch_vods_api.Services;

public interface IRiotGamesService
{
    Task<GetLolAccountResponse?> GetLolAccount(string username, Server server, string tag);
    Task<List<string>?> ListAccountMatches(string puuid, Server server, long endTimestamp, int count = 100);
    Task<GetLolMatchByUserResponse?> GetLolMatch(string matchId, Server server);
}
