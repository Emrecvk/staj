using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cevik.Altyapi.Migrations
{
    /// <inheritdoc />
    public partial class FixPendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "aile_id",
                table: "kullanici_refresh_tokens",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "kullanici_refresh_tokens",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.CreateIndex(
                name: "ix_kullanici_refresh_tokens_aile_id",
                table: "kullanici_refresh_tokens",
                column: "aile_id");

            migrationBuilder.CreateIndex(
                name: "ix_kullanici_refresh_tokens_token_hash",
                table: "kullanici_refresh_tokens",
                column: "token_hash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_kullanici_refresh_tokens_aile_id",
                table: "kullanici_refresh_tokens");

            migrationBuilder.DropIndex(
                name: "ix_kullanici_refresh_tokens_token_hash",
                table: "kullanici_refresh_tokens");

            migrationBuilder.DropColumn(
                name: "aile_id",
                table: "kullanici_refresh_tokens");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "kullanici_refresh_tokens");
        }
    }
}
