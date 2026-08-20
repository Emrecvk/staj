using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Cevik.Altyapi.Migrations
{
    /// <inheritdoc />
    public partial class IlkOlusturma : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:ltree", ",,")
                .Annotation("Npgsql:PostgresExtension:pg_trgm", ",,");

            migrationBuilder.CreateTable(
                name: "bannerlar",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    konum = table.Column<string>(type: "text", nullable: false),
                    gorsel_url = table.Column<string>(type: "text", nullable: false),
                    link_url = table.Column<string>(type: "text", nullable: true),
                    sira = table.Column<int>(type: "integer", nullable: false),
                    aktif = table.Column<bool>(type: "boolean", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bannerlar", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "blog_yazilari",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    baslik = table.Column<string>(type: "text", nullable: false),
                    slug = table.Column<string>(type: "text", nullable: false),
                    ozet = table.Column<string>(type: "text", nullable: false),
                    icerik_html = table.Column<string>(type: "text", nullable: false),
                    kapak_gorsel_url = table.Column<string>(type: "text", nullable: true),
                    yayin_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    kategori = table.Column<string>(type: "text", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_blog_yazilari", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "doviz_kurlari",
                columns: table => new
                {
                    tarih = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    para_birimi = table.Column<string>(type: "character(3)", fixedLength: true, maxLength: 3, nullable: false),
                    alis = table.Column<decimal>(type: "numeric(18,6)", nullable: false),
                    satis = table.Column<decimal>(type: "numeric(18,6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_doviz_kurlari", x => new { x.tarih, x.para_birimi });
                });

            migrationBuilder.CreateTable(
                name: "duyurular",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    baslik = table.Column<string>(type: "text", nullable: false),
                    icerik = table.Column<string>(type: "text", nullable: false),
                    gorsel_url = table.Column<string>(type: "text", nullable: true),
                    link_url = table.Column<string>(type: "text", nullable: true),
                    baslangic_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    bitis_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    sira = table.Column<int>(type: "integer", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_duyurular", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "e_bulten_aboneleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    eposta = table.Column<string>(type: "text", nullable: false),
                    onaylandi_mi = table.Column<bool>(type: "boolean", nullable: false),
                    abonelik_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    iptal_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_e_bulten_aboneleri", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "indirimler",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ad = table.Column<string>(type: "text", nullable: false),
                    hedef_tipi = table.Column<short>(type: "smallint", nullable: false),
                    hedef_id = table.Column<long>(type: "bigint", nullable: false),
                    indirim_tipi = table.Column<short>(type: "smallint", nullable: false),
                    deger = table.Column<decimal>(type: "numeric(10,4)", nullable: false),
                    baslangic_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    bitis_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    aktif = table.Column<bool>(type: "boolean", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_indirimler", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "kategoriler",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ust_kategori_id = table.Column<int>(type: "integer", nullable: true),
                    ad_tr = table.Column<string>(type: "text", nullable: false),
                    ad_en = table.Column<string>(type: "text", nullable: false),
                    slug_tr = table.Column<string>(type: "text", nullable: false),
                    slug_en = table.Column<string>(type: "text", nullable: false),
                    yol = table.Column<string>(type: "text", nullable: false),
                    seviye = table.Column<short>(type: "smallint", nullable: false),
                    sira = table.Column<int>(type: "integer", nullable: false),
                    ikon_url = table.Column<string>(type: "text", nullable: true),
                    gorsel_url = table.Column<string>(type: "text", nullable: true),
                    yaprak_mi = table.Column<bool>(type: "boolean", nullable: false),
                    seo_baslik = table.Column<string>(type: "text", nullable: true),
                    seo_aciklama = table.Column<string>(type: "text", nullable: true),
                    seo_icerik_html = table.Column<string>(type: "text", nullable: true),
                    aktif = table.Column<bool>(type: "boolean", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_kategoriler", x => x.id);
                    table.ForeignKey(
                        name: "fk_kategoriler_kategoriler_ust_kategori_id",
                        column: x => x.ust_kategori_id,
                        principalTable: "kategoriler",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "musteri_gruplari",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ad = table.Column<string>(type: "text", nullable: false),
                    varsayilan_iskonto_yuzdesi = table.Column<decimal>(type: "numeric", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_musteri_gruplari", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ozellik_tanimlari",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kod = table.Column<string>(type: "text", nullable: false),
                    ad_tr = table.Column<string>(type: "text", nullable: false),
                    ad_en = table.Column<string>(type: "text", nullable: false),
                    veri_tipi = table.Column<short>(type: "smallint", nullable: false),
                    birim = table.Column<string>(type: "text", nullable: true),
                    filtrelenebilir_mi = table.Column<bool>(type: "boolean", nullable: false),
                    siralanabilir_mi = table.Column<bool>(type: "boolean", nullable: false),
                    gosterim_tipi = table.Column<short>(type: "smallint", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ozellik_tanimlari", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "sayfalar",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    slug = table.Column<string>(type: "text", nullable: false),
                    baslik_tr = table.Column<string>(type: "text", nullable: false),
                    baslik_en = table.Column<string>(type: "text", nullable: false),
                    icerik_html_tr = table.Column<string>(type: "text", nullable: false),
                    icerik_html_en = table.Column<string>(type: "text", nullable: false),
                    seo_baslik = table.Column<string>(type: "text", nullable: true),
                    seo_aciklama = table.Column<string>(type: "text", nullable: true),
                    yayinda_mi = table.Column<bool>(type: "boolean", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sayfalar", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "sozlesmeler",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tip = table.Column<string>(type: "text", nullable: false),
                    versiyon = table.Column<string>(type: "text", nullable: false),
                    icerik = table.Column<string>(type: "text", nullable: false),
                    yururluk_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sozlesmeler", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ureticiler",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ad = table.Column<string>(type: "text", nullable: false),
                    slug = table.Column<string>(type: "text", nullable: false),
                    logo_url = table.Column<string>(type: "text", nullable: true),
                    web_sitesi = table.Column<string>(type: "text", nullable: true),
                    aciklama = table.Column<string>(type: "text", nullable: true),
                    yetkili_distributor_mu = table.Column<bool>(type: "boolean", nullable: false),
                    aktif = table.Column<bool>(type: "boolean", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ureticiler", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "sik_sorulan_sorular",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kategori_id = table.Column<int>(type: "integer", nullable: true),
                    soru = table.Column<string>(type: "text", nullable: false),
                    cevap = table.Column<string>(type: "text", nullable: false),
                    sira = table.Column<int>(type: "integer", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sik_sorulan_sorular", x => x.id);
                    table.ForeignKey(
                        name: "fk_sik_sorulan_sorular_kategoriler_kategori_id",
                        column: x => x.kategori_id,
                        principalTable: "kategoriler",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "kategori_ozellikleri",
                columns: table => new
                {
                    kategori_id = table.Column<int>(type: "integer", nullable: false),
                    ozellik_tanim_id = table.Column<int>(type: "integer", nullable: false),
                    sira = table.Column<int>(type: "integer", nullable: false),
                    zorunlu_mu = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_kategori_ozellikleri", x => new { x.kategori_id, x.ozellik_tanim_id });
                    table.ForeignKey(
                        name: "fk_kategori_ozellikleri_kategoriler_kategori_id",
                        column: x => x.kategori_id,
                        principalTable: "kategoriler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_kategori_ozellikleri_ozellik_tanimlari_ozellik_tanim_id",
                        column: x => x.ozellik_tanim_id,
                        principalTable: "ozellik_tanimlari",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "urunler",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    uretici_id = table.Column<int>(type: "integer", nullable: false),
                    kategori_id = table.Column<int>(type: "integer", nullable: false),
                    uretici_urun_kodu = table.Column<string>(type: "text", nullable: false),
                    normalize_kod = table.Column<string>(type: "text", nullable: false),
                    kisa_aciklama = table.Column<string>(type: "text", nullable: false),
                    detayli_aciklama_tr = table.Column<string>(type: "text", nullable: true),
                    detayli_aciklama_en = table.Column<string>(type: "text", nullable: true),
                    ana_gorsel_url = table.Column<string>(type: "text", nullable: true),
                    gorsel_temsili_mi = table.Column<bool>(type: "boolean", nullable: false),
                    urun_durumu = table.Column<short>(type: "smallint", nullable: false),
                    rohs_durumu = table.Column<short>(type: "smallint", nullable: false),
                    montaj_tipi = table.Column<short>(type: "smallint", nullable: false),
                    uretici_teslim_suresi_hafta_min = table.Column<short>(type: "smallint", nullable: true),
                    uretici_teslim_suresi_hafta_max = table.Column<short>(type: "smallint", nullable: true),
                    kampanyali_mi = table.Column<bool>(type: "boolean", nullable: false),
                    ozellikler_json = table.Column<string>(type: "jsonb", nullable: false),
                    goruntulenme_sayisi = table.Column<int>(type: "integer", nullable: false),
                    aktif = table.Column<bool>(type: "boolean", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_urunler", x => x.id);
                    table.ForeignKey(
                        name: "fk_urunler_kategoriler_kategori_id",
                        column: x => x.kategori_id,
                        principalTable: "kategoriler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_urunler_ureticiler_uretici_id",
                        column: x => x.uretici_id,
                        principalTable: "ureticiler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "iliskili_urunler",
                columns: table => new
                {
                    urun_id = table.Column<long>(type: "bigint", nullable: false),
                    iliskili_urun_id = table.Column<long>(type: "bigint", nullable: false),
                    iliski_tipi = table.Column<short>(type: "smallint", nullable: false),
                    sira = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_iliskili_urunler", x => new { x.urun_id, x.iliskili_urun_id, x.iliski_tipi });
                    table.ForeignKey(
                        name: "fk_iliskili_urunler_urunler_iliskili_urun_id",
                        column: x => x.iliskili_urun_id,
                        principalTable: "urunler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_iliskili_urunler_urunler_urun_id",
                        column: x => x.urun_id,
                        principalTable: "urunler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "karsilastirmalar",
                columns: table => new
                {
                    urun_id = table.Column<long>(type: "bigint", nullable: false),
                    eklenme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    kullanici_id = table.Column<long>(type: "bigint", nullable: true),
                    oturum_anahtari = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_karsilastirmalar", x => new { x.urun_id, x.eklenme_tarihi });
                    table.ForeignKey(
                        name: "fk_karsilastirmalar_urunler_urun_id",
                        column: x => x.urun_id,
                        principalTable: "urunler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "urun_ambalajlari",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    urun_id = table.Column<long>(type: "bigint", nullable: false),
                    ambalaj_tipi = table.Column<short>(type: "smallint", nullable: false),
                    ad = table.Column<string>(type: "text", nullable: false),
                    mpq = table.Column<int>(type: "integer", nullable: false),
                    moq = table.Column<int>(type: "integer", nullable: false),
                    katlama_miktari = table.Column<int>(type: "integer", nullable: false),
                    stok_miktari = table.Column<int>(type: "integer", nullable: false),
                    gelecek_stok_miktari = table.Column<int>(type: "integer", nullable: false),
                    gelecek_stok_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    varsayilan_mi = table.Column<bool>(type: "boolean", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_urun_ambalajlari", x => x.id);
                    table.ForeignKey(
                        name: "fk_urun_ambalajlari_urunler_urun_id",
                        column: x => x.urun_id,
                        principalTable: "urunler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "urun_dokumanlari",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    urun_id = table.Column<long>(type: "bigint", nullable: false),
                    tip = table.Column<short>(type: "smallint", nullable: false),
                    url = table.Column<string>(type: "text", nullable: false),
                    baslik = table.Column<string>(type: "text", nullable: false),
                    dil = table.Column<string>(type: "text", nullable: true),
                    dosya_boyutu_kb = table.Column<int>(type: "integer", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_urun_dokumanlari", x => x.id);
                    table.ForeignKey(
                        name: "fk_urun_dokumanlari_urunler_urun_id",
                        column: x => x.urun_id,
                        principalTable: "urunler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "urun_gorselleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    urun_id = table.Column<long>(type: "bigint", nullable: false),
                    url = table.Column<string>(type: "text", nullable: false),
                    sira = table.Column<int>(type: "integer", nullable: false),
                    alt_metin = table.Column<string>(type: "text", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_urun_gorselleri", x => x.id);
                    table.ForeignKey(
                        name: "fk_urun_gorselleri_urunler_urun_id",
                        column: x => x.urun_id,
                        principalTable: "urunler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "urun_ozellik_degerleri",
                columns: table => new
                {
                    urun_id = table.Column<long>(type: "bigint", nullable: false),
                    ozellik_tanim_id = table.Column<int>(type: "integer", nullable: false),
                    deger_metin = table.Column<string>(type: "text", nullable: true),
                    deger_sayi = table.Column<decimal>(type: "numeric(20,6)", nullable: true),
                    deger_min = table.Column<decimal>(type: "numeric(20,6)", nullable: true),
                    deger_max = table.Column<decimal>(type: "numeric(20,6)", nullable: true),
                    ham_deger = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_urun_ozellik_degerleri", x => new { x.urun_id, x.ozellik_tanim_id });
                    table.ForeignKey(
                        name: "fk_urun_ozellik_degerleri_ozellik_tanimlari_ozellik_tanim_id",
                        column: x => x.ozellik_tanim_id,
                        principalTable: "ozellik_tanimlari",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_urun_ozellik_degerleri_urunler_urun_id",
                        column: x => x.urun_id,
                        principalTable: "urunler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "fiyat_kademeleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    urun_ambalaj_id = table.Column<long>(type: "bigint", nullable: false),
                    urun_ambalaji_id = table.Column<long>(type: "bigint", nullable: false),
                    min_miktar = table.Column<int>(type: "integer", nullable: false),
                    max_miktar = table.Column<int>(type: "integer", nullable: true),
                    birim_fiyat = table.Column<decimal>(type: "numeric(18,6)", nullable: false),
                    para_birimi = table.Column<string>(type: "character(3)", fixedLength: true, maxLength: 3, nullable: false),
                    musteri_grubu_id = table.Column<int>(type: "integer", nullable: true),
                    gecerlilik_baslangic = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    gecerlilik_bitis = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_fiyat_kademeleri", x => x.id);
                    table.ForeignKey(
                        name: "fk_fiyat_kademeleri_musteri_gruplari_musteri_grubu_id",
                        column: x => x.musteri_grubu_id,
                        principalTable: "musteri_gruplari",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_fiyat_kademeleri_urun_ambalajlari_urun_ambalaji_id",
                        column: x => x.urun_ambalaji_id,
                        principalTable: "urun_ambalajlari",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stok_bildirimleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    urun_ambalaj_id = table.Column<long>(type: "bigint", nullable: false),
                    urun_ambalaji_id = table.Column<long>(type: "bigint", nullable: false),
                    kullanici_id = table.Column<long>(type: "bigint", nullable: true),
                    eposta = table.Column<string>(type: "text", nullable: true),
                    istenen_miktar = table.Column<int>(type: "integer", nullable: false),
                    bildirildi_mi = table.Column<bool>(type: "boolean", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_stok_bildirimleri", x => x.id);
                    table.ForeignKey(
                        name: "fk_stok_bildirimleri_urun_ambalajlari_urun_ambalaji_id",
                        column: x => x.urun_ambalaji_id,
                        principalTable: "urun_ambalajlari",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "adresler",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kullanici_id = table.Column<long>(type: "bigint", nullable: true),
                    firma_id = table.Column<int>(type: "integer", nullable: true),
                    tip = table.Column<short>(type: "smallint", nullable: false),
                    baslik = table.Column<string>(type: "text", nullable: false),
                    ad_soyad = table.Column<string>(type: "text", nullable: false),
                    telefon = table.Column<string>(type: "text", nullable: true),
                    il = table.Column<string>(type: "text", nullable: false),
                    ilce = table.Column<string>(type: "text", nullable: false),
                    acik_adres = table.Column<string>(type: "text", nullable: false),
                    posta_kodu = table.Column<string>(type: "text", nullable: true),
                    varsayilan_mi = table.Column<bool>(type: "boolean", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_adresler", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "arama_gecmisleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    terim = table.Column<string>(type: "text", nullable: false),
                    sonuc_sayisi = table.Column<int>(type: "integer", nullable: false),
                    kullanici_id = table.Column<long>(type: "bigint", nullable: true),
                    tarih = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_arama_gecmisleri", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "denetim_kayitlari",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tablo_adi = table.Column<string>(type: "text", nullable: false),
                    kayit_id = table.Column<string>(type: "text", nullable: false),
                    islem = table.Column<string>(type: "text", nullable: false),
                    eski_deger_json = table.Column<string>(type: "jsonb", nullable: true),
                    yeni_deger_json = table.Column<string>(type: "jsonb", nullable: true),
                    kullanici_id = table.Column<long>(type: "bigint", nullable: true),
                    tarih = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_denetim_kayitlari", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "favoriler",
                columns: table => new
                {
                    kullanici_id = table.Column<long>(type: "bigint", nullable: false),
                    urun_id = table.Column<long>(type: "bigint", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_favoriler", x => new { x.kullanici_id, x.urun_id });
                    table.ForeignKey(
                        name: "fk_favoriler_urunler_urun_id",
                        column: x => x.urun_id,
                        principalTable: "urunler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "firmalar",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    unvan = table.Column<string>(type: "text", nullable: false),
                    vergi_dairesi = table.Column<string>(type: "text", nullable: false),
                    vergi_no = table.Column<string>(type: "text", nullable: false),
                    musteri_grubu_id = table.Column<int>(type: "integer", nullable: true),
                    satis_temsilcisi_id = table.Column<long>(type: "bigint", nullable: true),
                    kredi_limiti = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    odeme_vadesi_gun = table.Column<int>(type: "integer", nullable: false),
                    onay_durumu = table.Column<short>(type: "smallint", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_firmalar", x => x.id);
                    table.ForeignKey(
                        name: "fk_firmalar_musteri_gruplari_musteri_grubu_id",
                        column: x => x.musteri_grubu_id,
                        principalTable: "musteri_gruplari",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "kullanicilar",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ad = table.Column<string>(type: "text", nullable: false),
                    soyad = table.Column<string>(type: "text", nullable: false),
                    eposta = table.Column<string>(type: "text", nullable: false),
                    telefon = table.Column<string>(type: "text", nullable: true),
                    firma_id = table.Column<int>(type: "integer", nullable: true),
                    varsayilan_para_birimi = table.Column<string>(type: "text", nullable: false),
                    tercih_edilen_dil = table.Column<string>(type: "text", nullable: false),
                    eposta_dogrulandi_mi = table.Column<bool>(type: "boolean", nullable: false),
                    son_giris_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_kullanicilar", x => x.id);
                    table.ForeignKey(
                        name: "fk_kullanicilar_firmalar_firma_id",
                        column: x => x.firma_id,
                        principalTable: "firmalar",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "musteri_urun_kodlari",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    firma_id = table.Column<int>(type: "integer", nullable: false),
                    urun_id = table.Column<long>(type: "bigint", nullable: false),
                    musteri_kodu = table.Column<string>(type: "text", nullable: false),
                    aciklama = table.Column<string>(type: "text", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_musteri_urun_kodlari", x => x.id);
                    table.ForeignKey(
                        name: "fk_musteri_urun_kodlari_firmalar_firma_id",
                        column: x => x.firma_id,
                        principalTable: "firmalar",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_musteri_urun_kodlari_urunler_urun_id",
                        column: x => x.urun_id,
                        principalTable: "urunler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "malzeme_listeleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kullanici_id = table.Column<long>(type: "bigint", nullable: true),
                    firma_id = table.Column<int>(type: "integer", nullable: true),
                    ad = table.Column<string>(type: "text", nullable: false),
                    aciklama = table.Column<string>(type: "text", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_malzeme_listeleri", x => x.id);
                    table.ForeignKey(
                        name: "fk_malzeme_listeleri_firmalar_firma_id",
                        column: x => x.firma_id,
                        principalTable: "firmalar",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_malzeme_listeleri_kullanicilar_kullanici_id",
                        column: x => x.kullanici_id,
                        principalTable: "kullanicilar",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "sepetler",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kullanici_id = table.Column<long>(type: "bigint", nullable: true),
                    oturum_anahtari = table.Column<string>(type: "text", nullable: true),
                    para_birimi = table.Column<string>(type: "text", nullable: false),
                    son_islem_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sepetler", x => x.id);
                    table.ForeignKey(
                        name: "fk_sepetler_kullanicilar_kullanici_id",
                        column: x => x.kullanici_id,
                        principalTable: "kullanicilar",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "siparisler",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    siparis_no = table.Column<string>(type: "text", nullable: false),
                    kullanici_id = table.Column<long>(type: "bigint", nullable: true),
                    firma_id = table.Column<int>(type: "integer", nullable: true),
                    durum = table.Column<short>(type: "smallint", nullable: false),
                    ara_toplam = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    indirim_tutari = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    kdv_tutari = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    kargo_ucreti = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    genel_toplam = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    para_birimi = table.Column<string>(type: "character(3)", fixedLength: true, maxLength: 3, nullable: false),
                    kur = table.Column<decimal>(type: "numeric(18,6)", nullable: false),
                    fatura_adresi_json = table.Column<string>(type: "jsonb", nullable: false),
                    teslimat_adresi_json = table.Column<string>(type: "jsonb", nullable: false),
                    musteri_notu = table.Column<string>(type: "text", nullable: true),
                    kaynak_teklif_id = table.Column<long>(type: "bigint", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_siparisler", x => x.id);
                    table.ForeignKey(
                        name: "fk_siparisler_firmalar_firma_id",
                        column: x => x.firma_id,
                        principalTable: "firmalar",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_siparisler_kullanicilar_kullanici_id",
                        column: x => x.kullanici_id,
                        principalTable: "kullanicilar",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "sozlesme_onaylari",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kullanici_id = table.Column<long>(type: "bigint", nullable: false),
                    sozlesme_id = table.Column<int>(type: "integer", nullable: false),
                    onay_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ip_adresi = table.Column<string>(type: "text", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sozlesme_onaylari", x => x.id);
                    table.ForeignKey(
                        name: "fk_sozlesme_onaylari_kullanicilar_kullanici_id",
                        column: x => x.kullanici_id,
                        principalTable: "kullanicilar",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_sozlesme_onaylari_sozlesmeler_sozlesme_id",
                        column: x => x.sozlesme_id,
                        principalTable: "sozlesmeler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "teklif_talepleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    talep_no = table.Column<string>(type: "text", nullable: false),
                    kullanici_id = table.Column<long>(type: "bigint", nullable: true),
                    firma_id = table.Column<int>(type: "integer", nullable: true),
                    durum = table.Column<short>(type: "smallint", nullable: false),
                    satis_temsilcisi_id = table.Column<long>(type: "bigint", nullable: true),
                    gecerlilik_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    musteri_notu = table.Column<string>(type: "text", nullable: true),
                    temsilci_notu = table.Column<string>(type: "text", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_teklif_talepleri", x => x.id);
                    table.ForeignKey(
                        name: "fk_teklif_talepleri_firmalar_firma_id",
                        column: x => x.firma_id,
                        principalTable: "firmalar",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_teklif_talepleri_kullanicilar_kullanici_id",
                        column: x => x.kullanici_id,
                        principalTable: "kullanicilar",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_teklif_talepleri_kullanicilar_satis_temsilcisi_id",
                        column: x => x.satis_temsilcisi_id,
                        principalTable: "kullanicilar",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "malzeme_listesi_kalemleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    malzeme_listesi_id = table.Column<long>(type: "bigint", nullable: false),
                    satir_no = table.Column<int>(type: "integer", nullable: false),
                    aranan_kod = table.Column<string>(type: "text", nullable: false),
                    referanslar = table.Column<string>(type: "text", nullable: true),
                    miktar = table.Column<int>(type: "integer", nullable: false),
                    eslesen_urun_id = table.Column<long>(type: "bigint", nullable: true),
                    eslesme_durumu = table.Column<short>(type: "smallint", nullable: false),
                    eslesme_skoru = table.Column<int>(type: "integer", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_malzeme_listesi_kalemleri", x => x.id);
                    table.ForeignKey(
                        name: "fk_malzeme_listesi_kalemleri_malzeme_listeleri_malzeme_listesi",
                        column: x => x.malzeme_listesi_id,
                        principalTable: "malzeme_listeleri",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_malzeme_listesi_kalemleri_urunler_eslesen_urun_id",
                        column: x => x.eslesen_urun_id,
                        principalTable: "urunler",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "sepet_kalemleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    sepet_id = table.Column<long>(type: "bigint", nullable: false),
                    urun_ambalaj_id = table.Column<long>(type: "bigint", nullable: false),
                    urun_ambalaji_id = table.Column<long>(type: "bigint", nullable: false),
                    miktar = table.Column<int>(type: "integer", nullable: false),
                    eklenme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sepet_kalemleri", x => x.id);
                    table.ForeignKey(
                        name: "fk_sepet_kalemleri_sepetler_sepet_id",
                        column: x => x.sepet_id,
                        principalTable: "sepetler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_sepet_kalemleri_urun_ambalajlari_urun_ambalaji_id",
                        column: x => x.urun_ambalaji_id,
                        principalTable: "urun_ambalajlari",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "kargolar",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    siparis_id = table.Column<long>(type: "bigint", nullable: false),
                    kargo_firmasi = table.Column<string>(type: "text", nullable: false),
                    takip_no = table.Column<string>(type: "text", nullable: true),
                    gonderim_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    teslim_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_kargolar", x => x.id);
                    table.ForeignKey(
                        name: "fk_kargolar_siparisler_siparis_id",
                        column: x => x.siparis_id,
                        principalTable: "siparisler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "odemeler",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    siparis_id = table.Column<long>(type: "bigint", nullable: false),
                    yontem = table.Column<string>(type: "text", nullable: false),
                    saglayici = table.Column<string>(type: "text", nullable: false),
                    saglayici_referans = table.Column<string>(type: "text", nullable: true),
                    tutar = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    durum = table.Column<string>(type: "text", nullable: false),
                    ham_yanit_json = table.Column<string>(type: "jsonb", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_odemeler", x => x.id);
                    table.ForeignKey(
                        name: "fk_odemeler_siparisler_siparis_id",
                        column: x => x.siparis_id,
                        principalTable: "siparisler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "siparis_durum_gecmisleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    siparis_id = table.Column<long>(type: "bigint", nullable: false),
                    onceki_durum = table.Column<short>(type: "smallint", nullable: false),
                    yeni_durum = table.Column<short>(type: "smallint", nullable: false),
                    degistiren_kullanici_id = table.Column<long>(type: "bigint", nullable: true),
                    aciklama = table.Column<string>(type: "text", nullable: true),
                    tarih = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_siparis_durum_gecmisleri", x => x.id);
                    table.ForeignKey(
                        name: "fk_siparis_durum_gecmisleri_kullanicilar_degistiren_kullanici_",
                        column: x => x.degistiren_kullanici_id,
                        principalTable: "kullanicilar",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_siparis_durum_gecmisleri_siparisler_siparis_id",
                        column: x => x.siparis_id,
                        principalTable: "siparisler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "siparis_kalemleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    siparis_id = table.Column<long>(type: "bigint", nullable: false),
                    urun_id = table.Column<long>(type: "bigint", nullable: false),
                    urun_ambalaj_id = table.Column<long>(type: "bigint", nullable: false),
                    urun_ambalaji_id = table.Column<long>(type: "bigint", nullable: false),
                    urun_kodu_snapshot = table.Column<string>(type: "text", nullable: false),
                    urun_adi_snapshot = table.Column<string>(type: "text", nullable: false),
                    ambalaj_adi_snapshot = table.Column<string>(type: "text", nullable: false),
                    miktar = table.Column<int>(type: "integer", nullable: false),
                    birim_fiyat = table.Column<decimal>(type: "numeric(18,6)", nullable: false),
                    satir_toplami = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    kdv_orani = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_siparis_kalemleri", x => x.id);
                    table.ForeignKey(
                        name: "fk_siparis_kalemleri_siparisler_siparis_id",
                        column: x => x.siparis_id,
                        principalTable: "siparisler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_siparis_kalemleri_urun_ambalajlari_urun_ambalaji_id",
                        column: x => x.urun_ambalaji_id,
                        principalTable: "urun_ambalajlari",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_siparis_kalemleri_urunler_urun_id",
                        column: x => x.urun_id,
                        principalTable: "urunler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "teklif_kalemleri",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    teklif_talep_id = table.Column<long>(type: "bigint", nullable: false),
                    teklif_talebi_id = table.Column<long>(type: "bigint", nullable: false),
                    urun_id = table.Column<long>(type: "bigint", nullable: true),
                    serbest_urun_kodu = table.Column<string>(type: "text", nullable: true),
                    miktar = table.Column<int>(type: "integer", nullable: false),
                    hedef_birim_fiyat = table.Column<decimal>(type: "numeric(18,6)", nullable: true),
                    teklif_edilen_birim_fiyat = table.Column<decimal>(type: "numeric(18,6)", nullable: true),
                    teklif_edilen_teslim_suresi_gun = table.Column<int>(type: "integer", nullable: true),
                    olusturma_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guncelleme_tarihi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    silindi_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_teklif_kalemleri", x => x.id);
                    table.ForeignKey(
                        name: "fk_teklif_kalemleri_teklif_talepleri_teklif_talebi_id",
                        column: x => x.teklif_talebi_id,
                        principalTable: "teklif_talepleri",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_teklif_kalemleri_urunler_urun_id",
                        column: x => x.urun_id,
                        principalTable: "urunler",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "ix_adresler_firma_id",
                table: "adresler",
                column: "firma_id");

            migrationBuilder.CreateIndex(
                name: "ix_adresler_kullanici_id",
                table: "adresler",
                column: "kullanici_id");

            migrationBuilder.CreateIndex(
                name: "ix_arama_gecmisleri_kullanici_id",
                table: "arama_gecmisleri",
                column: "kullanici_id");

            migrationBuilder.CreateIndex(
                name: "ix_denetim_kayitlari_kullanici_id",
                table: "denetim_kayitlari",
                column: "kullanici_id");

            migrationBuilder.CreateIndex(
                name: "ix_favoriler_urun_id",
                table: "favoriler",
                column: "urun_id");

            migrationBuilder.CreateIndex(
                name: "ix_firmalar_musteri_grubu_id",
                table: "firmalar",
                column: "musteri_grubu_id");

            migrationBuilder.CreateIndex(
                name: "ix_firmalar_satis_temsilcisi_id",
                table: "firmalar",
                column: "satis_temsilcisi_id");

            migrationBuilder.CreateIndex(
                name: "ix_fiyat_kademeleri_musteri_grubu_id",
                table: "fiyat_kademeleri",
                column: "musteri_grubu_id");

            migrationBuilder.CreateIndex(
                name: "ix_fiyat_kademeleri_urun_ambalaji_id",
                table: "fiyat_kademeleri",
                column: "urun_ambalaji_id");

            migrationBuilder.CreateIndex(
                name: "ix_iliskili_urunler_iliskili_urun_id",
                table: "iliskili_urunler",
                column: "iliskili_urun_id");

            migrationBuilder.CreateIndex(
                name: "ix_kargolar_siparis_id",
                table: "kargolar",
                column: "siparis_id");

            migrationBuilder.CreateIndex(
                name: "ix_kategori_ozellikleri_ozellik_tanim_id",
                table: "kategori_ozellikleri",
                column: "ozellik_tanim_id");

            migrationBuilder.CreateIndex(
                name: "ix_kategoriler_ust_kategori_id",
                table: "kategoriler",
                column: "ust_kategori_id");

            migrationBuilder.CreateIndex(
                name: "ix_kategoriler_yol",
                table: "kategoriler",
                column: "yol");

            migrationBuilder.CreateIndex(
                name: "ix_kullanicilar_firma_id",
                table: "kullanicilar",
                column: "firma_id");

            migrationBuilder.CreateIndex(
                name: "ix_malzeme_listeleri_firma_id",
                table: "malzeme_listeleri",
                column: "firma_id");

            migrationBuilder.CreateIndex(
                name: "ix_malzeme_listeleri_kullanici_id",
                table: "malzeme_listeleri",
                column: "kullanici_id");

            migrationBuilder.CreateIndex(
                name: "ix_malzeme_listesi_kalemleri_eslesen_urun_id",
                table: "malzeme_listesi_kalemleri",
                column: "eslesen_urun_id");

            migrationBuilder.CreateIndex(
                name: "ix_malzeme_listesi_kalemleri_malzeme_listesi_id",
                table: "malzeme_listesi_kalemleri",
                column: "malzeme_listesi_id");

            migrationBuilder.CreateIndex(
                name: "ix_musteri_urun_kodlari_firma_id_urun_id",
                table: "musteri_urun_kodlari",
                columns: new[] { "firma_id", "urun_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_musteri_urun_kodlari_urun_id",
                table: "musteri_urun_kodlari",
                column: "urun_id");

            migrationBuilder.CreateIndex(
                name: "ix_odemeler_siparis_id",
                table: "odemeler",
                column: "siparis_id");

            migrationBuilder.CreateIndex(
                name: "ix_sepet_kalemleri_sepet_id",
                table: "sepet_kalemleri",
                column: "sepet_id");

            migrationBuilder.CreateIndex(
                name: "ix_sepet_kalemleri_urun_ambalaji_id",
                table: "sepet_kalemleri",
                column: "urun_ambalaji_id");

            migrationBuilder.CreateIndex(
                name: "ix_sepetler_kullanici_id",
                table: "sepetler",
                column: "kullanici_id");

            migrationBuilder.CreateIndex(
                name: "ix_sik_sorulan_sorular_kategori_id",
                table: "sik_sorulan_sorular",
                column: "kategori_id");

            migrationBuilder.CreateIndex(
                name: "ix_siparis_durum_gecmisleri_degistiren_kullanici_id",
                table: "siparis_durum_gecmisleri",
                column: "degistiren_kullanici_id");

            migrationBuilder.CreateIndex(
                name: "ix_siparis_durum_gecmisleri_siparis_id",
                table: "siparis_durum_gecmisleri",
                column: "siparis_id");

            migrationBuilder.CreateIndex(
                name: "ix_siparis_kalemleri_siparis_id",
                table: "siparis_kalemleri",
                column: "siparis_id");

            migrationBuilder.CreateIndex(
                name: "ix_siparis_kalemleri_urun_ambalaji_id",
                table: "siparis_kalemleri",
                column: "urun_ambalaji_id");

            migrationBuilder.CreateIndex(
                name: "ix_siparis_kalemleri_urun_id",
                table: "siparis_kalemleri",
                column: "urun_id");

            migrationBuilder.CreateIndex(
                name: "ix_siparisler_firma_id",
                table: "siparisler",
                column: "firma_id");

            migrationBuilder.CreateIndex(
                name: "ix_siparisler_kullanici_id",
                table: "siparisler",
                column: "kullanici_id");

            migrationBuilder.CreateIndex(
                name: "ix_siparisler_siparis_no",
                table: "siparisler",
                column: "siparis_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_sozlesme_onaylari_kullanici_id",
                table: "sozlesme_onaylari",
                column: "kullanici_id");

            migrationBuilder.CreateIndex(
                name: "ix_sozlesme_onaylari_sozlesme_id",
                table: "sozlesme_onaylari",
                column: "sozlesme_id");

            migrationBuilder.CreateIndex(
                name: "ix_stok_bildirimleri_urun_ambalaji_id",
                table: "stok_bildirimleri",
                column: "urun_ambalaji_id");

            migrationBuilder.CreateIndex(
                name: "ix_teklif_kalemleri_teklif_talebi_id",
                table: "teklif_kalemleri",
                column: "teklif_talebi_id");

            migrationBuilder.CreateIndex(
                name: "ix_teklif_kalemleri_urun_id",
                table: "teklif_kalemleri",
                column: "urun_id");

            migrationBuilder.CreateIndex(
                name: "ix_teklif_talepleri_firma_id",
                table: "teklif_talepleri",
                column: "firma_id");

            migrationBuilder.CreateIndex(
                name: "ix_teklif_talepleri_kullanici_id",
                table: "teklif_talepleri",
                column: "kullanici_id");

            migrationBuilder.CreateIndex(
                name: "ix_teklif_talepleri_satis_temsilcisi_id",
                table: "teklif_talepleri",
                column: "satis_temsilcisi_id");

            migrationBuilder.CreateIndex(
                name: "ix_teklif_talepleri_talep_no",
                table: "teklif_talepleri",
                column: "talep_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_urun_ambalajlari_urun_id",
                table: "urun_ambalajlari",
                column: "urun_id");

            migrationBuilder.CreateIndex(
                name: "ix_urun_dokumanlari_urun_id",
                table: "urun_dokumanlari",
                column: "urun_id");

            migrationBuilder.CreateIndex(
                name: "ix_urun_gorselleri_urun_id",
                table: "urun_gorselleri",
                column: "urun_id");

            migrationBuilder.CreateIndex(
                name: "ix_urun_ozellik_degerleri_ozellik_tanim_id_deger_metin",
                table: "urun_ozellik_degerleri",
                columns: new[] { "ozellik_tanim_id", "deger_metin" });

            migrationBuilder.CreateIndex(
                name: "ix_urun_ozellik_degerleri_ozellik_tanim_id_deger_sayi",
                table: "urun_ozellik_degerleri",
                columns: new[] { "ozellik_tanim_id", "deger_sayi" });

            migrationBuilder.CreateIndex(
                name: "ix_urunler_kategori_id",
                table: "urunler",
                column: "kategori_id");

            migrationBuilder.CreateIndex(
                name: "ix_urunler_normalize_kod",
                table: "urunler",
                column: "normalize_kod")
                .Annotation("Npgsql:IndexMethod", "GIN")
                .Annotation("Npgsql:IndexOperators", new[] { "gin_trgm_ops" });

            migrationBuilder.CreateIndex(
                name: "ix_urunler_ozellikler_json",
                table: "urunler",
                column: "ozellikler_json")
                .Annotation("Npgsql:IndexMethod", "GIN")
                .Annotation("Npgsql:IndexOperators", new[] { "jsonb_path_ops" });

            migrationBuilder.CreateIndex(
                name: "ix_urunler_uretici_id_uretici_urun_kodu",
                table: "urunler",
                columns: new[] { "uretici_id", "uretici_urun_kodu" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_adresler_firmalar_firma_id",
                table: "adresler",
                column: "firma_id",
                principalTable: "firmalar",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_adresler_kullanicilar_kullanici_id",
                table: "adresler",
                column: "kullanici_id",
                principalTable: "kullanicilar",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_arama_gecmisleri_kullanicilar_kullanici_id",
                table: "arama_gecmisleri",
                column: "kullanici_id",
                principalTable: "kullanicilar",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_denetim_kayitlari_kullanicilar_kullanici_id",
                table: "denetim_kayitlari",
                column: "kullanici_id",
                principalTable: "kullanicilar",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_favoriler_kullanicilar_kullanici_id",
                table: "favoriler",
                column: "kullanici_id",
                principalTable: "kullanicilar",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_firmalar_kullanicilar_satis_temsilcisi_id",
                table: "firmalar",
                column: "satis_temsilcisi_id",
                principalTable: "kullanicilar",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_kullanicilar_firmalar_firma_id",
                table: "kullanicilar");

            migrationBuilder.DropTable(
                name: "adresler");

            migrationBuilder.DropTable(
                name: "arama_gecmisleri");

            migrationBuilder.DropTable(
                name: "bannerlar");

            migrationBuilder.DropTable(
                name: "blog_yazilari");

            migrationBuilder.DropTable(
                name: "denetim_kayitlari");

            migrationBuilder.DropTable(
                name: "doviz_kurlari");

            migrationBuilder.DropTable(
                name: "duyurular");

            migrationBuilder.DropTable(
                name: "e_bulten_aboneleri");

            migrationBuilder.DropTable(
                name: "favoriler");

            migrationBuilder.DropTable(
                name: "fiyat_kademeleri");

            migrationBuilder.DropTable(
                name: "iliskili_urunler");

            migrationBuilder.DropTable(
                name: "indirimler");

            migrationBuilder.DropTable(
                name: "kargolar");

            migrationBuilder.DropTable(
                name: "karsilastirmalar");

            migrationBuilder.DropTable(
                name: "kategori_ozellikleri");

            migrationBuilder.DropTable(
                name: "malzeme_listesi_kalemleri");

            migrationBuilder.DropTable(
                name: "musteri_urun_kodlari");

            migrationBuilder.DropTable(
                name: "odemeler");

            migrationBuilder.DropTable(
                name: "sayfalar");

            migrationBuilder.DropTable(
                name: "sepet_kalemleri");

            migrationBuilder.DropTable(
                name: "sik_sorulan_sorular");

            migrationBuilder.DropTable(
                name: "siparis_durum_gecmisleri");

            migrationBuilder.DropTable(
                name: "siparis_kalemleri");

            migrationBuilder.DropTable(
                name: "sozlesme_onaylari");

            migrationBuilder.DropTable(
                name: "stok_bildirimleri");

            migrationBuilder.DropTable(
                name: "teklif_kalemleri");

            migrationBuilder.DropTable(
                name: "urun_dokumanlari");

            migrationBuilder.DropTable(
                name: "urun_gorselleri");

            migrationBuilder.DropTable(
                name: "urun_ozellik_degerleri");

            migrationBuilder.DropTable(
                name: "malzeme_listeleri");

            migrationBuilder.DropTable(
                name: "sepetler");

            migrationBuilder.DropTable(
                name: "siparisler");

            migrationBuilder.DropTable(
                name: "sozlesmeler");

            migrationBuilder.DropTable(
                name: "urun_ambalajlari");

            migrationBuilder.DropTable(
                name: "teklif_talepleri");

            migrationBuilder.DropTable(
                name: "ozellik_tanimlari");

            migrationBuilder.DropTable(
                name: "urunler");

            migrationBuilder.DropTable(
                name: "kategoriler");

            migrationBuilder.DropTable(
                name: "ureticiler");

            migrationBuilder.DropTable(
                name: "firmalar");

            migrationBuilder.DropTable(
                name: "kullanicilar");

            migrationBuilder.DropTable(
                name: "musteri_gruplari");
        }
    }
}
