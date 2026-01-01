using lol_twitch_vods_api.Services;

namespace lol_twitch_vods_api.Endpoints;

public static class TwitchEndpoints
{
    public static void MapTwitchEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/twitch")
              .WithTags("Twitch");

        // GET /api/twitch/streamer?username=shroud
        group.MapGet("/streamer", async (
            string username,
            TwitchService twitchService) =>
        {
            var streamer = await twitchService.SearchStreamerAsync(username);

            if (streamer == null)
            {
                return Results.NotFound(new { message = $"Streamer '{username}' not found" });
            }

            return Results.Ok(streamer);
        })
        .WithName("GetTwitchStreamer")
        .Produces(200)
        .Produces(404);
    }
}