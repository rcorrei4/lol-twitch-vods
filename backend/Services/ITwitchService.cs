namespace lol_twitch_vods_api.Services;

public interface ITwitchService
{
    Task<SearchChannelResponseData?> SearchStreamerAsync(string username);
    Task<List<GetStreamerVideosResponseData>?> ListStreamerVods(string streamerId);
}
