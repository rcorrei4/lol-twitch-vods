using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace lol_twitch_vods_api.Migrations
{
    /// <inheritdoc />
    public partial class AddPuuidColumnToMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "puuid",
                table: "matches",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "puuid",
                table: "matches");
        }
    }
}
