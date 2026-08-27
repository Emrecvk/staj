using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cevik.Altyapi.Migrations
{
    /// <inheritdoc />
    public partial class OzdisanKatalogKaynagi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "kaynak_katalog_surumu",
                table: "urunler",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "kaynak_kimligi",
                table: "urunler",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "kaynak_sistem",
                table: "urunler",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "kaynak_url",
                table: "urunler",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_urunler_kaynak_sistem_kaynak_kimligi",
                table: "urunler",
                columns: new[] { "kaynak_sistem", "kaynak_kimligi" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_urunler_kaynak_sistem_kaynak_kimligi",
                table: "urunler");

            migrationBuilder.DropColumn(
                name: "kaynak_katalog_surumu",
                table: "urunler");

            migrationBuilder.DropColumn(
                name: "kaynak_kimligi",
                table: "urunler");

            migrationBuilder.DropColumn(
                name: "kaynak_sistem",
                table: "urunler");

            migrationBuilder.DropColumn(
                name: "kaynak_url",
                table: "urunler");
        }
    }
}
