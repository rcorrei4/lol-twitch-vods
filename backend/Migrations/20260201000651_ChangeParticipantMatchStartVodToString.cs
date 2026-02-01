using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace lol_twitch_vods_api.Migrations
{
    /// <inheritdoc />
    public partial class ChangeParticipantMatchStartVodToString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "match_start_vod",
                table: "participants",
                type: "text",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "match_start_vod",
                table: "participants",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
