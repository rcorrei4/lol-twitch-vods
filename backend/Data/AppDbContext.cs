using Microsoft.EntityFrameworkCore;
using lol_twitch_vods_api.Models;
using lol_twitch_vods_api.Models.Bases;
using lol_twitch_vods_api.Utils;

namespace lol_twitch_vods_api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<LolAccount> LolAccounts { get; set; }
    public DbSet<Match> Matches { get; set; }
    public DbSet<Participant> Participants { get; set; }
    public DbSet<Streamer> Streamers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(entity.GetTableName()?.ToSnakeCase());

            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(property.GetColumnName().ToSnakeCase());
            }

            foreach (var key in entity.GetKeys())
            {
                key.SetName(key.GetName()?.ToSnakeCase());
            }
            foreach (var key in entity.GetForeignKeys())
            {
                key.SetConstraintName(key.GetConstraintName()?.ToSnakeCase());
            }
        }

        modelBuilder.Entity<Streamer>(entity =>
        {
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate();
        });

        modelBuilder.Entity<LolAccount>(entity =>
        {
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate();
        });

        modelBuilder.Entity<Participant>(entity =>
        {
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<Match>(entity =>
        {
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAdd();
        });
    }
    // public DbSet<Token> Tokens { get; set; }
}