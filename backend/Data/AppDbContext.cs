using Microsoft.EntityFrameworkCore;
using lol_twitch_vods_api.Models;

namespace lol_twitch_vods_api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<LolAccount> LolAccounts { get; set; }
    public DbSet<Match> Matches { get; set; }
    public DbSet<Participant> Participants { get; set; }
    public DbSet<Streamer> Streamers { get; set; }
    // public DbSet<Token> Tokens { get; set; }
}