using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed;

/// <summary>
/// Katalogun iskeleti: parametre sözlüğü, kategori ağacı ve ambalaj profilleri.
///
/// Ürünlerin kendisi burada DEĞİL — onlar <see cref="Katalog.ParcaKatalogu"/> altındaki
/// kaynaklardan gelir ve buradaki yaprak kategorilere <c>Slug</c> ile bağlanır.
/// Bu ayrım kasıtlıdır: kategori ağacı ve filtre panelinin tanımı tek yerde durur,
/// parça verisi ise ürün ailesine göre ayrı dosyalarda büyür.
///
/// Fiyat bandı ve ambalaj profili de kategoriye bağlıdır: bir 0603 direnç 0.002 USD,
/// bir DIN ray güç kaynağı 45 USD'dir. Önceki seed tüm katalog için tek bir
/// 0.008–145 USD aralığından rastgele çekiyordu ve bu yüzden 90 USD'lik direnç,
/// 0.01 USD'lik güç kaynağı üretiyordu.
/// </summary>
public static class KatalogSablonlari
{
    // -----------------------------------------------------------------------
    // Parametre sözlüğü
    // -----------------------------------------------------------------------

    public record OzellikSablonu(
        string Kod,
        string AdTr,
        string AdEn,
        OzellikVeriTipi VeriTipi,
        string? Birim,
        OzellikGosterimTipi GosterimTipi);

    /// <summary>Seçim tipi parametre — facet panelinde onay kutusu listesi olur.</summary>
    private static OzellikSablonu Sec(string kod, string tr, string en, string? birim = null)
        => new(kod, tr, en, OzellikVeriTipi.Secim, birim, OzellikGosterimTipi.OnayKutusu);

    /// <summary>Sayısal parametre — facet panelinde aralık kaydıracı olur ve sıralanabilir.</summary>
    private static OzellikSablonu Say(string kod, string tr, string en, string? birim = null)
        => new(kod, tr, en, OzellikVeriTipi.Sayi, birim, OzellikGosterimTipi.AralikKaydiraci);

