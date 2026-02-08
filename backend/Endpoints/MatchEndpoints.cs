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
        var group = app.MapGroup("/api/matches")
              .WithTags("Match");

        group.MapGet("/", async Task<Ok<PaginatedResponse<Match>>> (
            [FromQuery] string[]? streamers,
            [FromQuery] string[]? champions,
            [FromQuery] string[]? enemyChampions,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            AppDbContext context = null!,
            ILogger<AppDbContext> logger = null!) =>
        {
            logger.LogDebug("Fetching matches - page: {Page}, pageSize: {PageSize}", page, pageSize);

            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = context.Matches
                .Include(m => m.Participants)
                .ThenInclude(p => p.Streamer)
                .AsQueryable();

            if (streamers != null && streamers.Length > 0)
            {
                logger.LogDebug("Filtering by streamers: {Streamers}", JsonSerializer.Serialize(streamers));
                query = query.Where(m => m.Participants.Any(p =>
                    p.Streamer != null && streamers.Contains(p.Streamer.DisplayName)));
            }

            if (champions != null && champions.Length > 0)
            {
                logger.LogDebug("Filtering by champions: {Champions}", JsonSerializer.Serialize(champions));
                query = query.Where(m => m.Participants.Any(p =>
                    p.Streamer != null && champions.Contains(p.ChampionName)));
            }

            if (enemyChampions != null && enemyChampions.Length > 0)
            {
                logger.LogDebug("Filtering by enemy champions: {EnemyChampions}", JsonSerializer.Serialize(enemyChampions));
                query = query.Where(m => m.Participants.Any(p =>
                    p.Streamer == null && enemyChampions.Contains(p.ChampionName)));
            }

            var totalCount = await query.CountAsync();

            var matches = await query
                .OrderByDescending(m => m.GameStartDateTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            logger.LogDebug("Found {Count} matches (total: {Total})", matches.Count, totalCount);

            var response = new PaginatedResponse<Match>
            {
                Data = matches,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };

            return TypedResults.Ok(response);
        })
        .WithName("GetMatches");
    }
}
