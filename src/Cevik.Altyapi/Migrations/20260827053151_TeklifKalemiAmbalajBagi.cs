using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cevik.Altyapi.Migrations
{
    /// <inheritdoc />
    public partial class TeklifKalemiAmbalajBagi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "urun_ambalaj_id",
                table: "teklif_kalemleri",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_teklif_kalemleri_urun_ambalaj_id",
                table: "teklif_kalemleri",
                column: "urun_ambalaj_id");

            migrationBuilder.AddForeignKey(
                name: "fk_teklif_kalemleri_urun_ambalajlari_urun_ambalaj_id",
                table: "teklif_kalemleri",
                column: "urun_ambalaj_id",
                principalTable: "urun_ambalajlari",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_teklif_kalemleri_urun_ambalajlari_urun_ambalaj_id",
                table: "teklif_kalemleri");

            migrationBuilder.DropIndex(
                name: "ix_teklif_kalemleri_urun_ambalaj_id",
                table: "teklif_kalemleri");

            migrationBuilder.DropColumn(
                name: "urun_ambalaj_id",
                table: "teklif_kalemleri");
        }
    }
}
