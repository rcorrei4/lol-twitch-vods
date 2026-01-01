namespace lol_twitch_vods_api.Endpoints;

public static class StreamerEndpoints
{
    public static void MapStreamerEndpoints (this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/streamer").WithTags("Streamer");

        group.MapPut("/upsert", async () =>
        {
            
        });
    }
}