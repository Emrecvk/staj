using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cevik.Altyapi.Migrations
{
    /// <inheritdoc />
    public partial class KimlikEklentileri : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "firma_yetkilisi_mi",
                table: "kullanicilar",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "sifre_hash",
                table: "kullanicilar",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "kep_adresi",
                table: "firmalar",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "firma_yetkilisi_mi",
                table: "kullanicilar");

            migrationBuilder.DropColumn(
                name: "sifre_hash",
                table: "kullanicilar");

            migrationBuilder.DropColumn(
                name: "kep_adresi",
                table: "firmalar");
        }
    }
}
