using lol_twitch_vods_api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace lol_twitch_vods_api.Endpoints;

public static class TwitchEndpoints
{
    public static void MapTwitchEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/twitch")
              .WithTags("Twitch");

        // GET /api/twitch/streamer?username=shroud
        group.MapGet("/streamer", async Task<Results<Ok<SearchChannelResponseData>, NotFound<NotFoundError>>> (
            string username,
            TwitchService twitchService) =>
        {
            var streamer = await twitchService.SearchStreamerAsync(username);

            if (streamer == null)
            {
                return TypedResults.NotFound(new NotFoundError($"Streamer '{username}' not found" ));
            }

            return TypedResults.Ok(streamer);
        })
        .WithName("GetTwitchStreamer");
    }
}