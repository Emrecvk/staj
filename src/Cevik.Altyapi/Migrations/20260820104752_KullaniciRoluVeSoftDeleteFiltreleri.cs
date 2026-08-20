using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cevik.Altyapi.Migrations
{
    /// <inheritdoc />
    public partial class KullaniciRoluVeSoftDeleteFiltreleri : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<short>(
                name: "onceki_durum",
                table: "siparis_durum_gecmisleri",
                type: "smallint",
                nullable: true,
                oldClrType: typeof(short),
                oldType: "smallint");

            // Varsayilan 1 = KullaniciRolu.Musteri.
            // EF sifir uretmisti; 0 gecerli bir rol degeri degil, mevcut
            // kullanicilar tanimsiz role dusmemeli.
            migrationBuilder.AddColumn<short>(
                name: "rol",
                table: "kullanicilar",
                type: "smallint",
                nullable: false,
                defaultValue: (short)1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "rol",
                table: "kullanicilar");

            migrationBuilder.AlterColumn<short>(
                name: "onceki_durum",
                table: "siparis_durum_gecmisleri",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0,
                oldClrType: typeof(short),
                oldType: "smallint",
                oldNullable: true);
        }
    }
}
