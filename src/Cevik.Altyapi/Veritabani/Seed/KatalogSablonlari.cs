using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed;

/// <summary>
/// Sentetik katalogun "gerçeğe benzemesini" sağlayan şablonlar.
///
/// Neden gerekli: önceki seed, ürün kodu olarak EAN13 barkodu
/// (<c>Faker.Commerce.Ean13()</c>) ve ürün adı olarak mobilya isimleri üretiyordu.
/// Bu veriyle ne "STM32F1 yazınca bul" araması, ne de parametrik filtre
/// gösterilebiliyordu — oysa projenin ayırt edici iki özelliği bunlar.
///
/// Kod ön eki ÜRETİCİYE bağlıdır: STM32F… kodlu bir parçanın üreticisi
/// STMicroelectronics olmalı, Texas Instruments değil. Açıklama da rastgele
/// üç parametreyi değil, o kategori için anlamlı olan parametreleri kullanır.
///
/// Veri hâlâ sentetiktir (ozdisan.com'dan kazınmamıştır); yalnızca yapısı
/// gerçek bir komponent kataloğunu taklit eder.
/// </summary>
public static class KatalogSablonlari
{
    public record OzellikSablonu(
        string Kod,
        string AdTr,
        string AdEn,
        OzellikVeriTipi VeriTipi,
        string? Birim,
        OzellikGosterimTipi GosterimTipi,
        string[] Degerler);

    /// <summary>Üretici ve o üreticinin bu kategorideki ürün kodu deseni.</summary>
    public record UreticiSablonu(string Ad, string KodOnEki);

    public record KategoriSablonu(
        string AdTr,
        string AdEn,
        string Slug,
        UreticiSablonu[] Ureticiler,
        /// <summary>Açıklamanın başındaki tip kısaltması: "MCU", "RES SMD"…</summary>
        string AciklamaOnEki,
        /// <summary>Açıklamada bu sırayla yer alacak özellik kodları.</summary>
        string[] AciklamaOzellikKodlari,
        /// <summary>Kategorinin filtre panelinde görünecek tüm parametreler.</summary>
        string[] OzellikKodlari);

    public record UsteKategoriSablonu(string AdTr, string AdEn, string Slug, KategoriSablonu[] Altlar);

