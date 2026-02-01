using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace lol_twitch_vods_api.Migrations
{
    /// <inheritdoc />
    public partial class ChangeStreamerIdOptionalOnParticipant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_participants_streamers_streamer_id",
                table: "participants");

            migrationBuilder.AlterColumn<Guid>(
                name: "streamer_id",
                table: "participants",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "fk_participants_streamers_streamer_id",
                table: "participants",
                column: "streamer_id",
                principalTable: "streamers",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_participants_streamers_streamer_id",
                table: "participants");

            migrationBuilder.AlterColumn<Guid>(
                name: "streamer_id",
                table: "participants",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_participants_streamers_streamer_id",
                table: "participants",
                column: "streamer_id",
                principalTable: "streamers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
