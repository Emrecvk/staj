using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cevik.Altyapi.Migrations
{
    /// <inheritdoc />
    public partial class AmbalajYabanciAnahtarDuzeltmesi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // VERI TASIMA — golge kolonlar dusurulmeden ONCE calismali.
            //
            // Bu tablolarda iki kolon vardi: kodun yazdigi "urun_ambalaj_id" ve
            // EF'in konvansiyonla urettigi gercek yabanci anahtar "urun_ambalaji_id".
            // Iliski gercekte golge kolon uzerindeydi; dogru degerler orada duruyor.
            // Golge kolonu silmeden once degerleri kalici kolona kopyaliyoruz,
            // yoksa mevcut sepet/siparis/fiyat satirlari yetim kalir.
            migrationBuilder.Sql("""
                UPDATE fiyat_kademeleri  SET urun_ambalaj_id = urun_ambalaji_id WHERE urun_ambalaji_id IS NOT NULL;
                UPDATE sepet_kalemleri   SET urun_ambalaj_id = urun_ambalaji_id WHERE urun_ambalaji_id IS NOT NULL;
                UPDATE siparis_kalemleri SET urun_ambalaj_id = urun_ambalaji_id WHERE urun_ambalaji_id IS NOT NULL;
                UPDATE stok_bildirimleri SET urun_ambalaj_id = urun_ambalaji_id WHERE urun_ambalaji_id IS NOT NULL;
                """);

            migrationBuilder.DropForeignKey(
                name: "fk_fiyat_kademeleri_urun_ambalajlari_urun_ambalaji_id",
                table: "fiyat_kademeleri");

            migrationBuilder.DropForeignKey(
                name: "fk_sepet_kalemleri_urun_ambalajlari_urun_ambalaji_id",
                table: "sepet_kalemleri");

            migrationBuilder.DropForeignKey(
                name: "fk_siparis_kalemleri_urun_ambalajlari_urun_ambalaji_id",
                table: "siparis_kalemleri");

            migrationBuilder.DropForeignKey(
                name: "fk_stok_bildirimleri_urun_ambalajlari_urun_ambalaji_id",
                table: "stok_bildirimleri");

            migrationBuilder.DropIndex(
                name: "ix_stok_bildirimleri_urun_ambalaji_id",
                table: "stok_bildirimleri");

            migrationBuilder.DropIndex(
                name: "ix_siparis_kalemleri_urun_ambalaji_id",
                table: "siparis_kalemleri");

            migrationBuilder.DropIndex(
                name: "ix_sepet_kalemleri_urun_ambalaji_id",
                table: "sepet_kalemleri");

            migrationBuilder.DropIndex(
                name: "ix_fiyat_kademeleri_urun_ambalaji_id",
                table: "fiyat_kademeleri");

            migrationBuilder.DropColumn(
                name: "urun_ambalaji_id",
                table: "stok_bildirimleri");

            migrationBuilder.DropColumn(
                name: "urun_ambalaji_id",
                table: "siparis_kalemleri");

            migrationBuilder.DropColumn(
                name: "urun_ambalaji_id",
                table: "sepet_kalemleri");

            migrationBuilder.DropColumn(
                name: "urun_ambalaji_id",
                table: "fiyat_kademeleri");

            migrationBuilder.CreateIndex(
                name: "ix_stok_bildirimleri_urun_ambalaj_id",
                table: "stok_bildirimleri",
                column: "urun_ambalaj_id");

            migrationBuilder.CreateIndex(
                name: "ix_siparis_kalemleri_urun_ambalaj_id",
                table: "siparis_kalemleri",
                column: "urun_ambalaj_id");

            migrationBuilder.CreateIndex(
                name: "ix_sepet_kalemleri_urun_ambalaj_id",
                table: "sepet_kalemleri",
                column: "urun_ambalaj_id");

            migrationBuilder.CreateIndex(
                name: "ix_fiyat_kademeleri_urun_ambalaj_id",
                table: "fiyat_kademeleri",
                column: "urun_ambalaj_id");

            migrationBuilder.AddForeignKey(
                name: "fk_fiyat_kademeleri_urun_ambalajlari_urun_ambalaj_id",
                table: "fiyat_kademeleri",
                column: "urun_ambalaj_id",
                principalTable: "urun_ambalajlari",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_sepet_kalemleri_urun_ambalajlari_urun_ambalaj_id",
                table: "sepet_kalemleri",
                column: "urun_ambalaj_id",
                principalTable: "urun_ambalajlari",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_siparis_kalemleri_urun_ambalajlari_urun_ambalaj_id",
                table: "siparis_kalemleri",
                column: "urun_ambalaj_id",
                principalTable: "urun_ambalajlari",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_stok_bildirimleri_urun_ambalajlari_urun_ambalaj_id",
                table: "stok_bildirimleri",
                column: "urun_ambalaj_id",
                principalTable: "urun_ambalajlari",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_fiyat_kademeleri_urun_ambalajlari_urun_ambalaj_id",
                table: "fiyat_kademeleri");

            migrationBuilder.DropForeignKey(
                name: "fk_sepet_kalemleri_urun_ambalajlari_urun_ambalaj_id",
                table: "sepet_kalemleri");

            migrationBuilder.DropForeignKey(
                name: "fk_siparis_kalemleri_urun_ambalajlari_urun_ambalaj_id",
                table: "siparis_kalemleri");

            migrationBuilder.DropForeignKey(
                name: "fk_stok_bildirimleri_urun_ambalajlari_urun_ambalaj_id",
                table: "stok_bildirimleri");

            migrationBuilder.DropIndex(
                name: "ix_stok_bildirimleri_urun_ambalaj_id",
                table: "stok_bildirimleri");

            migrationBuilder.DropIndex(
                name: "ix_siparis_kalemleri_urun_ambalaj_id",
                table: "siparis_kalemleri");

            migrationBuilder.DropIndex(
                name: "ix_sepet_kalemleri_urun_ambalaj_id",
                table: "sepet_kalemleri");

            migrationBuilder.DropIndex(
                name: "ix_fiyat_kademeleri_urun_ambalaj_id",
                table: "fiyat_kademeleri");

            migrationBuilder.AddColumn<long>(
                name: "urun_ambalaji_id",
                table: "stok_bildirimleri",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "urun_ambalaji_id",
                table: "siparis_kalemleri",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "urun_ambalaji_id",
                table: "sepet_kalemleri",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "urun_ambalaji_id",
                table: "fiyat_kademeleri",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "ix_stok_bildirimleri_urun_ambalaji_id",
                table: "stok_bildirimleri",
                column: "urun_ambalaji_id");

            migrationBuilder.CreateIndex(
                name: "ix_siparis_kalemleri_urun_ambalaji_id",
                table: "siparis_kalemleri",
                column: "urun_ambalaji_id");

            migrationBuilder.CreateIndex(
                name: "ix_sepet_kalemleri_urun_ambalaji_id",
                table: "sepet_kalemleri",
                column: "urun_ambalaji_id");

            migrationBuilder.CreateIndex(
                name: "ix_fiyat_kademeleri_urun_ambalaji_id",
                table: "fiyat_kademeleri",
                column: "urun_ambalaji_id");

            migrationBuilder.AddForeignKey(
                name: "fk_fiyat_kademeleri_urun_ambalajlari_urun_ambalaji_id",
                table: "fiyat_kademeleri",
                column: "urun_ambalaji_id",
                principalTable: "urun_ambalajlari",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_sepet_kalemleri_urun_ambalajlari_urun_ambalaji_id",
                table: "sepet_kalemleri",
                column: "urun_ambalaji_id",
                principalTable: "urun_ambalajlari",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_siparis_kalemleri_urun_ambalajlari_urun_ambalaji_id",
                table: "siparis_kalemleri",
                column: "urun_ambalaji_id",
                principalTable: "urun_ambalajlari",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_stok_bildirimleri_urun_ambalajlari_urun_ambalaji_id",
                table: "stok_bildirimleri",
                column: "urun_ambalaji_id",
                principalTable: "urun_ambalajlari",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
