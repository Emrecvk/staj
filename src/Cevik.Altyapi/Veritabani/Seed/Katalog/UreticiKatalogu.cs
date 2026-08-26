namespace Cevik.Altyapi.Veritabani.Seed.Katalog;

/// <summary>
/// Katalogda geçen üretici markalarının ana listesi.
///
/// Adlar, web adresleri ve ülkeler gerçektir; "YetkiliDistributorMu" ise bu projeye
/// ait ticari bir bilgidir ve seed'de sabit tutulur (rastgele atanmaz, çünkü rozet
/// ürün kartında görünen bir iddiadır ve her kurulumda değişmesi anlamsızdır).
///
/// Bu liste <see cref="ParcaKatalogu"/> içindeki parçaların UreticiAd alanıyla
/// birebir eşleşir; eşleşmeyen bir ad seed sırasında hata olarak raporlanır.
/// </summary>
public static class UreticiKatalogu
{
    public sealed record UreticiKaydi(
        string Ad,
        string Alan,
        string Ulke,
        string Aciklama,
        bool YetkiliDistributor = false);

    public static readonly UreticiKaydi[] Hepsi =
    [
        // ---------------------------------------------------------------
        // Yarı iletken — genel amaçlı
        // ---------------------------------------------------------------
        new("STMicroelectronics", "st.com", "İsviçre/İtalya",
            "STM32 mikrodenetleyiciler, analog ve güç yarı iletkenleri.", true),
        new("Texas Instruments", "ti.com", "ABD",
            "Analog, güç yönetimi, lojik ve gömülü işlemci üreticisi.", true),
        new("Analog Devices", "analog.com", "ABD",
            "Yüksek performanslı analog, karma sinyal ve DSP çözümleri."),
        new("Maxim Integrated", "analog.com", "ABD",
            "Analog Devices bünyesindeki analog ve arayüz entegre ailesi."),
        new("Microchip Technology", "microchip.com", "ABD",
            "PIC ve AVR mikrodenetleyiciler, bellek ve analog entegreler.", true),
        new("NXP Semiconductors", "nxp.com", "Hollanda",
            "Otomotiv ve endüstriyel mikrodenetleyici, arayüz ve NFC ürünleri."),
        new("Infineon Technologies", "infineon.com", "Almanya",
            "Güç yarı iletkenleri, MOSFET, IGBT ve otomotiv çözümleri.", true),
        new("onsemi", "onsemi.com", "ABD",
            "Ayrık yarı iletken, güç yönetimi ve görüntü sensörleri."),
        new("Renesas Electronics", "renesas.com", "Japonya",
            "Mikrodenetleyici, analog ve güç yönetimi entegreleri."),
        new("Toshiba", "toshiba.semicon-storage.com", "Japonya",
            "Ayrık yarı iletkenler, optokuplörler ve motor sürücüler."),
        new("ROHM Semiconductor", "rohm.com", "Japonya",
            "Analog güç, LED sürücü ve SiC yarı iletkenler."),
        new("Nexperia", "nexperia.com", "Hollanda",
            "Ayrık yarı iletken, lojik ve ESD koruma bileşenleri.", true),
        new("Diodes Incorporated", "diodes.com", "ABD",
            "Ayrık yarı iletken, lojik ve güç yönetimi ürünleri."),
        new("Vishay", "vishay.com", "ABD",
            "Direnç, kondansatör, diyot ve MOSFET üreticisi.", true),
        new("Alpha & Omega Semiconductor", "aosmd.com", "ABD",
            "Güç MOSFET ve güç yönetimi entegreleri."),
        new("Monolithic Power Systems", "monolithicpower.com", "ABD",
            "Yüksek verimli DC-DC dönüştürücü entegreleri."),
        new("Richtek", "richtek.com", "Tayvan",
            "Güç yönetimi ve DC-DC dönüştürücü entegreleri."),
        new("Silicon Labs", "silabs.com", "ABD",
            "Kablosuz SoC, mikrodenetleyici ve zamanlama çözümleri."),
        new("Nordic Semiconductor", "nordicsemi.com", "Norveç",
            "Bluetooth Low Energy ve kablosuz SoC üreticisi."),
        new("Espressif Systems", "espressif.com", "Çin",
            "ESP32 ve ESP8266 Wi-Fi/Bluetooth SoC ve modülleri.", true),
        new("Raspberry Pi", "raspberrypi.com", "Birleşik Krallık",
            "RP2040 mikrodenetleyici ve tek kart bilgisayarlar."),
        new("WCH", "wch-ic.com", "Çin",
            "USB arayüz entegreleri ve RISC-V mikrodenetleyiciler."),
        new("FTDI", "ftdichip.com", "Birleşik Krallık",
            "USB-seri köprü entegreleri."),
        new("Holtek", "holtek.com", "Tayvan",
            "Düşük maliyetli mikrodenetleyici ve regülatörler."),
        new("Nuvoton", "nuvoton.com", "Tayvan",
            "ARM Cortex-M mikrodenetleyiciler ve 8051 türevleri."),
        new("GigaDevice", "gigadevice.com", "Çin",
            "GD32 mikrodenetleyiciler ve SPI NOR flash bellekler."),

        // ---------------------------------------------------------------
        // Bellek
        // ---------------------------------------------------------------
        new("Winbond", "winbond.com", "Tayvan",
            "SPI NOR flash ve özel DRAM ürünleri."),
        new("Micron Technology", "micron.com", "ABD",
            "DRAM, NAND ve NOR bellek üreticisi."),
        new("ISSI", "issi.com", "ABD",
            "SRAM, DRAM ve flash bellek çözümleri."),
        new("Alliance Memory", "alliancememory.com", "ABD",
            "Uzun ömürlü SRAM, DRAM ve flash bellekler."),
        new("Macronix", "macronix.com", "Tayvan",
            "NOR ve NAND flash bellek üreticisi."),

        // ---------------------------------------------------------------
        // Pasif — direnç
        // ---------------------------------------------------------------
        new("Yageo", "yageo.com", "Tayvan",
            "Çip direnç, MLCC ve endüktans üreticisi.", true),
        new("KOA Speer", "koaspeer.com", "Japonya/ABD",
            "Yüksek güvenilirlikli çip direnç ve şönt dirençler."),
        new("Bourns", "bourns.com", "ABD",
            "Direnç, trimpot, endüktans ve devre koruma ürünleri.", true),
        new("Panasonic", "industrial.panasonic.com", "Japonya",
            "Direnç, kondansatör, röle ve endüstriyel bileşenler.", true),
        new("Susumu", "susumu.co.jp", "Japonya",
            "Hassas ince film çip dirençler."),
        new("TE Connectivity", "te.com", "İsviçre",
            "Konnektör, röle, sensör ve pasif bileşenler.", true),

        // ---------------------------------------------------------------
        // Pasif — kondansatör
        // ---------------------------------------------------------------
        new("KEMET", "kemet.com", "ABD",
            "Seramik, tantal ve film kondansatör üreticisi.", true),
        new("Kyocera AVX", "kyocera-avx.com", "ABD/Japonya",
            "MLCC, tantal kondansatör ve konnektör üreticisi."),
        new("Murata", "murata.com", "Japonya",
            "MLCC, endüktans, ferrit ve RF modül üreticisi.", true),
        new("Samsung Electro-Mechanics", "samsungsem.com", "Güney Kore",
            "Yüksek kapasiteli MLCC ve endüktans üreticisi."),
        new("TDK", "tdk.com", "Japonya",
            "MLCC, ferrit, endüktans ve sensör üreticisi."),
        new("Taiyo Yuden", "yuden.co.jp", "Japonya",
            "MLCC ve güç endüktansları."),
        new("Nichicon", "nichicon.co.jp", "Japonya",
            "Alüminyum elektrolitik kondansatör üreticisi."),
        new("Rubycon", "rubycon.co.jp", "Japonya",
            "Düşük ESR alüminyum elektrolitik kondansatörler."),
        new("Würth Elektronik", "we-online.com", "Almanya",
            "Pasif bileşen, konnektör ve EMC çözümleri.", true),
        new("EPCOS", "tdk-electronics.tdk.com", "Almanya",
            "TDK bünyesindeki film kondansatör ve varistör markası."),
        new("Illinois Capacitor", "illinoiscapacitor.com", "ABD",
            "Elektrolitik ve film kondansatörler."),
        new("Cornell Dubilier", "cde.com", "ABD",
            "Endüstriyel film ve elektrolitik kondansatörler."),

        // ---------------------------------------------------------------
        // Pasif — endüktans, ferrit, kristal
        // ---------------------------------------------------------------
        new("Coilcraft", "coilcraft.com", "ABD",
            "Yüksek performanslı güç ve RF endüktansları."),
        new("Abracon", "abracon.com", "ABD",
            "Kristal, osilatör, rezonatör ve anten ürünleri."),
        new("Epson", "epsondevice.com", "Japonya",
            "Kuvars kristal ve gerçek zamanlı saat entegreleri."),
        new("NDK", "ndk.com", "Japonya",
            "Kuvars kristal birimleri ve osilatörler."),
        new("IQD", "iqdfrequencyproducts.com", "Birleşik Krallık",
            "Frekans kontrol ürünleri ve TCXO'lar."),
        new("CTS", "ctscorp.com", "ABD",
            "Kristal, DIP anahtar ve sensör ürünleri."),

        // ---------------------------------------------------------------
        // Optoelektronik
        // ---------------------------------------------------------------
        new("Lite-On", "liteon.com", "Tayvan",
            "LED, optokuplör ve optik sensör üreticisi.", true),
        new("Kingbright", "kingbright.com", "Tayvan",
            "LED, 7 segment gösterge ve LED matris üreticisi.", true),
        new("Everlight", "everlight.com", "Tayvan",
            "LED, optokuplör ve IR bileşenleri."),
        new("Wolfspeed", "wolfspeed.com", "ABD",
            "Yüksek parlaklıklı LED ve SiC güç ürünleri."),
        new("ams-OSRAM", "ams-osram.com", "Avusturya/Almanya",
            "Optik sensör ve yüksek güçlü LED üreticisi."),
        new("Broadcom", "broadcom.com", "ABD",
            "Optokuplör, optik enkoder ve fiber optik bileşenler."),
        new("Nichia", "nichia.co.jp", "Japonya",
            "Yüksek verimli beyaz LED üreticisi."),
        new("Vishay Semiconductor", "vishay.com", "ABD",
            "IR alıcı-verici, optokuplör ve optik sensörler."),
        new("Newhaven Display", "newhavendisplay.com", "ABD",
            "Karakter LCD, grafik LCD, OLED ve TFT ekranlar."),
        new("Winstar Display", "winstar.com.tw", "Tayvan",
            "LCD, OLED ve TFT ekran modülleri."),
        new("Displaytech", "displaytech-us.com", "ABD",
            "Karakter ve grafik LCD modülleri."),
        new("Sharp", "sharpsde.com", "Japonya",
            "Memory LCD ve optoelektronik bileşenler."),
        new("Solomon Systech", "solomon-systech.com", "Hong Kong",
            "OLED ve LCD ekran sürücü entegreleri."),

        // ---------------------------------------------------------------
        // Elektromekanik
        // ---------------------------------------------------------------
        new("JST", "jst-mfg.com", "Japonya",
            "Kablo-kart ve kart-kart konnektör sistemleri.", true),
        new("Molex", "molex.com", "ABD",
            "Konnektör, kablo demeti ve arayüz çözümleri.", true),
        new("Amphenol", "amphenol.com", "ABD",
            "Endüstriyel, RF ve kart konnektörleri."),
        new("Hirose", "hirose.com", "Japonya",
            "Minyatür kart-kart ve kablo-kart konnektörleri."),
        new("Samtec", "samtec.com", "ABD",
            "Yüksek hızlı kart-kart konnektör sistemleri."),
        new("Harwin", "harwin.com", "Birleşik Krallık",
            "Yüksek güvenilirlikli konnektör ve pin sistemleri."),
        new("Phoenix Contact", "phoenixcontact.com", "Almanya",
            "Klemens, endüstriyel konnektör ve otomasyon ürünleri.", true),
        new("Weidmüller", "weidmueller.com", "Almanya",
            "Endüstriyel klemens ve bağlantı teknolojisi."),
        new("WAGO", "wago.com", "Almanya",
            "Yaylı klemens ve otomasyon bağlantı ürünleri."),
        new("Degson", "degson.com", "Çin",
            "PCB klemens ve endüstriyel konnektörler."),
        new("Omron", "components.omron.com", "Japonya",
            "Röle, anahtar ve endüstriyel otomasyon bileşenleri.", true),
        new("Panasonic Electric Works", "industrial.panasonic.com", "Japonya",
            "Sinyal röleleri ve elektromekanik bileşenler."),
        new("Hongfa", "hongfa.com", "Çin",
            "Güç ve sinyal röleleri."),
        new("Finder", "findernet.com", "İtalya",
            "Endüstriyel röle ve zaman rölesi üreticisi."),
        new("Songle", "songle.com", "Çin",
            "Ekonomik güç röleleri."),
        new("C&K", "ckswitches.com", "ABD",
            "Tactile buton, anahtar ve DIP anahtar üreticisi."),
        new("Alps Alpine", "alpsalpine.com", "Japonya",
            "Enkoder, tactile anahtar ve potansiyometreler."),
        new("E-Switch", "e-switch.com", "ABD",
            "Tactile buton, toggle ve rocker anahtarlar."),
        new("NKK Switches", "nkkswitches.com", "Japonya",
            "Endüstriyel anahtar ve kontrol bileşenleri."),
        new("Keystone Electronics", "keyelco.com", "ABD",
            "Pil tutucu, terminal ve kart donanımları."),

        // ---------------------------------------------------------------
        // Sensör
        // ---------------------------------------------------------------
        new("Bosch Sensortec", "bosch-sensortec.com", "Almanya",
            "MEMS ivmeölçer, basınç ve çevre sensörleri.", true),
        new("Sensirion", "sensirion.com", "İsviçre",
            "Nem, sıcaklık ve akış sensörleri."),
        new("Melexis", "melexis.com", "Belçika",
            "Hall etkili ve kızılötesi sıcaklık sensörleri."),
        new("Honeywell", "honeywell.com", "ABD",
            "Basınç, akım ve konum sensörleri."),
        new("TDK InvenSense", "invensense.tdk.com", "ABD",
            "MEMS IMU ve mikrofon sensörleri."),
        new("Aosong", "aosong.com", "Çin",
            "Sıcaklık ve nem sensör modülleri."),
        new("Sensata", "sensata.com", "ABD",
            "Endüstriyel basınç ve sıcaklık sensörleri."),
        new("Allegro MicroSystems", "allegromicro.com", "ABD",
            "Hall etkili akım sensörleri ve motor sürücüler."),

        // ---------------------------------------------------------------
        // Kablosuz / RF
        // ---------------------------------------------------------------
        new("u-blox", "u-blox.com", "İsviçre",
            "GNSS, hücresel ve kısa menzilli kablosuz modüller."),
        new("Quectel", "quectel.com", "Çin",
            "LTE, NB-IoT ve GNSS modülleri."),
        new("SIMCom", "simcom.com", "Çin",
            "GSM, LTE ve GNSS haberleşme modülleri."),
        new("HopeRF", "hoperf.com", "Çin",
            "LoRa ve Sub-GHz RF transceiver modülleri."),
        new("Ai-Thinker", "ai-thinker.com", "Çin",
            "Wi-Fi, Bluetooth ve LoRa modül üreticisi."),
        new("Taoglas", "taoglas.com", "İrlanda",
            "Gömülü ve harici anten çözümleri."),
        new("Linx Technologies", "linxtechnologies.com", "ABD",
            "RF anten ve kablosuz modüller."),
        new("Semtech", "semtech.com", "ABD",
            "LoRa transceiver ve koruma entegreleri."),
        new("LEM", "lem.com", "İsviçre",
            "Endüstriyel akım ve gerilim transdüserleri."),

        // ---------------------------------------------------------------
        // Devre koruma
        // ---------------------------------------------------------------
        new("Littelfuse", "littelfuse.com", "ABD",
            "Sigorta, TVS, varistör ve devre koruma ürünleri.", true),
        new("Bel Fuse", "belfuse.com", "ABD",
            "Sigorta, güç modülü ve manyetik bileşenler."),
        new("Schurter", "schurter.com", "İsviçre",
            "Sigorta, EMC filtre ve giriş modülleri."),
        new("Eaton", "eaton.com", "İrlanda/ABD",
            "Süperkapasitör, sigorta ve devre koruma."),

        // ---------------------------------------------------------------
        // Güç kaynağı ve enerji
        // ---------------------------------------------------------------
        new("MEAN WELL", "meanwell.com", "Tayvan",
            "AC-DC güç kaynağı ve DIN ray güç modülleri.", true),
        new("RECOM Power", "recom-power.com", "Avusturya",
            "İzoleli ve izolesiz DC-DC dönüştürücü modülleri."),
        new("Traco Power", "tracopower.com", "İsviçre",
            "Endüstriyel DC-DC ve AC-DC güç modülleri."),
        new("XP Power", "xppower.com", "Birleşik Krallık",
            "AC-DC ve DC-DC güç dönüştürücüleri."),
        new("CUI Inc", "cui.com", "ABD",
            "Güç modülleri, fanlar ve ses bileşenleri."),
        new("Delta Electronics", "deltaww.com", "Tayvan",
            "Güç kaynakları, fanlar ve termal çözümler."),
        new("Varta", "varta-ag.com", "Almanya",
            "Şarj edilebilir ve birincil pil hücreleri."),
        new("EVE Energy", "evebattery.com", "Çin",
            "Lityum birincil ve şarjlı pil hücreleri."),

        // ---------------------------------------------------------------
        // Termal ve mekanik
        // ---------------------------------------------------------------
        new("Fischer Elektronik", "fischerelektronik.de", "Almanya",
            "Soğutucu profiller ve elektronik mekanik parçaları."),
        new("Aavid", "boydcorp.com", "ABD",
            "Termal yönetim ve soğutucu çözümleri."),
        new("Wakefield-Vette", "wakefieldthermal.com", "ABD",
            "Soğutucu ve termal arayüz malzemeleri."),
        new("Sunon", "sunon.com", "Tayvan",
            "DC fan ve blower üreticisi."),
        new("Hammond Manufacturing", "hammfg.com", "Kanada",
            "Elektronik muhafaza ve kabin üreticisi."),
        new("Bopla", "bopla.de", "Almanya",
            "Plastik ve alüminyum cihaz muhafazaları."),
        new("Bergquist", "henkel.com", "ABD",
            "Termal arayüz pedleri ve macunları."),

        // ---------------------------------------------------------------
        // Geliştirme kartları ve araçlar
        // ---------------------------------------------------------------
        new("Arduino", "arduino.cc", "İtalya",
            "Açık kaynak geliştirme kartları ve kalkanlar.", true),
        new("SEGGER", "segger.com", "Almanya",
            "J-Link debug probları ve gömülü yazılım araçları."),
        new("Adafruit", "adafruit.com", "ABD",
            "Breakout kart ve maker elektroniği."),
        new("SparkFun", "sparkfun.com", "ABD",
            "Geliştirme kartları ve sensör breakout'ları."),
        new("Waveshare", "waveshare.com", "Çin",
            "Ekran modülleri, HAT'ler ve geliştirme kartları."),
        new("DFRobot", "dfrobot.com", "Çin",
            "Robotik ve IoT geliştirme modülleri."),

        // ---------------------------------------------------------------
        // Kablo ve montaj
        // ---------------------------------------------------------------
        new("Alpha Wire", "alphawire.com", "ABD",
            "Endüstriyel kablo ve tel ürünleri."),
        new("LAPP", "lapp.com", "Almanya",
            "Endüstriyel kablo, rakor ve konnektör sistemleri."),
        new("3M", "3m.com", "ABD",
            "Şerit kablo, bant ve elektronik montaj malzemeleri."),
        new("Panduit", "panduit.com", "ABD",
            "Kablo yönetimi ve tanımlama ürünleri.")
    ];
}