    public static readonly OzellikSablonu[] Ozellikler =
    [
        // Genel
        Sec("kilif", "Kılıf / Paket", "Package"),
        Sec("calisma_sicakligi", "Çalışma Sıcaklığı", "Operating Temperature", "°C"),
        Sec("tolerans", "Tolerans", "Tolerance", "%"),
        Sec("boyut_kodu", "Boyut Kodu (EIA)", "Case Code (EIA)"),
        Sec("besleme_voltaji", "Besleme Voltajı", "Supply Voltage", "V"),
        Say("voltaj_derecesi", "Voltaj Derecesi", "Voltage Rating", "V"),
        Sec("guc_derecesi", "Güç Derecesi", "Power Rating", "W"),
        Say("akim_derecesi", "Akım Derecesi", "Current Rating", "A"),
        Sec("arayuz", "Arayüz", "Interface"),
        Say("kanal_sayisi", "Kanal Sayısı", "Number of Channels"),
        Say("pin_sayisi", "Pin Sayısı", "Number of Pins"),
        Sec("montaj_sekli", "Montaj Şekli", "Mounting Type"),

        // Direnç
        Say("direnc_degeri", "Direnç Değeri", "Resistance", "Ω"),
        Sec("direnc_teknolojisi", "Direnç Teknolojisi", "Resistor Technology"),
        Say("sicaklik_katsayisi", "Sıcaklık Katsayısı", "Temperature Coefficient", "ppm/°C"),
        Sec("potansiyometre_tipi", "Potansiyometre Tipi", "Potentiometer Type"),
        Sec("tur_sayisi", "Tur Sayısı", "Number of Turns"),

        // Kondansatör
        Say("kapasitans", "Kapasitans", "Capacitance", "µF"),
        Sec("dielektrik", "Dielektrik", "Dielectric"),
        Sec("kondansator_tipi", "Kondansatör Tipi", "Capacitor Type"),
        Say("esr", "ESR", "ESR", "mΩ"),
        Say("omur_saat", "Yük Ömrü", "Load Life", "saat"),

        // Endüktans / ferrit / kristal
        Say("enduktans", "Endüktans", "Inductance", "µH"),
        Say("doyma_akimi", "Doyma Akımı (Isat)", "Saturation Current", "A"),
        Say("dc_direnc", "DC Direnç (DCR)", "DC Resistance", "mΩ"),
        Sec("ekranlama", "Ekranlama", "Shielding"),
        Say("empedans_100mhz", "Empedans @100 MHz", "Impedance @100 MHz", "Ω"),
        Say("frekans", "Frekans", "Frequency", "MHz"),
        Say("yuk_kapasitansi", "Yük Kapasitansı", "Load Capacitance", "pF"),
        Say("kararlilik", "Frekans Kararlılığı", "Frequency Stability", "ppm"),

        // Mikrodenetleyici / bellek
        Sec("cekirdek", "Çekirdek", "Core"),
        Sec("bit_sayisi", "Bit Sayısı", "Bit Width", "Bit"),
        Say("flash_bellek", "Flash Bellek", "Flash Memory", "kB"),
        Say("ram", "RAM", "RAM", "kB"),
        Sec("bellek_tipi", "Bellek Tipi", "Memory Type"),
        Say("bellek_boyutu", "Bellek Boyutu", "Memory Size", "Mbit"),
        Say("hiz", "Hız", "Speed", "MHz"),

        // Analog
        Say("bant_genisligi", "Bant Genişliği (GBW)", "Gain Bandwidth", "MHz"),
        Say("slew_rate", "Slew Rate", "Slew Rate", "V/µs"),
        Say("offset_voltaji", "Giriş Offset Voltajı", "Input Offset Voltage", "µV"),
        Sec("rail_to_rail", "Rail-to-Rail", "Rail-to-Rail"),
        Say("cozunurluk", "Çözünürlük", "Resolution", "Bit"),
        Say("ornekleme_hizi", "Örnekleme Hızı", "Sampling Rate", "kSPS"),

        // Lojik
        Sec("lojik_ailesi", "Lojik Ailesi", "Logic Family"),
        Sec("lojik_fonksiyonu", "Lojik Fonksiyon", "Logic Function"),
        Say("kapi_sayisi", "Kapı / Bit Sayısı", "Number of Elements"),

        // Güç yönetimi
        Say("cikis_voltaji", "Çıkış Voltajı", "Output Voltage", "V"),
        Say("cikis_akimi", "Çıkış Akımı", "Output Current", "A"),
        Say("giris_voltaji_max", "Maks. Giriş Voltajı", "Max Input Voltage", "V"),
        Say("dropout_voltaji", "Dropout Voltajı", "Dropout Voltage", "mV"),
        Sec("topoloji", "Topoloji", "Topology"),
        Say("verim", "Verim", "Efficiency", "%"),

        // Ayrık yarı iletken
        Sec("diyot_tipi", "Diyot Tipi", "Diode Type"),
        Say("ters_voltaj", "Ters Voltaj (VR)", "Reverse Voltage", "V"),
        Say("ileri_akim", "İleri Akım (IF)", "Forward Current", "A"),
        Say("ileri_voltaj", "İleri Voltaj (VF)", "Forward Voltage", "V"),
        Say("toparlanma_suresi", "Toparlanma Süresi (trr)", "Recovery Time", "ns"),
        Say("zener_voltaji", "Zener Voltajı", "Zener Voltage", "V"),
        Sec("kanal_tipi", "Kanal Tipi", "Channel Type"),
        Say("vds_max", "VDS (Maks.)", "Drain-Source Voltage", "V"),
        Say("id_max", "ID (Sürekli)", "Continuous Drain Current", "A"),
        Say("rds_on", "RDS(on)", "On Resistance", "mΩ"),
        Say("vgs_esik", "VGS(th)", "Gate Threshold Voltage", "V"),
        Sec("transistor_tipi", "Transistör Tipi", "Transistor Type"),
        Say("vce_max", "VCEO (Maks.)", "Collector-Emitter Voltage", "V"),
        Say("ic_max", "IC (Sürekli)", "Continuous Collector Current", "A"),
        Say("hfe", "DC Kazanç (hFE)", "DC Current Gain"),

        // Optoelektronik
        Sec("renk", "Renk", "Colour"),
        Say("dalga_boyu", "Dalga Boyu", "Wavelength", "nm"),
        Say("parlaklik", "Işık Şiddeti", "Luminous Intensity", "mcd"),
        Say("gorus_acisi", "Görüş Açısı", "Viewing Angle", "°"),
        Sec("lens_tipi", "Lens Tipi", "Lens Type"),
        Say("isik_akisi", "Işık Akısı", "Luminous Flux", "lm"),
        Say("renk_sicakligi", "Renk Sıcaklığı", "Colour Temperature", "K"),
        Sec("ekran_tipi", "Ekran Tipi", "Display Type"),
        Sec("cozunurluk_piksel", "Çözünürlük", "Pixel Resolution"),
        Say("ekran_boyutu", "Ekran Boyutu", "Display Size", "inç"),
        Sec("arka_isik", "Arka Işık", "Backlight"),
        Say("izolasyon_voltaji", "İzolasyon Voltajı", "Isolation Voltage", "V"),
        Sec("ctr", "Akım Transfer Oranı (CTR)", "Current Transfer Ratio", "%"),
        Sec("cikis_tipi", "Çıkış Tipi", "Output Type"),
        Say("hane_sayisi", "Hane Sayısı", "Number of Digits"),

        // Elektromekanik
        Say("adim_mm", "Adım (Pitch)", "Pitch", "mm"),
        Say("sira_sayisi", "Sıra Sayısı", "Number of Rows"),
        Sec("konnektor_tipi", "Konnektör Tipi", "Connector Type"),
        Sec("yon", "Yönlendirme", "Orientation"),
        Sec("kilitleme", "Kilit Mekanizması", "Locking"),
        Say("bobin_voltaji", "Bobin Voltajı", "Coil Voltage", "V"),
        Sec("kontak_duzeni", "Kontak Düzeni", "Contact Form"),
        Say("kontak_akimi", "Kontak Akımı", "Contact Current", "A"),
        Sec("role_tipi", "Röle Tipi", "Relay Type"),
        Sec("anahtar_tipi", "Anahtar Tipi", "Switch Type"),
        Say("calisma_kuvveti", "Çalışma Kuvveti", "Actuation Force", "N"),
        Say("omur_dongu", "Mekanik Ömür", "Mechanical Life", "döngü"),

        // Sensör
        Sec("sensor_tipi", "Sensör Tipi", "Sensor Type"),
        Sec("olcum_araligi", "Ölçüm Aralığı", "Measurement Range"),
        Sec("dogruluk", "Doğruluk", "Accuracy"),

        // RF
        Sec("frekans_bandi", "Frekans Bandı", "Frequency Band"),
        Sec("protokol", "Protokol", "Protocol"),
        Say("cikis_gucu", "Çıkış Gücü", "Output Power", "dBm"),
        Sec("anten_tipi", "Anten Tipi", "Antenna Type"),

        // Devre koruma
        Say("kesme_akimi", "Kesme Akımı", "Interrupt Rating", "A"),
        Sec("tepki_suresi", "Tepki Süresi", "Response Time"),
        Say("clamping_voltaji", "Kenetleme Voltajı", "Clamping Voltage", "V"),
        Sec("koruma_tipi", "Koruma Tipi", "Protection Type"),

        // Güç kaynağı ve pil
        Say("cikis_gucu_w", "Çıkış Gücü", "Output Power", "W"),
        Sec("giris_voltaji", "Giriş Voltajı", "Input Voltage"),
        Sec("izolasyon", "İzolasyon", "Isolation"),
        Sec("pil_kimyasi", "Pil Kimyası", "Battery Chemistry"),
        Say("kapasite_mah", "Kapasite", "Capacity", "mAh"),
        Sec("pil_boyutu", "Pil Boyutu", "Battery Size"),

        // Kart ve modül
        Sec("kart_ailesi", "Kart Ailesi", "Board Family"),
        Sec("islemci", "İşlemci", "Processor"),
        Sec("konnektivite", "Bağlantı", "Connectivity"),

        // Termal / mekanik / kablo
        Sec("malzeme", "Malzeme", "Material"),
        Say("termal_direnc", "Termal Direnç", "Thermal Resistance", "°C/W"),
        Sec("boyutlar", "Boyutlar", "Dimensions"),
        Sec("ip_sinifi", "IP Koruma Sınıfı", "IP Rating"),
        Sec("fan_boyutu", "Fan Boyutu", "Fan Size"),
        Say("hava_debisi", "Hava Debisi", "Air Flow", "CFM"),
        Say("gurultu", "Gürültü Seviyesi", "Noise Level", "dBA"),
        Say("iletken_sayisi", "İletken Sayısı", "Number of Conductors"),
        Sec("awg", "Kesit (AWG)", "Wire Gauge"),
        Say("uzunluk", "Uzunluk", "Length", "m")
    ];

