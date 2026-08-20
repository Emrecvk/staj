using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cevik.Altyapi.Migrations
{
    /// <inheritdoc />
    public partial class UrunAmbalajiRowVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "urun_ambalajlari",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "xmin",
                table: "urun_ambalajlari");
        }
    }
}
