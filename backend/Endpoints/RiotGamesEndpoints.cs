using lol_twitch_vods_api.Models;
using lol_twitch_vods_api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace lol_twitch_vods_api.Endpoints;

public record NotFoundError(string Message);

public static class RiotGamesEndpoints
{
    public static void MapRiotGamesEndpoints (this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/riot")
              .WithTags("RiotGames");

          group.MapGet("/lol-account", async Task<Results<Ok<GetLolAccountResponse>, NotFound<NotFoundError>>> (
              string username,
              string tag,
              Server server,
              IRiotGamesService riotGamesService) =>
          {
              var lolAccount = await riotGamesService.GetLolAccount(username, server, tag);

              if (lolAccount == null)
              {
                  return TypedResults.NotFound(new NotFoundError($"Lol Account '{username}#{tag}' not found"));
              }

              return TypedResults.Ok(lolAccount);
          })
          .WithName("GetRiotGamesAccount");
    }
}