    // -----------------------------------------------------------------------
    // Ambalaj profilleri
    // -----------------------------------------------------------------------

    /// <summary>
    /// Ürün ailesine göre gerçekçi ambalaj seçenekleri. Bir 0603 direnç makarada
    /// 5000 adet gelir, bir DIN ray güç kaynağı kutuda 1 adet.
    /// </summary>
    public enum AmbalajProfili
    {
        /// <summary>Çip pasifler ve SMD LED: büyük makara + kesme bant.</summary>
        CipPasif,
        /// <summary>SMD entegre: makara, tüp, tepsi.</summary>
        EntegreSmd,
        /// <summary>THT entegre ve ayrık: tüp veya dökme.</summary>
        EntegreTht,
        /// <summary>Konnektör ve elektromekanik.</summary>
        Elektromekanik,
        /// <summary>Modül ve kart: kutu/tepsi, tekil satış.</summary>
        Modul,
        /// <summary>Güç kaynağı, muhafaza, soğutucu: kutuda tekil.</summary>
        Tekil
    }

    public record AmbalajSecenegi(AmbalajTipi Tip, string Ad, int Mpq, int Moq, int Katlama);

    public static readonly Dictionary<AmbalajProfili, AmbalajSecenegi[]> AmbalajlarProfilBazli = new()
    {
        [AmbalajProfili.CipPasif] =
        [
            new(AmbalajTipi.TapeReel, "Tape & Reel (TR) — 5000 adet", 5000, 5000, 5000),
            new(AmbalajTipi.CutTape, "Cut Tape (CT)", 1, 10, 1),
            new(AmbalajTipi.OzelReel, "ÇEVİK Reel — 1000 adet", 1000, 1000, 1000)
        ],
        [AmbalajProfili.EntegreSmd] =
        [
            new(AmbalajTipi.TapeReel, "Tape & Reel (TR) — 2500 adet", 2500, 2500, 2500),
            new(AmbalajTipi.CutTape, "Cut Tape (CT)", 1, 1, 1),
            new(AmbalajTipi.Tube, "Tube", 50, 50, 50),
            new(AmbalajTipi.Tray, "Tray", 160, 160, 160)
        ],
        [AmbalajProfili.EntegreTht] =
        [
            new(AmbalajTipi.Tube, "Tube", 25, 25, 25),
            new(AmbalajTipi.Bulk, "Bulk", 1, 10, 1),
            new(AmbalajTipi.Box, "Box — 100 adet", 100, 100, 100)
        ],
        [AmbalajProfili.Elektromekanik] =
        [
            new(AmbalajTipi.TapeReel, "Tape & Reel (TR) — 1000 adet", 1000, 1000, 1000),
            new(AmbalajTipi.Bulk, "Bulk", 1, 10, 1),
            new(AmbalajTipi.Box, "Box — 100 adet", 100, 100, 100)
        ],
        [AmbalajProfili.Modul] =
        [
            new(AmbalajTipi.Bulk, "Bulk", 1, 1, 1),
            new(AmbalajTipi.Tray, "Tray", 20, 20, 20),
            new(AmbalajTipi.Box, "Box — 10 adet", 10, 10, 10)
        ],
        [AmbalajProfili.Tekil] =
        [
            new(AmbalajTipi.Bulk, "Tekil", 1, 1, 1),
            new(AmbalajTipi.Box, "Box", 1, 1, 1)
        ]
    };

