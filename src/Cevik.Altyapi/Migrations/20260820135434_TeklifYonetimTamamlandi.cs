using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cevik.Altyapi.Migrations
{
    /// <inheritdoc />
    public partial class TeklifYonetimTamamlandi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "para_birimi",
                table: "teklif_kalemleri",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "satis_temsilcisi_notu",
                table: "teklif_kalemleri",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "teklif_edilen_miktar",
                table: "teklif_kalemleri",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "para_birimi",
                table: "teklif_kalemleri");

            migrationBuilder.DropColumn(
                name: "satis_temsilcisi_notu",
                table: "teklif_kalemleri");

            migrationBuilder.DropColumn(
                name: "teklif_edilen_miktar",
                table: "teklif_kalemleri");
        }
    }
}
