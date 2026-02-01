using System.Text.Json;
using lol_twitch_vods_api.Data;
using lol_twitch_vods_api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace lol_twitch_vods_api.Endpoints;

public static class MatchEndpoints
{
    public static void MapMatchEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/match")
              .WithTags("Match");

        // GET /api/riot/lol-account?username=rcorrei4&tag=br1
        group.MapGet("/", async Task<Ok<List<Match>>> (
            [FromQuery] string[]? streamers,
            [FromQuery] string[]? champions,
            [FromQuery] string[]? enemyChampions,
            AppDbContext context) =>
        {
            Console.WriteLine(JsonSerializer.Serialize(streamers, new JsonSerializerOptions
            {
                WriteIndented = true
            }));
            var query = context.Matches
                .Include(m => m.Participants)
                .ThenInclude(p => p.Streamer)
                .AsQueryable();

            if (streamers != null && streamers.Length > 0)
            {
                query = query.Where(m => m.Participants.Any(p =>
                    p.Streamer != null && streamers.Contains(p.Streamer.DisplayName)));
            }

            if (champions != null && champions.Length > 0)
            {
                query = query.Where(m => m.Participants.Any(p =>
                    p.Streamer != null && champions.Contains(p.ChampionName)));
            }

            if (enemyChampions != null && enemyChampions.Length > 0)
            {
                query = query.Where(m => m.Participants.Any(p =>
                    p.Streamer == null && enemyChampions.Contains(p.ChampionName)));
            }

            var matches = await query.ToListAsync();

            return TypedResults.Ok(matches);
        })
        .WithName("GetMatches");
    }
}