    // -----------------------------------------------------------------------
    // Özellik sözlüğü — kategoriler bunlara koddan referans verir
    // -----------------------------------------------------------------------
    public static readonly OzellikSablonu[] Ozellikler =
    [
        new("cekirdek", "Çekirdek", "Core", OzellikVeriTipi.Secim, null, OzellikGosterimTipi.OnayKutusu,
            ["ARM Cortex-M0+", "ARM Cortex-M3", "ARM Cortex-M4", "ARM Cortex-M7", "AVR", "RISC-V", "8051"]),

        new("bit_sayisi", "Bit Sayısı", "Bit Count", OzellikVeriTipi.Secim, "Bit", OzellikGosterimTipi.OnayKutusu,
            ["8 Bit", "16 Bit", "32 Bit", "64 Bit"]),

        new("frekans", "Çalışma Frekansı", "Clock Frequency", OzellikVeriTipi.Sayi, "MHz", OzellikGosterimTipi.AralikKaydiraci,
            ["8", "16", "24", "48", "72", "84", "100", "120", "168", "216", "240", "480"]),

        new("flash_bellek", "Flash Bellek", "Flash Memory", OzellikVeriTipi.Sayi, "kB", OzellikGosterimTipi.AralikKaydiraci,
            ["8", "16", "32", "64", "128", "256", "512", "1024", "2048"]),

        new("ram", "RAM", "RAM", OzellikVeriTipi.Sayi, "kB", OzellikGosterimTipi.AralikKaydiraci,
            ["2", "4", "8", "16", "20", "32", "64", "128", "256", "512"]),

        new("kilif", "Kılıf / Paket", "Package", OzellikVeriTipi.Secim, null, OzellikGosterimTipi.OnayKutusu,
            ["LQFP48 (7x7mm)", "LQFP64 (10x10mm)", "LQFP100 (14x14mm)", "TSSOP20", "SOIC-8", "QFN32 (5x5mm)", "BGA144", "DIP-40"]),

        new("besleme_voltaji", "Besleme Voltajı", "Supply Voltage", OzellikVeriTipi.Secim, "V", OzellikGosterimTipi.OnayKutusu,
            ["1.8 V", "2.0 - 3.6 V", "2.7 - 5.5 V", "3.0 - 3.6 V", "4.5 - 5.5 V"]),

        new("calisma_sicakligi", "Çalışma Sıcaklığı", "Operating Temperature", OzellikVeriTipi.Secim, "°C", OzellikGosterimTipi.OnayKutusu,
            ["0 ~ +70 (Ticari)", "-40 ~ +85 (Endüstriyel)", "-40 ~ +105", "-55 ~ +125 (Askeri)"]),

        new("direnc_degeri", "Direnç Değeri", "Resistance", OzellikVeriTipi.Secim, "Ω", OzellikGosterimTipi.OnayKutusu,
            ["10 Ω", "100 Ω", "220 Ω", "470 Ω", "1 kΩ", "2.2 kΩ", "4.7 kΩ", "10 kΩ", "47 kΩ", "100 kΩ", "1 MΩ"]),

        new("tolerans", "Tolerans", "Tolerance", OzellikVeriTipi.Secim, "%", OzellikGosterimTipi.OnayKutusu,
            ["±0.1%", "±0.5%", "±1%", "±2%", "±5%", "±10%"]),

        new("guc_derecesi", "Güç Derecesi", "Power Rating", OzellikVeriTipi.Secim, "W", OzellikGosterimTipi.OnayKutusu,
            ["1/16 W", "1/10 W", "1/8 W", "1/4 W", "1/2 W", "1 W", "2 W"]),

        new("boyut_kodu", "Boyut Kodu", "Case Code", OzellikVeriTipi.Secim, null, OzellikGosterimTipi.OnayKutusu,
            ["0201", "0402", "0603", "0805", "1206", "1210", "2010", "2512"]),

        new("kapasitans", "Kapasitans", "Capacitance", OzellikVeriTipi.Secim, "µF", OzellikGosterimTipi.OnayKutusu,
            ["0.1 µF", "0.22 µF", "0.47 µF", "1 µF", "2.2 µF", "4.7 µF", "10 µF", "22 µF", "47 µF", "100 µF", "470 µF"]),

        new("voltaj_derecesi", "Voltaj Derecesi", "Voltage Rating", OzellikVeriTipi.Secim, "V", OzellikGosterimTipi.OnayKutusu,
            ["6.3 V", "10 V", "16 V", "25 V", "35 V", "50 V", "100 V", "250 V"]),

        new("dielektrik", "Dielektrik", "Dielectric", OzellikVeriTipi.Secim, null, OzellikGosterimTipi.OnayKutusu,
            ["X7R", "X5R", "C0G / NP0", "Y5V", "Alüminyum Elektrolitik", "Tantal"]),

        new("kanal_sayisi", "Kanal Sayısı", "Channel Count", OzellikVeriTipi.Secim, null, OzellikGosterimTipi.OnayKutusu,
            ["1", "2", "4", "8"]),

        new("cikis_akimi", "Çıkış Akımı", "Output Current", OzellikVeriTipi.Secim, "A", OzellikGosterimTipi.OnayKutusu,
            ["0.1 A", "0.5 A", "1 A", "1.5 A", "3 A", "5 A"]),

        new("arayuz", "Arayüz", "Interface", OzellikVeriTipi.Secim, null, OzellikGosterimTipi.OnayKutusu,
            ["I2C", "SPI", "UART", "CAN", "USB", "Ethernet"])
    ];

