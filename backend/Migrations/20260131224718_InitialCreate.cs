using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace lol_twitch_vods_api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE OR REPLACE FUNCTION update_timestamp_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.""updated_at"" = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql';
            ");

            migrationBuilder.CreateTable(
                name: "matches",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    game_start_date_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    game_end_date_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_matches", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "streamers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    twitch_id = table.Column<string>(type: "text", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: false),
                    login = table.Column<string>(type: "text", nullable: false),
                    profile_image = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_streamers", x => x.id);
                });

            migrationBuilder.Sql(@"
                CREATE TRIGGER trg_update_streamers_timestamp
                BEFORE INSERT OR UPDATE ON ""streamers""
                FOR EACH ROW
                EXECUTE PROCEDURE update_timestamp_column();
            ");

            migrationBuilder.CreateTable(
                name: "lol_accounts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    puuid = table.Column<string>(type: "text", nullable: false),
                    username = table.Column<string>(type: "text", nullable: false),
                    tag = table.Column<string>(type: "text", nullable: false),
                    server = table.Column<int>(type: "integer", nullable: false),
                    streamer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lol_accounts", x => x.id);
                    table.ForeignKey(
                        name: "fk_lol_accounts_streamers_streamer_id",
                        column: x => x.streamer_id,
                        principalTable: "streamers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(@"
                CREATE TRIGGER trg_update_lol_accounts_timestamp
                BEFORE INSERT OR UPDATE ON ""lol_accounts""
                FOR EACH ROW
                EXECUTE PROCEDURE update_timestamp_column();
            ");

            migrationBuilder.CreateTable(
                name: "participants",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    puuid = table.Column<string>(type: "text", nullable: false),
                    champion_name = table.Column<string>(type: "text", nullable: false),
                    kills = table.Column<int>(type: "integer", nullable: false),
                    deaths = table.Column<int>(type: "integer", nullable: false),
                    assists = table.Column<int>(type: "integer", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    win = table.Column<bool>(type: "boolean", nullable: false),
                    vod_id = table.Column<long>(type: "bigint", nullable: true),
                    match_start_vod = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    match_id = table.Column<Guid>(type: "uuid", nullable: false),
                    streamer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_participants", x => x.id);
                    table.ForeignKey(
                        name: "fk_participants_matches_match_id",
                        column: x => x.match_id,
                        principalTable: "matches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_participants_streamers_streamer_id",
                        column: x => x.streamer_id,
                        principalTable: "streamers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(@"
                CREATE TRIGGER trg_update_participants_timestamp
                BEFORE INSERT OR UPDATE ON ""participants""
                FOR EACH ROW
                EXECUTE PROCEDURE update_timestamp_column();
            ");

            migrationBuilder.CreateIndex(
                name: "IX_lol_accounts_streamer_id",
                table: "lol_accounts",
                column: "streamer_id");

            migrationBuilder.CreateIndex(
                name: "IX_participants_match_id",
                table: "participants",
                column: "match_id");

            migrationBuilder.CreateIndex(
                name: "IX_participants_streamer_id",
                table: "participants",
                column: "streamer_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lol_accounts");

            migrationBuilder.DropTable(
                name: "participants");

            migrationBuilder.DropTable(
                name: "matches");

            migrationBuilder.DropTable(
                name: "streamers");
        }
    }
}
