using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Cevik.Altyapi.Migrations
{
    /// <inheritdoc />
    public partial class AdvancedIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "eposta_dogrulama_gecerlilik_suresi",
                table: "kullanicilar",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "eposta_dogrulama_token_hash",
                table: "kullanicilar",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "sifre_sifirlama_gecerlilik_suresi",
                table: "kullanicilar",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "sifre_sifirlama_token_hash",
                table: "kullanicilar",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "kullanici_refresh_tokens",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kullanici_id = table.Column<long>(type: "bigint", nullable: false),
                    token_hash = table.Column<string>(type: "text", nullable: false),
                    sona_erme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    iptal_edildi_mi = table.Column<bool>(type: "boolean", nullable: false),
                    iptal_nedeni = table.Column<string>(type: "text", nullable: true),
                    yerine_gecen_token_hash = table.Column<string>(type: "text", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_kullanici_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "fk_kullanici_refresh_tokens_kullanicilar_kullanici_id",
                        column: x => x.kullanici_id,
                        principalTable: "kullanicilar",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_kullanici_refresh_tokens_kullanici_id",
                table: "kullanici_refresh_tokens",
                column: "kullanici_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "kullanici_refresh_tokens");

            migrationBuilder.DropColumn(
                name: "eposta_dogrulama_gecerlilik_suresi",
                table: "kullanicilar");

            migrationBuilder.DropColumn(
                name: "eposta_dogrulama_token_hash",
                table: "kullanicilar");

            migrationBuilder.DropColumn(
                name: "sifre_sifirlama_gecerlilik_suresi",
                table: "kullanicilar");

            migrationBuilder.DropColumn(
                name: "sifre_sifirlama_token_hash",
                table: "kullanicilar");
        }
    }
}