    // -----------------------------------------------------------------------
    // Kategori ağacı — 4 kök, 12 yaprak
    // -----------------------------------------------------------------------
    public static readonly UsteKategoriSablonu[] Agac =
    [
        new("Yarı İletkenler", "Semiconductors", "yari-iletkenler",
        [
            new("Mikrodenetleyiciler", "Microcontrollers", "mikrodenetleyiciler",
                [
                    new("STMicroelectronics", "STM32F"),
                    new("Microchip", "PIC18F"),
                    new("NXP", "LPC17"),
                    new("Renesas", "R5F10"),
                    new("Texas Instruments", "MSP430F")
                ],
                "MCU",
                ["bit_sayisi", "frekans", "flash_bellek", "kilif"],
                ["cekirdek", "bit_sayisi", "frekans", "flash_bellek", "ram", "kilif", "besleme_voltaji", "calisma_sicakligi", "arayuz"]),

            new("İşlemsel Yükselteçler", "Operational Amplifiers", "islemsel-yukselcetler",
                [
                    new("Texas Instruments", "OPA"),
                    new("Analog Devices", "AD8"),
                    new("STMicroelectronics", "TSV"),
                    new("onsemi", "LM")
                ],
                "IC OPAMP",
                ["kanal_sayisi", "besleme_voltaji", "kilif"],
                ["kanal_sayisi", "besleme_voltaji", "kilif", "calisma_sicakligi"]),

            new("Gerilim Regülatörleri", "Voltage Regulators", "gerilim-regulatorleri",
                [
                    new("Texas Instruments", "TPS7A"),
                    new("onsemi", "NCP"),
                    new("Diodes Inc", "AP2112"),
                    new("Microchip", "MCP17")
                ],
                "IC REG LDO",
                ["cikis_akimi", "besleme_voltaji", "kilif"],
                ["cikis_akimi", "besleme_voltaji", "kilif", "calisma_sicakligi"]),

            new("Lojik Entegreler", "Logic ICs", "lojik-entegreler",
                [
                    new("Texas Instruments", "SN74HC"),
                    new("NXP", "74HCT"),
                    new("onsemi", "MC14"),
                    new("Diodes Inc", "74LVC")
                ],
                "IC LOJIK",
                ["kanal_sayisi", "besleme_voltaji", "kilif"],
                ["kanal_sayisi", "besleme_voltaji", "kilif", "calisma_sicakligi"])
        ]),

        new("Pasif Komponentler", "Passive Components", "pasif-komponentler",
        [
            new("Dirençler", "Resistors", "direncler",
                [
                    new("Yageo", "RC"),
                    new("Vishay", "CRCW"),
                    new("Panasonic", "ERJ"),
                    new("KOA Speer", "RK73"),
                    new("Bourns", "CR")
                ],
                "RES SMD",
                ["direnc_degeri", "tolerans", "guc_derecesi", "boyut_kodu"],
                ["direnc_degeri", "tolerans", "guc_derecesi", "boyut_kodu", "calisma_sicakligi"]),

            new("Kondansatörler", "Capacitors", "kondansatorler",
                [
                    new("Samsung Electro-Mechanics", "CL"),
                    new("Murata", "GRM"),
                    new("TDK", "C160"),
                    new("Nichicon", "UWT"),
                    new("KEMET", "C032")
                ],
                "CAP",
                ["kapasitans", "voltaj_derecesi", "dielektrik", "boyut_kodu"],
                ["kapasitans", "voltaj_derecesi", "dielektrik", "boyut_kodu", "tolerans"]),

            new("Bobinler ve Ferritler", "Inductors and Ferrites", "bobinler-ferritler",
                [
                    new("Murata", "LQM"),
                    new("TDK", "MLZ"),
                    new("Wurth Elektronik", "WE744"),
                    new("Bourns", "SRN")
                ],
                "IND",
                ["boyut_kodu", "tolerans"],
                ["boyut_kodu", "tolerans", "calisma_sicakligi"])
        ]),

        new("Optoelektronik", "Optoelectronics", "optoelektronik",
        [
            new("LED'ler", "LEDs", "ledler",
                [
                    new("Lite-On", "LTST"),
                    new("Kingbright", "KP"),
                    new("Cree", "CLM"),
                    new("OSRAM", "LGL"),
                    new("Broadcom", "HSMx")
                ],
                "LED",
                ["boyut_kodu", "voltaj_derecesi"],
                ["boyut_kodu", "voltaj_derecesi", "calisma_sicakligi"]),

            new("Ekranlar", "Displays", "ekranlar",
                [
                    new("Newhaven Display", "NHD"),
                    new("Winstar", "WH"),
                    new("Displaytech", "DT")
                ],
                "LCD",
                ["arayuz", "besleme_voltaji"],
                ["besleme_voltaji", "arayuz", "calisma_sicakligi"])
        ]),

        new("Elektromekanik", "Electromechanical", "elektromekanik",
        [
            new("Konnektörler", "Connectors", "konnektorler",
                [
                    new("JST", "SM"),
                    new("Molex", "MOLEX53"),
                    new("TE Connectivity", "TE164"),
                    new("Amphenol", "AMP10"),
                    new("Hirose", "DF13")
                ],
                "KONN",
                ["kanal_sayisi", "voltaj_derecesi"],
                ["kanal_sayisi", "voltaj_derecesi", "calisma_sicakligi"]),

            new("Röleler", "Relays", "roleler",
                [
                    new("Omron", "G5V"),
                    new("Panasonic", "TQ2"),
                    new("TE Connectivity", "RT1"),
                    new("Finder", "FIN36")
                ],
                "ROLE",
                ["besleme_voltaji", "cikis_akimi"],
                ["besleme_voltaji", "cikis_akimi", "calisma_sicakligi"]),

            new("Anahtarlar ve Butonlar", "Switches and Buttons", "anahtarlar-butonlar",
                [
                    new("C&K", "PTS"),
                    new("Omron", "B3F"),
                    new("Alps Alpine", "SKQG"),
                    new("E-Switch", "TL3")
                ],
                "SWITCH",
                ["cikis_akimi", "voltaj_derecesi"],
                ["cikis_akimi", "voltaj_derecesi", "calisma_sicakligi"])
        ])
    ];

    /// <summary>Ambalaj tipi başına tipik MPQ/MOQ/katlama değerleri.</summary>
    public static readonly (AmbalajTipi Tip, string Ad, int Mpq, int Moq, int Katlama)[] AmbalajSecenekleri =
    [
        (AmbalajTipi.TapeReel, "Tape & Reel (TR)", 3000, 3000, 3000),
        (AmbalajTipi.CutTape,  "Cut Tape (CT)",       1,    1,    1),
        (AmbalajTipi.OzelReel, "ÇEVİK Reel",       1000,  100,  100),
        (AmbalajTipi.Tube,     "Tube",               50,   50,   50),
        (AmbalajTipi.Tray,     "Tray",              160,  160,  160),
        (AmbalajTipi.Bulk,     "Bulk",                1,   10,    1),
        (AmbalajTipi.Box,      "Box",               100,  100,  100)
    ];
}