    // -----------------------------------------------------------------------
    // Kategori ağacı
    // -----------------------------------------------------------------------

    public record KategoriSablonu(
        string AdTr,
        string AdEn,
        string Slug,
        /// <summary>Filtre panelinde bu sırayla görünecek parametreler.</summary>
        string[] OzellikKodlari,
        /// <summary>1 adetlik liste fiyatı için gerçekçi USD bandı.</summary>
        decimal FiyatMin,
        decimal FiyatMax,
        AmbalajProfili Ambalaj);

    public record UsteKategoriSablonu(string AdTr, string AdEn, string Slug, KategoriSablonu[] Altlar);

    public static readonly UsteKategoriSablonu[] Agac =
    [
        new("Yarı İletkenler", "Semiconductors", "yari-iletkenler",
        [
            new("Mikrodenetleyiciler", "Microcontrollers", "mikrodenetleyiciler",
                ["cekirdek", "bit_sayisi", "frekans", "flash_bellek", "ram", "kilif", "pin_sayisi", "besleme_voltaji", "arayuz", "calisma_sicakligi"],
                0.45m, 24.00m, AmbalajProfili.EntegreSmd),

            new("Bellek Entegreleri", "Memory ICs", "bellek-entegreleri",
                ["bellek_tipi", "bellek_boyutu", "arayuz", "hiz", "besleme_voltaji", "kilif", "calisma_sicakligi"],
                0.18m, 14.00m, AmbalajProfili.EntegreSmd),

            new("İşlemsel Yükselteçler", "Operational Amplifiers", "islemsel-yukseltecler",
                ["kanal_sayisi", "bant_genisligi", "slew_rate", "offset_voltaji", "rail_to_rail", "besleme_voltaji", "kilif", "calisma_sicakligi"],
                0.12m, 9.50m, AmbalajProfili.EntegreSmd),

            new("Karşılaştırıcılar", "Comparators", "karsilastiricilar",
                ["kanal_sayisi", "besleme_voltaji", "cikis_tipi", "kilif", "calisma_sicakligi"],
                0.10m, 6.20m, AmbalajProfili.EntegreSmd),

            new("Veri Dönüştürücüler", "Data Converters", "veri-donusturucular",
                ["sensor_tipi", "cozunurluk", "ornekleme_hizi", "kanal_sayisi", "arayuz", "besleme_voltaji", "kilif"],
                0.90m, 38.00m, AmbalajProfili.EntegreSmd),

            new("Lojik Entegreler", "Logic ICs", "lojik-entegreler",
                ["lojik_ailesi", "lojik_fonksiyonu", "kapi_sayisi", "besleme_voltaji", "kilif", "calisma_sicakligi"],
                0.08m, 3.40m, AmbalajProfili.EntegreSmd),

            new("Arayüz Entegreleri", "Interface ICs", "arayuz-entegreleri",
                ["protokol", "kanal_sayisi", "hiz", "besleme_voltaji", "izolasyon", "kilif", "calisma_sicakligi"],
                0.35m, 12.00m, AmbalajProfili.EntegreSmd),

            new("Saat ve Zamanlayıcılar", "Clock and Timers", "saat-zamanlayicilar",
                ["sensor_tipi", "arayuz", "dogruluk", "besleme_voltaji", "kilif", "calisma_sicakligi"],
                0.20m, 8.50m, AmbalajProfili.EntegreSmd)
        ]),

        new("Güç Yönetimi", "Power Management", "guc-yonetimi",
        [
            new("Lineer Regülatörler (LDO)", "Linear Regulators (LDO)", "lineer-regulatorler",
                ["cikis_voltaji", "cikis_akimi", "giris_voltaji_max", "dropout_voltaji", "kilif", "calisma_sicakligi"],
                0.09m, 4.80m, AmbalajProfili.EntegreSmd),

            new("Anahtarlamalı Regülatörler", "Switching Regulators", "anahtarlamali-regulatorler",
                ["topoloji", "cikis_voltaji", "cikis_akimi", "giris_voltaji_max", "frekans", "verim", "kilif"],
                0.40m, 11.50m, AmbalajProfili.EntegreSmd),

            new("Gerilim Referansları", "Voltage References", "gerilim-referanslari",
                ["cikis_voltaji", "dogruluk", "sicaklik_katsayisi", "kilif", "calisma_sicakligi"],
                0.15m, 9.00m, AmbalajProfili.EntegreSmd),

            new("Motor Sürücüler", "Motor Drivers", "motor-suruculer",
                ["sensor_tipi", "cikis_akimi", "giris_voltaji_max", "kanal_sayisi", "arayuz", "kilif"],
                0.85m, 16.00m, AmbalajProfili.EntegreSmd),

            new("Gate Sürücüler", "Gate Drivers", "gate-suruculer",
                ["kanal_sayisi", "cikis_akimi", "giris_voltaji_max", "izolasyon", "kilif", "calisma_sicakligi"],
                0.45m, 9.80m, AmbalajProfili.EntegreSmd),

            new("Pil Şarj Entegreleri", "Battery Charger ICs", "pil-sarj-entegreleri",
                ["pil_kimyasi", "cikis_akimi", "giris_voltaji_max", "arayuz", "kilif"],
                0.30m, 7.50m, AmbalajProfili.EntegreSmd)
        ]),

        new("Ayrık Yarı İletkenler", "Discrete Semiconductors", "ayrik-yari-iletkenler",
        [
            new("Diyotlar", "Diodes", "diyotlar",
                ["diyot_tipi", "ters_voltaj", "ileri_akim", "ileri_voltaj", "toparlanma_suresi", "kilif", "calisma_sicakligi"],
                0.02m, 2.60m, AmbalajProfili.EntegreSmd),

            new("Zener Diyotlar", "Zener Diodes", "zener-diyotlar",
                ["zener_voltaji", "guc_derecesi", "tolerans", "kilif", "calisma_sicakligi"],
                0.02m, 1.20m, AmbalajProfili.EntegreSmd),

            new("MOSFET'ler", "MOSFETs", "mosfetler",
                ["kanal_tipi", "vds_max", "id_max", "rds_on", "vgs_esik", "kilif", "calisma_sicakligi"],
                0.06m, 14.00m, AmbalajProfili.EntegreSmd),

            new("Bipolar Transistörler", "Bipolar Transistors", "bipolar-transistorler",
                ["transistor_tipi", "vce_max", "ic_max", "hfe", "guc_derecesi", "kilif"],
                0.02m, 2.20m, AmbalajProfili.EntegreSmd),

            new("Tristör ve Triyaklar", "Thyristors and Triacs", "tristor-triyaklar",
                ["sensor_tipi", "voltaj_derecesi", "akim_derecesi", "kilif", "calisma_sicakligi"],
                0.18m, 6.40m, AmbalajProfili.EntegreTht),

            new("IGBT ve Güç Modülleri", "IGBTs and Power Modules", "igbt-guc-modulleri",
                ["voltaj_derecesi", "akim_derecesi", "kilif", "calisma_sicakligi"],
                1.60m, 68.00m, AmbalajProfili.EntegreTht)
        ]),

        new("Pasif Komponentler", "Passive Components", "pasif-komponentler",
        [
            new("SMD Dirençler", "SMD Resistors", "smd-direncler",
                ["direnc_degeri", "tolerans", "guc_derecesi", "boyut_kodu", "direnc_teknolojisi", "sicaklik_katsayisi", "calisma_sicakligi"],
                0.0015m, 0.28m, AmbalajProfili.CipPasif),

            new("THT Dirençler", "THT Resistors", "tht-direncler",
                ["direnc_degeri", "tolerans", "guc_derecesi", "direnc_teknolojisi", "calisma_sicakligi"],
                0.008m, 0.65m, AmbalajProfili.EntegreTht),

            new("Potansiyometre ve Trimpotlar", "Potentiometers and Trimmers", "potansiyometre-trimpotlar",
                ["direnc_degeri", "potansiyometre_tipi", "tur_sayisi", "tolerans", "guc_derecesi", "montaj_sekli"],
                0.14m, 8.90m, AmbalajProfili.Elektromekanik),

            new("Seramik Kondansatörler (MLCC)", "Ceramic Capacitors (MLCC)", "seramik-kondansatorler",
                ["kapasitans", "voltaj_derecesi", "dielektrik", "boyut_kodu", "tolerans", "calisma_sicakligi"],
                0.0018m, 0.95m, AmbalajProfili.CipPasif),

            new("Elektrolitik Kondansatörler", "Electrolytic Capacitors", "elektrolitik-kondansatorler",
                ["kapasitans", "voltaj_derecesi", "kondansator_tipi", "esr", "omur_saat", "boyutlar", "montaj_sekli"],
                0.03m, 6.80m, AmbalajProfili.EntegreTht),

            new("Tantal Kondansatörler", "Tantalum Capacitors", "tantal-kondansatorler",
                ["kapasitans", "voltaj_derecesi", "tolerans", "esr", "kilif", "calisma_sicakligi"],
                0.06m, 4.20m, AmbalajProfili.CipPasif),

            new("Film Kondansatörler", "Film Capacitors", "film-kondansatorler",
                ["kapasitans", "voltaj_derecesi", "tolerans", "kondansator_tipi", "adim_mm", "montaj_sekli"],
                0.05m, 5.60m, AmbalajProfili.EntegreTht),

            new("Güç Bobinleri", "Power Inductors", "guc-bobinleri",
                ["enduktans", "doyma_akimi", "dc_direnc", "tolerans", "ekranlama", "boyutlar", "montaj_sekli"],
                0.05m, 3.90m, AmbalajProfili.CipPasif),

            new("Ferrit Boncuk ve EMI Filtreler", "Ferrite Beads and EMI Filters", "ferrit-boncuklar",
                ["empedans_100mhz", "boyut_kodu", "calisma_sicakligi"],
                0.006m, 0.42m, AmbalajProfili.CipPasif),

            new("Kristal ve Osilatörler", "Crystals and Oscillators", "kristal-osilatorler",
                ["frekans", "yuk_kapasitansi", "kararlilik", "kilif", "besleme_voltaji", "calisma_sicakligi"],
                0.09m, 7.40m, AmbalajProfili.CipPasif)
        ]),

        new("Optoelektronik", "Optoelectronics", "optoelektronik",
        [
            new("SMD LED'ler", "SMD LEDs", "smd-ledler",
                ["renk", "dalga_boyu", "ileri_voltaj", "ileri_akim", "parlaklik", "gorus_acisi", "boyut_kodu", "lens_tipi"],
                0.012m, 0.85m, AmbalajProfili.CipPasif),

            new("THT LED'ler", "THT LEDs", "tht-ledler",
                ["renk", "dalga_boyu", "ileri_voltaj", "ileri_akim", "parlaklik", "gorus_acisi", "boyutlar", "lens_tipi"],
                0.02m, 0.95m, AmbalajProfili.EntegreTht),

            new("Güç LED'leri", "Power LEDs", "guc-ledleri",
                ["renk", "isik_akisi", "renk_sicakligi", "ileri_voltaj", "ileri_akim", "gorus_acisi", "kilif"],
                0.35m, 9.60m, AmbalajProfili.CipPasif),

            new("LCD ve OLED Ekranlar", "LCD and OLED Displays", "lcd-oled-ekranlar",
                ["ekran_tipi", "cozunurluk_piksel", "ekran_boyutu", "arayuz", "arka_isik", "besleme_voltaji"],
                2.40m, 58.00m, AmbalajProfili.Modul),

            new("7 Segment Göstergeler", "Seven Segment Displays", "yedi-segment-gostergeler",
                ["hane_sayisi", "renk", "ekran_boyutu", "cikis_tipi", "ileri_voltaj", "montaj_sekli"],
                0.22m, 4.80m, AmbalajProfili.EntegreTht),

            new("Optokuplörler", "Optocouplers", "optokuplorler",
                ["kanal_sayisi", "izolasyon_voltaji", "ctr", "cikis_tipi", "kilif", "calisma_sicakligi"],
                0.14m, 4.90m, AmbalajProfili.EntegreSmd),

            new("Kızılötesi Bileşenler", "Infrared Components", "kizilotesi-bilesenler",
                ["sensor_tipi", "dalga_boyu", "frekans", "besleme_voltaji", "gorus_acisi", "montaj_sekli"],
                0.10m, 3.60m, AmbalajProfili.EntegreTht)
        ]),

        new("Elektromekanik", "Electromechanical", "elektromekanik",
        [
            new("Kablo-Kart Konnektörler", "Wire-to-Board Connectors", "kablo-kart-konnektorler",
                ["konnektor_tipi", "adim_mm", "pin_sayisi", "sira_sayisi", "yon", "akim_derecesi", "voltaj_derecesi", "kilitleme"],
                0.05m, 4.20m, AmbalajProfili.Elektromekanik),

            new("Kart-Kart Konnektörler", "Board-to-Board Connectors", "kart-kart-konnektorler",
                ["konnektor_tipi", "adim_mm", "pin_sayisi", "sira_sayisi", "yon", "akim_derecesi", "montaj_sekli"],
                0.08m, 9.40m, AmbalajProfili.Elektromekanik),

            new("PCB Klemensler", "PCB Terminal Blocks", "pcb-klemensler",
                ["konnektor_tipi", "adim_mm", "pin_sayisi", "akim_derecesi", "voltaj_derecesi", "awg", "yon"],
                0.16m, 7.80m, AmbalajProfili.Elektromekanik),

            new("Arayüz Konnektörleri", "Interface Connectors", "arayuz-konnektorleri",
                ["konnektor_tipi", "pin_sayisi", "yon", "montaj_sekli", "akim_derecesi", "omur_dongu"],
                0.18m, 11.20m, AmbalajProfili.Elektromekanik),

            new("Röleler", "Relays", "roleler",
                ["role_tipi", "bobin_voltaji", "kontak_duzeni", "kontak_akimi", "voltaj_derecesi", "montaj_sekli"],
                0.45m, 18.50m, AmbalajProfili.Elektromekanik),

            new("Tactile Butonlar", "Tactile Switches", "tactile-butonlar",
                ["anahtar_tipi", "calisma_kuvveti", "omur_dongu", "akim_derecesi", "boyutlar", "montaj_sekli"],
                0.06m, 1.90m, AmbalajProfili.Elektromekanik),

            new("Anahtar ve Enkoderler", "Switches and Encoders", "anahtar-enkoderler",
                ["anahtar_tipi", "kontak_duzeni", "akim_derecesi", "voltaj_derecesi", "omur_dongu", "montaj_sekli"],
                0.22m, 12.40m, AmbalajProfili.Elektromekanik)
        ]),

        new("Sensörler", "Sensors", "sensorler",
        [
            new("Sıcaklık ve Nem Sensörleri", "Temperature and Humidity Sensors", "sicaklik-nem-sensorleri",
                ["sensor_tipi", "olcum_araligi", "dogruluk", "arayuz", "besleme_voltaji", "kilif"],
                0.55m, 22.00m, AmbalajProfili.EntegreSmd),

            new("Basınç Sensörleri", "Pressure Sensors", "basinc-sensorleri",
                ["sensor_tipi", "olcum_araligi", "dogruluk", "arayuz", "besleme_voltaji", "kilif"],
                1.80m, 46.00m, AmbalajProfili.EntegreSmd),

            new("Hareket ve IMU Sensörleri", "Motion and IMU Sensors", "hareket-imu-sensorleri",
                ["sensor_tipi", "olcum_araligi", "kanal_sayisi", "arayuz", "besleme_voltaji", "kilif"],
                1.20m, 28.00m, AmbalajProfili.EntegreSmd),

            new("Optik ve Yakınlık Sensörleri", "Optical and Proximity Sensors", "optik-yakinlik-sensorleri",
                ["sensor_tipi", "olcum_araligi", "dalga_boyu", "arayuz", "besleme_voltaji", "kilif"],
                0.65m, 19.50m, AmbalajProfili.EntegreSmd),

            new("Akım Sensörleri", "Current Sensors", "akim-sensorleri",
                ["sensor_tipi", "olcum_araligi", "izolasyon_voltaji", "arayuz", "besleme_voltaji", "kilif"],
                0.90m, 16.80m, AmbalajProfili.EntegreSmd),

            new("Gaz ve Hava Kalitesi Sensörleri", "Gas and Air Quality Sensors", "gaz-hava-kalitesi",
                ["sensor_tipi", "olcum_araligi", "arayuz", "besleme_voltaji", "montaj_sekli"],
                2.20m, 42.00m, AmbalajProfili.Modul),

            new("NTC ve PTC Termistörler", "NTC and PTC Thermistors", "termistorler",
                ["direnc_degeri", "tolerans", "sensor_tipi", "olcum_araligi", "boyut_kodu", "montaj_sekli"],
                0.05m, 2.40m, AmbalajProfili.CipPasif)
        ]),

        new("Kablosuz ve RF", "Wireless and RF", "kablosuz-rf",
        [
            new("Wi-Fi ve Bluetooth Modülleri", "Wi-Fi and Bluetooth Modules", "wifi-bluetooth-modulleri",
                ["protokol", "frekans_bandi", "cikis_gucu", "arayuz", "besleme_voltaji", "anten_tipi", "boyutlar"],
                1.40m, 32.00m, AmbalajProfili.Modul),

            new("LoRa ve Sub-GHz Modüller", "LoRa and Sub-GHz Modules", "lora-subghz-modulleri",
                ["protokol", "frekans_bandi", "cikis_gucu", "arayuz", "besleme_voltaji", "anten_tipi"],
                2.60m, 28.00m, AmbalajProfili.Modul),

            new("GNSS Modülleri", "GNSS Modules", "gnss-modulleri",
                ["protokol", "frekans_bandi", "dogruluk", "arayuz", "besleme_voltaji", "anten_tipi"],
                4.50m, 74.00m, AmbalajProfili.Modul),

            new("Hücresel Modüller", "Cellular Modules", "hucresel-modulleri",
                ["protokol", "frekans_bandi", "cikis_gucu", "arayuz", "besleme_voltaji", "boyutlar"],
                6.80m, 96.00m, AmbalajProfili.Modul),

            new("Antenler", "Antennas", "antenler",
                ["anten_tipi", "frekans_bandi", "cikis_gucu", "konnektor_tipi", "montaj_sekli", "boyutlar"],
                0.35m, 24.00m, AmbalajProfili.Elektromekanik)
        ]),

        new("Devre Koruma", "Circuit Protection", "devre-koruma",
        [
            new("Sigortalar", "Fuses", "sigortalar",
                ["akim_derecesi", "voltaj_derecesi", "kesme_akimi", "tepki_suresi", "boyutlar", "montaj_sekli"],
                0.05m, 3.20m, AmbalajProfili.Elektromekanik),

            new("PTC Sigortalar", "Resettable PTC Fuses", "ptc-sigortalar",
                ["akim_derecesi", "voltaj_derecesi", "boyut_kodu", "montaj_sekli"],
                0.06m, 2.10m, AmbalajProfili.CipPasif),

            new("Varistörler", "Varistors", "varistorler",
                ["voltaj_derecesi", "clamping_voltaji", "kesme_akimi", "boyutlar", "montaj_sekli"],
                0.09m, 4.60m, AmbalajProfili.EntegreTht),

            new("TVS ve ESD Koruma", "TVS and ESD Protection", "tvs-esd-koruma",
                ["koruma_tipi", "voltaj_derecesi", "clamping_voltaji", "kanal_sayisi", "kilif", "calisma_sicakligi"],
                0.04m, 2.80m, AmbalajProfili.EntegreSmd)
        ]),

        new("Güç Kaynakları", "Power Supplies", "guc-kaynaklari",
        [
            new("AC-DC Güç Kaynakları", "AC-DC Power Supplies", "ac-dc-guc-kaynaklari",
                ["cikis_gucu_w", "cikis_voltaji", "cikis_akimi", "giris_voltaji", "verim", "ip_sinifi", "boyutlar"],
                6.50m, 148.00m, AmbalajProfili.Tekil),

            new("DIN Ray Güç Kaynakları", "DIN Rail Power Supplies", "din-ray-guc-kaynaklari",
                ["cikis_gucu_w", "cikis_voltaji", "cikis_akimi", "giris_voltaji", "verim", "boyutlar"],
                14.00m, 210.00m, AmbalajProfili.Tekil),

            new("DC-DC Konvertör Modülleri", "DC-DC Converter Modules", "dc-dc-konvertor-modulleri",
                ["topoloji", "cikis_gucu_w", "cikis_voltaji", "cikis_akimi", "giris_voltaji", "izolasyon", "verim"],
                1.80m, 62.00m, AmbalajProfili.Modul),

            new("Piller ve Tutucular", "Batteries and Holders", "piller-tutucular",
                ["pil_kimyasi", "pil_boyutu", "voltaj_derecesi", "kapasite_mah", "montaj_sekli"],
                0.18m, 14.50m, AmbalajProfili.Elektromekanik)
        ]),

        new("Geliştirme Kartları", "Development Boards", "gelistirme-kartlari",
        [
            new("Geliştirme Kartları", "Development Boards", "gelistirme-kartlari-urun",
                ["kart_ailesi", "islemci", "konnektivite", "besleme_voltaji", "arayuz", "boyutlar"],
                4.00m, 96.00m, AmbalajProfili.Modul),

            new("Programlayıcı ve Debugger", "Programmers and Debuggers", "programlayici-debugger",
                ["kart_ailesi", "protokol", "arayuz", "besleme_voltaji"],
                6.00m, 420.00m, AmbalajProfili.Modul),

            new("Genişletme Kartları", "Shields and HATs", "genisletme-kartlari",
                ["kart_ailesi", "konnektivite", "arayuz", "besleme_voltaji", "boyutlar"],
                3.20m, 48.00m, AmbalajProfili.Modul)
        ]),

        new("Termal ve Mekanik", "Thermal and Mechanical", "termal-mekanik",
        [
            new("Soğutucular", "Heatsinks", "sogutucular",
                ["malzeme", "termal_direnc", "boyutlar", "kilif", "montaj_sekli"],
                0.28m, 26.00m, AmbalajProfili.Tekil),

            new("Fanlar", "Fans", "fanlar",
                ["fan_boyutu", "besleme_voltaji", "hava_debisi", "gurultu", "boyutlar", "ip_sinifi"],
                3.40m, 46.00m, AmbalajProfili.Tekil),

            new("Muhafazalar", "Enclosures", "muhafazalar",
                ["malzeme", "boyutlar", "ip_sinifi", "renk", "montaj_sekli"],
                2.10m, 88.00m, AmbalajProfili.Tekil),

            new("Montaj Donanımları", "Mounting Hardware", "montaj-donanimlari",
                ["malzeme", "boyutlar", "adim_mm", "montaj_sekli"],
                0.05m, 3.80m, AmbalajProfili.Elektromekanik)
        ]),

        new("Kablo ve Bağlantı", "Cable and Wire", "kablo-baglanti",
        [
            new("Jumper ve Test Kabloları", "Jumper and Test Leads", "jumper-test-kablolari",
                ["iletken_sayisi", "awg", "uzunluk", "konnektor_tipi", "renk"],
                0.85m, 18.00m, AmbalajProfili.Tekil),

            new("Şerit Kablolar", "Ribbon Cables", "serit-kablolar",
                ["iletken_sayisi", "awg", "adim_mm", "uzunluk", "renk"],
                0.90m, 34.00m, AmbalajProfili.Tekil),

            new("Kablo Yönetimi", "Cable Management", "kablo-yonetimi",
                ["malzeme", "boyutlar", "renk", "calisma_sicakligi"],
                0.04m, 12.00m, AmbalajProfili.Tekil)
        ])
    ];
}
