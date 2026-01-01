using lol_twitch_vods_api.Services;

namespace lol_twitch_vods_api.Endpoints;

public static class RiotGamesEndpoints
{
    public static void MapRiotGamesEndpoints (this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/riot")
              .WithTags("RiotGames");

          // GET /api/riot/lol-account?username=rcorrei4&tag=br1
          group.MapGet("/lol-account", async (
              string username,
              string tag,
              RiotGamesService riotGamesService) =>
          {
              var lolAccount = await riotGamesService.GetLolAccount(username, tag);

              if (lolAccount == null)
              {
                  return Results.NotFound(new { message = $"Lol Account '{username}#{tag}' not found" });
              }

              return Results.Ok(lolAccount);
          })
          .WithName("GetRiotGamesAccount")
          .Produces(200)
          .Produces(404);
    }
}