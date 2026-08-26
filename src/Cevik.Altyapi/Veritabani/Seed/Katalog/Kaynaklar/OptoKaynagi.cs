using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Optoelektronik — LED, ekran, 7 segment gösterge, optokuplör ve kızılötesi bileşenler.
///
/// LED sipariş kodlarında renk/lens/parlaklık alanları üreticiye özgü harf gruplarıyla
/// kodlanır (LTST-C170<b>KGKT</b>, APT1608<b>SURCK</b>) ve bu grupların tamamı serbest
/// kombinasyon değildir. Bu yüzden burada üretim değil, gerçek kodların listesi vardır.
/// </summary>
public static class OptoKaynagi
{
    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in SmdLedler()) yield return p;
        foreach (var p in ThtLedler()) yield return p;
        foreach (var p in GucLedleri()) yield return p;
        foreach (var p in Ekranlar()) yield return p;
        foreach (var p in YediSegment()) yield return p;
        foreach (var p in Optokuplorler()) yield return p;
        foreach (var p in KizilotesiBilesenler()) yield return p;
    }

    // -----------------------------------------------------------------------
    // SMD LED
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> SmdLedler()
    {
        // (üretici, MPN, renk, dalga boyu nm, VF, IF mA, parlaklık mcd, görüş açısı, kılıf, lens)
        (string Uretici, string Mpn, string Renk, decimal Nm, decimal Vf, decimal Ima, decimal Mcd, decimal Aci, string Kilif, string Lens)[] liste =
        [
            ("Lite-On", "LTST-C170KRKT", "Kırmızı", 631m, 2.0m, 20m, 45m, 130m, "0805", "Su Berraklığında"),
            ("Lite-On", "LTST-C170KGKT", "Yeşil", 571m, 2.2m, 20m, 25m, 130m, "0805", "Su Berraklığında"),
            ("Lite-On", "LTST-C170KFKT", "Turuncu", 605m, 2.0m, 20m, 40m, 130m, "0805", "Su Berraklığında"),
            ("Lite-On", "LTST-C170CKT", "Sarı", 588m, 2.0m, 20m, 25m, 130m, "0805", "Su Berraklığında"),
            ("Lite-On", "LTST-C170TBKT", "Mavi", 470m, 3.2m, 20m, 40m, 130m, "0805", "Su Berraklığında"),
            ("Lite-On", "LTST-C190KRKT", "Kırmızı", 631m, 2.0m, 20m, 35m, 130m, "0603", "Su Berraklığında"),
            ("Lite-On", "LTST-C190GKT", "Yeşil", 571m, 2.2m, 20m, 20m, 130m, "0603", "Su Berraklığında"),
            ("Lite-On", "LTST-C190CKT", "Sarı", 588m, 2.0m, 20m, 20m, 130m, "0603", "Su Berraklığında"),
            ("Lite-On", "LTST-C191KRKT", "Kırmızı", 631m, 2.0m, 20m, 35m, 130m, "0603", "Su Berraklığında"),
            ("Lite-On", "LTST-C191KGKT", "Yeşil", 571m, 2.2m, 20m, 22m, 130m, "0603", "Su Berraklığında"),
            ("Lite-On", "LTST-C191TBKT", "Mavi", 470m, 3.2m, 20m, 35m, 130m, "0603", "Su Berraklığında"),
            ("Lite-On", "LTST-C230KRKT", "Kırmızı", 631m, 2.0m, 20m, 20m, 130m, "0603 Yandan", "Su Berraklığında"),
            ("Lite-On", "LTST-C930KRKT", "Kırmızı", 631m, 2.0m, 20m, 8m, 130m, "0402", "Su Berraklığında"),
            ("Lite-On", "LTST-C930KGKT", "Yeşil", 571m, 2.2m, 20m, 6m, 130m, "0402", "Su Berraklığında"),
            ("Lite-On", "LTST-S270KGKT", "Yeşil", 571m, 2.2m, 20m, 40m, 120m, "1206", "Su Berraklığında"),

            ("Kingbright", "APT1608SURCK", "Kırmızı", 631m, 2.0m, 20m, 180m, 130m, "0603", "Su Berraklığında"),
            ("Kingbright", "APT1608CGCK", "Yeşil", 574m, 2.2m, 20m, 90m, 130m, "0603", "Su Berraklığında"),
            ("Kingbright", "APT1608SECK", "Turuncu", 610m, 2.0m, 20m, 120m, 130m, "0603", "Su Berraklığında"),
            ("Kingbright", "APT1608YC", "Sarı", 588m, 2.1m, 20m, 30m, 130m, "0603", "Renkli Şeffaf"),
            ("Kingbright", "APT1608QBC/D", "Mavi", 468m, 3.1m, 20m, 60m, 130m, "0603", "Su Berraklığında"),
            ("Kingbright", "APT1608LVBC/D", "Beyaz", 0m, 3.2m, 20m, 200m, 130m, "0603", "Su Berraklığında"),
            ("Kingbright", "KP-2012SURCK", "Kırmızı", 631m, 2.0m, 20m, 120m, 120m, "0805", "Su Berraklığında"),
            ("Kingbright", "KP-2012SGC", "Yeşil", 568m, 2.2m, 20m, 25m, 120m, "0805", "Renkli Şeffaf"),
            ("Kingbright", "KP-2012YC", "Sarı", 588m, 2.1m, 20m, 20m, 120m, "0805", "Renkli Şeffaf"),
            ("Kingbright", "KP-3216SURCK", "Kırmızı", 631m, 2.0m, 20m, 150m, 120m, "1206", "Su Berraklığında"),
            ("Kingbright", "AA3528SURCK", "Kırmızı", 631m, 2.0m, 20m, 220m, 120m, "PLCC-2 3528", "Su Berraklığında"),
            ("Kingbright", "AA3528ZGC", "Yeşil", 574m, 2.2m, 20m, 180m, 120m, "PLCC-2 3528", "Su Berraklığında"),
            ("Kingbright", "APHHS1005SURCK", "Kırmızı", 631m, 2.0m, 20m, 45m, 130m, "0402", "Su Berraklığında"),
            ("Kingbright", "APHHS1005CGCK", "Yeşil", 574m, 2.2m, 20m, 32m, 130m, "0402", "Su Berraklığında"),
            ("Kingbright", "AAA3528SEEZGKQBKS", "RGB", 0m, 3.2m, 20m, 180m, 120m, "PLCC-6 3528", "Su Berraklığında"),

            ("Würth Elektronik", "150060RS75000", "Kırmızı", 630m, 2.0m, 20m, 100m, 120m, "0603", "Su Berraklığında"),
            ("Würth Elektronik", "150060GS75000", "Yeşil", 570m, 3.2m, 20m, 100m, 120m, "0603", "Su Berraklığında"),
            ("Würth Elektronik", "150060BS75000", "Mavi", 470m, 3.2m, 20m, 65m, 120m, "0603", "Su Berraklığında"),
            ("Würth Elektronik", "150060YS75000", "Sarı", 587m, 2.0m, 20m, 60m, 120m, "0603", "Su Berraklığında"),
            ("Würth Elektronik", "150060VS75000", "Beyaz", 0m, 3.2m, 20m, 250m, 120m, "0603", "Su Berraklığında"),
            ("Würth Elektronik", "150080RS75000", "Kırmızı", 630m, 2.0m, 20m, 180m, 120m, "0805", "Su Berraklığında"),
            ("Würth Elektronik", "150080GS75000", "Yeşil", 570m, 3.2m, 20m, 180m, 120m, "0805", "Su Berraklığında"),
            ("Würth Elektronik", "150141RS73100", "Kırmızı", 630m, 2.0m, 20m, 285m, 130m, "1206", "Su Berraklığında"),

            ("Everlight", "17-21SURC/S530-A2/TR8", "Kırmızı", 631m, 2.0m, 20m, 180m, 130m, "0805", "Su Berraklığında"),
            ("Everlight", "19-217/R6C-AL1M2VY/3T", "Kırmızı", 630m, 2.0m, 20m, 90m, 130m, "0603", "Su Berraklığında"),
            ("Everlight", "19-213/GHC-YR1S2/3T", "Yeşil", 525m, 3.0m, 20m, 220m, 130m, "0603", "Su Berraklığında"),
            ("Everlight", "19-217/BHC-ZL1M2RY/3T", "Mavi", 470m, 3.0m, 20m, 110m, 130m, "0603", "Su Berraklığında"),
            ("Broadcom", "HSMS-C170", "Kırmızı", 638m, 2.0m, 20m, 40m, 130m, "0805", "Su Berraklığında"),
            ("Broadcom", "HSMG-C170", "Yeşil", 574m, 2.2m, 20m, 30m, 130m, "0805", "Su Berraklığında"),
            ("Nichia", "NSSW157AT-P1", "Beyaz", 0m, 3.0m, 20m, 1_400m, 120m, "PLCC-2 3528", "Su Berraklığında")
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("renk", x.Renk),
                new("ileri_voltaj", $"{ParcaKodlama.AnlamliBasamak(x.Vf, 3)} V", x.Vf),
                new("ileri_akim", $"{ParcaKodlama.AnlamliBasamak(x.Ima, 4)} mA", x.Ima / 1000m),
                new("parlaklik", $"{ParcaKodlama.AnlamliBasamak(x.Mcd, 5)} mcd", x.Mcd),
                new("gorus_acisi", $"{ParcaKodlama.AnlamliBasamak(x.Aci, 3)}°", x.Aci),
                new("boyut_kodu", x.Kilif),
                new("lens_tipi", x.Lens)
            };

            // Beyaz ve RGB LED'lerde tek bir baskın dalga boyu yoktur.
            if (x.Nm > 0m)
                ozellikler.Insert(1, new ParcaOzelligi("dalga_boyu", $"{ParcaKodlama.AnlamliBasamak(x.Nm, 4)} nm", x.Nm));

            yield return new HamParca(
                "smd-ledler", x.Uretici, x.Mpn,
                $"LED {x.Renk} {ParcaKodlama.AnlamliBasamak(x.Mcd, 5)}mcd {ParcaKodlama.AnlamliBasamak(x.Vf, 3)}V {x.Kilif}",
                MontajTipi.Smt, ozellikler);
        }
    }

    // -----------------------------------------------------------------------
    // THT LED
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> ThtLedler()
    {
        (string Uretici, string Mpn, string Renk, decimal Nm, decimal Vf, decimal Ima, decimal Mcd, decimal Aci, string Boyut, string Lens)[] liste =
        [
            ("Kingbright", "WP7113SRD/J3", "Kırmızı", 660m, 1.85m, 20m, 80m, 30m, "5 mm", "Renkli Şeffaf"),
            ("Kingbright", "WP7113SRC/E", "Kırmızı", 631m, 2.0m, 20m, 2_500m, 30m, "5 mm", "Su Berraklığında"),
            ("Kingbright", "WP7113GD", "Yeşil", 568m, 2.2m, 20m, 30m, 30m, "5 mm", "Renkli Şeffaf"),
            ("Kingbright", "WP7113YD", "Sarı", 585m, 2.1m, 20m, 30m, 30m, "5 mm", "Renkli Şeffaf"),
            ("Kingbright", "WP7113SEC/J3", "Turuncu", 610m, 2.0m, 20m, 900m, 30m, "5 mm", "Renkli Şeffaf"),
            ("Kingbright", "WP7113QBC/D", "Mavi", 468m, 3.3m, 20m, 800m, 30m, "5 mm", "Su Berraklığında"),
            ("Kingbright", "WP7113PWC/J3", "Beyaz", 0m, 3.2m, 20m, 5_000m, 30m, "5 mm", "Su Berraklığında"),
            ("Kingbright", "WP7113ZGC/G", "Yeşil (Saf)", 525m, 3.2m, 20m, 3_500m, 30m, "5 mm", "Su Berraklığında"),
            ("Kingbright", "L-53SRC-E", "Kırmızı", 631m, 2.0m, 20m, 3_000m, 30m, "5 mm", "Su Berraklığında"),
            ("Kingbright", "L-53GD", "Yeşil", 568m, 2.2m, 20m, 20m, 60m, "5 mm", "Renkli Şeffaf"),
            ("Kingbright", "L-53LID", "Kırmızı (Yüksek Verim)", 625m, 2.0m, 20m, 100m, 60m, "5 mm", "Renkli Şeffaf"),
            ("Kingbright", "L-7113SRD-A", "Kırmızı", 660m, 1.85m, 20m, 100m, 30m, "5 mm", "Renkli Şeffaf"),
            ("Kingbright", "WP3A8HD", "Kırmızı", 697m, 2.0m, 20m, 4m, 60m, "3 mm", "Renkli Şeffaf"),
            ("Kingbright", "WP132XID", "Kırmızı (Yüksek Verim)", 625m, 2.0m, 20m, 20m, 60m, "3 mm", "Renkli Şeffaf"),
            ("Kingbright", "L-934SRD", "Kırmızı", 660m, 1.85m, 20m, 25m, 60m, "3 mm", "Renkli Şeffaf"),
            ("Kingbright", "L-934GD", "Yeşil", 568m, 2.2m, 20m, 8m, 60m, "3 mm", "Renkli Şeffaf"),
            ("Kingbright", "L-934HD", "Kırmızı", 697m, 2.0m, 20m, 2m, 60m, "3 mm", "Renkli Şeffaf"),
            ("Kingbright", "WP154A4SUREQBFZGC", "RGB (Ortak Anot)", 0m, 3.2m, 20m, 1_800m, 30m, "5 mm", "Su Berraklığında"),
            ("Kingbright", "L-115WEGW", "İki Renkli Kırmızı / Yeşil", 0m, 2.2m, 20m, 30m, 60m, "5 mm", "Renkli Şeffaf"),

            ("Lite-On", "LTL-4266N", "Kırmızı", 635m, 2.0m, 20m, 40m, 60m, "3 mm", "Renkli Şeffaf"),
            ("Lite-On", "LTL-307EE", "Kırmızı", 627m, 2.0m, 20m, 15m, 60m, "3 mm", "Renkli Şeffaf"),
            ("Lite-On", "LTL2R3KRD", "Kırmızı", 660m, 1.85m, 20m, 3m, 60m, "5 mm", "Renkli Şeffaf"),
            ("Everlight", "IR333C", "Kızılötesi", 940m, 1.35m, 100m, 0m, 20m, "5 mm", "Su Berraklığında"),
            ("Vishay Semiconductor", "TLHR5400", "Kırmızı", 632m, 2.0m, 20m, 130m, 30m, "5 mm", "Renkli Şeffaf"),
            ("Vishay Semiconductor", "TLHG5400", "Yeşil", 565m, 2.2m, 20m, 90m, 30m, "5 mm", "Renkli Şeffaf"),
            ("Würth Elektronik", "151051RS04000", "Kırmızı", 630m, 2.0m, 20m, 300m, 30m, "5 mm", "Su Berraklığında"),
            ("Würth Elektronik", "151031RS04000", "Kırmızı", 630m, 2.0m, 20m, 150m, 30m, "3 mm", "Su Berraklığında")
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("renk", x.Renk),
                new("ileri_voltaj", $"{ParcaKodlama.AnlamliBasamak(x.Vf, 3)} V", x.Vf),
                new("ileri_akim", $"{ParcaKodlama.AnlamliBasamak(x.Ima, 4)} mA", x.Ima / 1000m),
                new("gorus_acisi", $"{ParcaKodlama.AnlamliBasamak(x.Aci, 3)}°", x.Aci),
                new("boyutlar", x.Boyut),
                new("lens_tipi", x.Lens)
            };

            if (x.Nm > 0m)
                ozellikler.Insert(1, new ParcaOzelligi("dalga_boyu", $"{ParcaKodlama.AnlamliBasamak(x.Nm, 4)} nm", x.Nm));

            if (x.Mcd > 0m)
                ozellikler.Add(new ParcaOzelligi("parlaklik", $"{ParcaKodlama.AnlamliBasamak(x.Mcd, 5)} mcd", x.Mcd));

            yield return new HamParca(
                "tht-ledler", x.Uretici, x.Mpn,
                $"LED {x.Renk} {x.Boyut} {ParcaKodlama.AnlamliBasamak(x.Vf, 3)}V DELIKLI",
                MontajTipi.Tht, ozellikler);
        }
    }

    // -----------------------------------------------------------------------
    // Güç LED'leri
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> GucLedleri()
    {
        (string Uretici, string Mpn, string Renk, decimal Lumen, decimal Kelvin, decimal Vf, decimal Ima, decimal Aci, string Kilif)[] liste =
        [
            ("Wolfspeed", "XPEBRD-L1-0000-00901", "Kırmızı", 62m, 0m, 2.2m, 350m, 130m, "XLamp XP-E 3.45x3.45 mm"),
            ("Wolfspeed", "XPEBBL-L1-0000-00201", "Mavi", 32m, 0m, 3.2m, 350m, 130m, "XLamp XP-E 3.45x3.45 mm"),
            ("Wolfspeed", "XPEBGR-L1-0000-00E01", "Yeşil", 114m, 0m, 3.2m, 350m, 130m, "XLamp XP-E 3.45x3.45 mm"),
            ("Wolfspeed", "XPGDWT-01-0000-00HE7", "Beyaz (Soğuk)", 139m, 6_000m, 3.0m, 350m, 125m, "XLamp XP-G3 3.45x3.45 mm"),
            ("Wolfspeed", "XPLAWT-00-0000-000LT40E7", "Beyaz (Nötr)", 220m, 4_000m, 2.85m, 700m, 120m, "XLamp XP-L 3.45x3.45 mm"),
            ("Wolfspeed", "CLM3C-WKW-CWbYb453", "Beyaz (Soğuk)", 100m, 5_000m, 3.0m, 150m, 120m, "3535"),

            ("ams-OSRAM", "LCW CQ7P.CC-KTLP-5L7N-1", "Beyaz (Soğuk)", 155m, 5_650m, 3.1m, 350m, 120m, "OSLON Square 3.0x3.0 mm"),
            ("ams-OSRAM", "LCW JNSH.EC-BTCP-5L7N-1", "Beyaz (Soğuk)", 114m, 5_650m, 3.1m, 350m, 120m, "OSLON Compact 1.9x1.4 mm"),
            ("ams-OSRAM", "LR CP7P-JTKQ-1-0-350-R18", "Kırmızı", 68m, 0m, 2.2m, 350m, 150m, "OSLON SSL 3.0x3.0 mm"),
            ("ams-OSRAM", "LB CP7P-GZHY-35-0-350-R18", "Mavi", 30m, 0m, 3.2m, 350m, 150m, "OSLON SSL 3.0x3.0 mm"),
            ("ams-OSRAM", "GW JDSMS1.EC-FTFU-5H7I-1", "Beyaz (Sıcak)", 150m, 3_000m, 2.9m, 350m, 120m, "DURIS S 5 5.0x5.0 mm"),

            ("Nichia", "NCSW170D-V1", "Beyaz (Soğuk)", 130m, 5_000m, 3.0m, 350m, 120m, "3535"),
            ("Nichia", "NVSW219CT", "Beyaz (Nötr)", 320m, 4_000m, 3.1m, 700m, 120m, "3535"),
            ("Nichia", "NSPWR70CSS-K1", "Beyaz (Soğuk)", 20m, 6_500m, 3.1m, 30m, 120m, "5 mm"),

            ("Everlight", "ELSH-J61G1-0LPGS-C6A8", "Beyaz (Soğuk)", 100m, 6_000m, 3.1m, 350m, 120m, "3535"),
            ("Lite-On", "LTPL-C034UVH365", "UV-A", 0m, 0m, 3.6m, 500m, 120m, "3535"),
            ("Würth Elektronik", "154354VS03000", "Beyaz (Nötr)", 110m, 4_000m, 3.1m, 350m, 120m, "3535"),
            ("Würth Elektronik", "153351GS03000", "Yeşil", 90m, 0m, 3.2m, 350m, 120m, "3535"),
            ("Broadcom", "ASMT-JW21-NRS01", "Beyaz (Soğuk)", 100m, 5_650m, 3.2m, 350m, 120m, "3535")
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("renk", x.Renk),
                new("ileri_voltaj", $"{ParcaKodlama.AnlamliBasamak(x.Vf, 3)} V", x.Vf),
                new("ileri_akim", $"{ParcaKodlama.AnlamliBasamak(x.Ima, 4)} mA", x.Ima / 1000m),
                new("gorus_acisi", $"{ParcaKodlama.AnlamliBasamak(x.Aci, 3)}°", x.Aci),
                new("kilif", x.Kilif)
            };

            if (x.Lumen > 0m)
                ozellikler.Insert(1, new ParcaOzelligi("isik_akisi", $"{ParcaKodlama.AnlamliBasamak(x.Lumen, 4)} lm", x.Lumen));

            if (x.Kelvin > 0m)
                ozellikler.Insert(2, new ParcaOzelligi("renk_sicakligi", $"{ParcaKodlama.AnlamliBasamak(x.Kelvin, 5)} K", x.Kelvin));

            yield return new HamParca(
                "guc-ledleri", x.Uretici, x.Mpn,
                $"GÜÇ LED {x.Renk} {(x.Lumen > 0m ? ParcaKodlama.AnlamliBasamak(x.Lumen, 4) + "lm " : "")}{ParcaKodlama.AnlamliBasamak(x.Ima, 4)}mA {x.Kilif}",
                MontajTipi.Smt, ozellikler);
        }
    }

    // -----------------------------------------------------------------------
    // Ekranlar
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Ekranlar()
    {
        (string Uretici, string Mpn, string Tip, string Cozunurluk, decimal Inc, string Arayuz, string ArkaIsik, string Besleme)[] liste =
        [
            ("Newhaven Display", "NHD-0216K1Z-FL-YBW", "Karakter LCD (STN)", "16 x 2 karakter", 2.6m, "Paralel 4/8 Bit", "Sarı-Yeşil LED", "5 V"),
            ("Newhaven Display", "NHD-0216K1Z-NSW-BBW-L", "Karakter LCD (STN Negatif)", "16 x 2 karakter", 2.6m, "Paralel 4/8 Bit", "Beyaz LED", "5 V"),
            ("Newhaven Display", "NHD-0420D3Z-NSW-BBW-V3", "Karakter LCD (Seri)", "20 x 4 karakter", 3.8m, "I2C / SPI / RS-232", "Beyaz LED", "5 V"),
            ("Newhaven Display", "NHD-C0216CiZ-FSW-FBW-3V3", "Karakter LCD (COG)", "16 x 2 karakter", 1.8m, "I2C", "Beyaz LED", "3.3 V"),
            ("Newhaven Display", "NHD-0216HZ-FSW-FBW-33V3C", "Karakter LCD (FSTN)", "16 x 2 karakter", 2.6m, "Paralel 4/8 Bit", "Beyaz LED", "3.3 V"),
            ("Newhaven Display", "NHD-0.96-12864DZW-M", "OLED Grafik", "128 x 64 piksel", 0.96m, "I2C / SPI", "Arka ışıksız (OLED)", "3.3 V"),
            ("Newhaven Display", "NHD-2.7-12864WDW3", "OLED Grafik", "128 x 64 piksel", 2.7m, "Paralel / SPI", "Arka ışıksız (OLED)", "3.3 V"),
            ("Newhaven Display", "NHD-1.69-160128ASC3", "TFT Renkli", "160 x 128 piksel", 1.69m, "SPI", "Beyaz LED", "3.3 V"),
            ("Newhaven Display", "NHD-2.4-240320CF-CTXI#-F", "TFT Renkli (Dokunmatik)", "240 x 320 piksel", 2.4m, "Paralel / SPI", "Beyaz LED", "3.3 V"),
            ("Newhaven Display", "NHD-3.5-320240MF-ASXV#-CTP", "TFT Renkli (Kapasitif Dokunmatik)", "320 x 240 piksel", 3.5m, "Paralel 16/18 Bit", "Beyaz LED", "3.3 V"),

            ("Winstar Display", "WH1602A-YYH-JT#", "Karakter LCD (STN)", "16 x 2 karakter", 2.6m, "Paralel 4/8 Bit", "Sarı-Yeşil LED", "5 V"),
            ("Winstar Display", "WH1602B-TMI-JT#", "Karakter LCD (STN Negatif)", "16 x 2 karakter", 2.6m, "Paralel 4/8 Bit", "Mavi LED", "5 V"),
            ("Winstar Display", "WH2004A-YYH-JT#", "Karakter LCD (STN)", "20 x 4 karakter", 3.8m, "Paralel 4/8 Bit", "Sarı-Yeşil LED", "5 V"),
            ("Winstar Display", "WH0802A1-TMI-JT#", "Karakter LCD (STN Negatif)", "8 x 2 karakter", 1.6m, "Paralel 4/8 Bit", "Mavi LED", "5 V"),
            ("Winstar Display", "WEH001602ALPP5N00000", "Karakter OLED", "16 x 2 karakter", 2.6m, "Paralel / SPI", "Arka ışıksız (OLED)", "3.0 - 5.0 V"),
            ("Winstar Display", "WEO012864DLPP3N00000", "OLED Grafik", "128 x 64 piksel", 2.42m, "Paralel / SPI / I2C", "Arka ışıksız (OLED)", "3.0 V"),
            ("Winstar Display", "WO12864B1-TFH#", "Grafik LCD (STN)", "128 x 64 piksel", 3.0m, "Paralel 8 Bit", "Beyaz LED", "5 V"),
            ("Winstar Display", "WF35LTIACDNN0", "TFT Renkli", "320 x 240 piksel", 3.5m, "Paralel 24 Bit", "Beyaz LED", "3.3 V"),
            ("Winstar Display", "WF43VTIAEDNT0", "TFT Renkli (Dokunmatik)", "480 x 272 piksel", 4.3m, "Paralel 24 Bit", "Beyaz LED", "3.3 V"),

            ("Displaytech", "162A-BC-BC", "Karakter LCD (STN)", "16 x 2 karakter", 2.6m, "Paralel 4/8 Bit", "Mavi LED", "5 V"),
            ("Displaytech", "204A-BC-BC", "Karakter LCD (STN)", "20 x 4 karakter", 3.8m, "Paralel 4/8 Bit", "Mavi LED", "5 V"),
            ("Displaytech", "64128N FC BW-3", "Grafik LCD (FSTN)", "128 x 64 piksel", 3.0m, "Paralel / SPI", "Beyaz LED", "3.3 V"),

            ("Sharp", "LS013B7DH03", "Memory LCD", "128 x 128 piksel", 1.28m, "SPI", "Yansımalı (arka ışıksız)", "3.0 - 5.0 V"),
            ("Sharp", "LS027B7DH01A", "Memory LCD", "400 x 240 piksel", 2.7m, "SPI", "Yansımalı (arka ışıksız)", "3.0 - 5.0 V"),

            ("Solomon Systech", "SSD1306Z", "OLED Sürücü Entegresi", "128 x 64 piksel", 0m, "I2C / SPI / Paralel", "—", "1.65 - 3.3 V"),
            ("Solomon Systech", "SSD1963QL9", "TFT Sürücü Entegresi", "864 x 480 piksel", 0m, "Paralel", "—", "3.3 V"),
            ("Waveshare", "12915", "e-Paper Modül", "296 x 128 piksel", 2.9m, "SPI", "Yansımalı (arka ışıksız)", "3.3 V"),
            ("Waveshare", "13353", "e-Paper Modül", "800 x 480 piksel", 7.5m, "SPI", "Yansımalı (arka ışıksız)", "3.3 V")
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("ekran_tipi", x.Tip),
                new("cozunurluk_piksel", x.Cozunurluk),
                new("arayuz", x.Arayuz),
                new("arka_isik", x.ArkaIsik),
                new("besleme_voltaji", x.Besleme)
            };

            if (x.Inc > 0m)
                ozellikler.Insert(2, new ParcaOzelligi("ekran_boyutu", $"{ParcaKodlama.AnlamliBasamak(x.Inc, 3)} inç", x.Inc));

            yield return new HamParca(
                "lcd-oled-ekranlar", x.Uretici, x.Mpn,
                $"EKRAN {x.Tip} {x.Cozunurluk} {x.Arayuz}",
                MontajTipi.Yok, ozellikler);
        }
    }

    // -----------------------------------------------------------------------
    // 7 segment gösterge
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> YediSegment()
    {
        (string Uretici, string Mpn, int Hane, string Renk, decimal Inc, string Ortak, decimal Vf)[] liste =
        [
            ("Kingbright", "SC56-11EWA", 1, "Kırmızı (Yüksek Verim)", 0.56m, "Ortak Katot", 2.0m),
            ("Kingbright", "SA56-11EWA", 1, "Kırmızı (Yüksek Verim)", 0.56m, "Ortak Anot", 2.0m),
            ("Kingbright", "SC56-11SRWA", 1, "Süper Kırmızı", 0.56m, "Ortak Katot", 1.85m),
            ("Kingbright", "SA56-11SRWA", 1, "Süper Kırmızı", 0.56m, "Ortak Anot", 1.85m),
            ("Kingbright", "SC56-11GWA", 1, "Yeşil", 0.56m, "Ortak Katot", 2.2m),
            ("Kingbright", "SA56-11GWA", 1, "Yeşil", 0.56m, "Ortak Anot", 2.2m),
            ("Kingbright", "SC56-11YWA", 1, "Sarı", 0.56m, "Ortak Katot", 2.1m),
            ("Kingbright", "SC39-11EWA", 1, "Kırmızı (Yüksek Verim)", 0.39m, "Ortak Katot", 2.0m),
            ("Kingbright", "SA39-11EWA", 1, "Kırmızı (Yüksek Verim)", 0.39m, "Ortak Anot", 2.0m),
            ("Kingbright", "SC52-11EWA", 1, "Kırmızı (Yüksek Verim)", 0.52m, "Ortak Katot", 2.0m),
            ("Kingbright", "SC08-11EWA", 1, "Kırmızı (Yüksek Verim)", 0.8m, "Ortak Katot", 2.0m),
            ("Kingbright", "SC10-21SRWA", 1, "Süper Kırmızı", 1.0m, "Ortak Katot", 3.7m),
            ("Kingbright", "DC56-11EWA", 2, "Kırmızı (Yüksek Verim)", 0.56m, "Ortak Katot", 2.0m),
            ("Kingbright", "DA56-11EWA", 2, "Kırmızı (Yüksek Verim)", 0.56m, "Ortak Anot", 2.0m),
            ("Kingbright", "BC56-11EWA", 4, "Kırmızı (Yüksek Verim)", 0.56m, "Ortak Katot", 2.0m),
            ("Kingbright", "BC56-12EWA", 4, "Kırmızı (Yüksek Verim)", 0.56m, "Ortak Katot", 2.0m),
            ("Kingbright", "CA56-12EWA", 4, "Kırmızı (Yüksek Verim)", 0.56m, "Ortak Anot", 2.0m),
            ("Kingbright", "CC56-12SRWA", 4, "Süper Kırmızı", 0.56m, "Ortak Katot", 1.85m),
            ("Kingbright", "BA56-11GWA", 4, "Yeşil", 0.56m, "Ortak Anot", 2.2m),
            ("Kingbright", "KCSC02-105", 1, "Kırmızı (Yüksek Verim)", 0.28m, "Ortak Katot", 2.0m),
            ("Kingbright", "ACDA56-41SEKWA-F01", 4, "Turuncu", 0.56m, "Ortak Anot", 2.0m),

            ("Lite-On", "LTS-4801JR", 1, "Kırmızı", 0.4m, "Ortak Anot", 2.0m),
            ("Lite-On", "LTS-4802JR", 1, "Kırmızı", 0.4m, "Ortak Katot", 2.0m),
            ("Lite-On", "LTS-546AWC", 1, "Kırmızı", 0.56m, "Ortak Anot", 2.0m),
            ("Lite-On", "LTC-4727JR", 4, "Kırmızı", 0.4m, "Ortak Anot", 2.0m),
            ("Broadcom", "HDSP-521E", 1, "Kırmızı (Yüksek Verim)", 0.56m, "Ortak Katot", 2.1m),
            ("Everlight", "ELS-321HDB/S530-E2", 1, "Kırmızı", 0.32m, "Ortak Anot", 2.0m)
        ];

        return liste.Select(x => new HamParca(
            "yedi-segment-gostergeler", x.Uretici, x.Mpn,
            $"GÖSTERGE 7 SEGMENT {x.Hane} HANE {ParcaKodlama.AnlamliBasamak(x.Inc, 3)}\" {x.Renk} {x.Ortak}",
            MontajTipi.Tht,
            [
                new("hane_sayisi", x.Hane.ToString(), x.Hane),
                new("renk", x.Renk),
                new("ekran_boyutu", $"{ParcaKodlama.AnlamliBasamak(x.Inc, 3)} inç", x.Inc),
                new("cikis_tipi", x.Ortak),
                new("ileri_voltaj", $"{ParcaKodlama.AnlamliBasamak(x.Vf, 3)} V", x.Vf),
                new("montaj_sekli", "Delikli Montaj")
            ]));
    }

    // -----------------------------------------------------------------------
    // Optokuplörler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Optokuplorler()
    {
        (string Uretici, string Mpn, int Kanal, decimal Izolasyon, string Ctr, string CikisTipi, string Kilif, MontajTipi Montaj)[] liste =
        [
            ("Sharp", "PC817X1NSZ9F", 1, 5_000m, "%50 - %600", "Fototransistör", "PDIP-4", MontajTipi.Tht),
            ("Sharp", "PC817X4NSZ9F", 1, 5_000m, "%50 - %600", "Fototransistör", "SOP-4", MontajTipi.Smt),
            ("Sharp", "PC123X2YFZ0F", 1, 5_000m, "%80 - %160", "Fototransistör", "PDIP-4", MontajTipi.Tht),
            ("Sharp", "PC357N2J000F", 1, 3_750m, "%100 - %200", "Fototransistör", "SOP-4", MontajTipi.Smt),
            ("Sharp", "PC847X1NSZ9F", 4, 5_000m, "%50 - %600", "Fototransistör", "PDIP-16", MontajTipi.Tht),

            ("Lite-On", "LTV-817S", 1, 5_000m, "%50 - %600", "Fototransistör", "SOP-4", MontajTipi.Smt),
            ("Lite-On", "LTV-816S", 1, 5_000m, "%20 - %300", "Fototransistör", "SOP-4", MontajTipi.Smt),
            ("Lite-On", "LTV-357T", 1, 5_000m, "%50 - %600", "Fototransistör", "SOP-4", MontajTipi.Smt),
            ("Lite-On", "LTV-847S", 4, 5_000m, "%50 - %600", "Fototransistör", "SOP-16", MontajTipi.Smt),
            ("Lite-On", "LTV-814S", 1, 5_000m, "%20 - %300", "Triyak Sürücü", "SOP-4", MontajTipi.Smt),

            ("Broadcom", "6N137-000E", 1, 5_000m, "—", "Lojik Çıkış (10 Mbit/s)", "PDIP-8", MontajTipi.Tht),
            ("Broadcom", "6N137S-000E", 1, 5_000m, "—", "Lojik Çıkış (10 Mbit/s)", "SOIC-8", MontajTipi.Smt),
            ("Broadcom", "HCPL-2531-000E", 2, 5_000m, "—", "Lojik Çıkış", "PDIP-8", MontajTipi.Tht),
            ("Broadcom", "HCPL-3120-000E", 1, 5_000m, "—", "IGBT / MOSFET Gate Sürücü", "PDIP-8", MontajTipi.Tht),
            ("Broadcom", "ACPL-217-56BE", 1, 3_750m, "%50 - %600", "Fototransistör", "SO-5", MontajTipi.Smt),
            ("Broadcom", "ACPL-M61L-500E", 1, 3_750m, "—", "Lojik Çıkış", "SO-5", MontajTipi.Smt),

            ("Toshiba", "TLP281(GB-TP,SE", 1, 3_750m, "%50 - %600", "Fototransistör", "SO-4", MontajTipi.Smt),
            ("Toshiba", "TLP291(GB-TP,SE", 1, 3_750m, "%50 - %600", "Fototransistör", "SO-4", MontajTipi.Smt),
            ("Toshiba", "TLP785(F", 1, 5_000m, "%50 - %600", "Fototransistör", "PDIP-4", MontajTipi.Tht),
            ("Toshiba", "TLP182(GR-TPL,E", 1, 3_750m, "%100 - %600", "Fototransistör", "SO-4", MontajTipi.Smt),
            ("Toshiba", "TLP350(F", 1, 3_750m, "—", "IGBT / MOSFET Gate Sürücü", "PDIP-8", MontajTipi.Tht),
            ("Toshiba", "TLP2361(TPL,E", 1, 3_750m, "—", "Lojik Çıkış (20 Mbit/s)", "SO-5", MontajTipi.Smt),

            ("Everlight", "EL817(C)(TA)-VG", 1, 5_000m, "%50 - %600", "Fototransistör", "PDIP-4", MontajTipi.Tht),
            ("Everlight", "EL3H7(C)(TA)-VG", 1, 3_750m, "%80 - %600", "Fototransistör", "SOP-4", MontajTipi.Smt),
            ("Everlight", "EL357N(C)(TA)-VG", 1, 3_750m, "%50 - %600", "Fototransistör", "SOP-4", MontajTipi.Smt),
            ("Everlight", "EL814(C)(TA)-VG", 1, 5_000m, "%20 - %300", "Fototransistör", "SOP-4", MontajTipi.Smt),

            ("Vishay Semiconductor", "4N35", 1, 5_300m, "%100", "Fototransistör", "PDIP-6", MontajTipi.Tht),
            ("Vishay Semiconductor", "SFH6156-3T", 1, 5_300m, "%100 - %300", "Fototransistör", "SOP-4", MontajTipi.Smt),
            ("Vishay Semiconductor", "TCET1103G", 1, 5_300m, "%100 - %300", "Fototransistör", "SOP-4", MontajTipi.Smt),
            ("Vishay Semiconductor", "VOM1271T", 1, 5_300m, "—", "Foto Voltaj (MOSFET Sürücü)", "SOP-4", MontajTipi.Smt),
            ("Vishay Semiconductor", "VO2223A", 1, 5_300m, "—", "Triyak Sürücü (Sıfır Geçişli)", "PDIP-6", MontajTipi.Tht),

            ("onsemi", "FOD817C300R2", 1, 5_000m, "%100 - %200", "Fototransistör", "SOP-4", MontajTipi.Smt),
            ("onsemi", "MOC3021SR2M", 1, 7_500m, "—", "Triyak Sürücü", "SOP-6", MontajTipi.Smt),
            ("onsemi", "MOC3063SR2M", 1, 7_500m, "—", "Triyak Sürücü (Sıfır Geçişli)", "SOP-6", MontajTipi.Smt),
            ("onsemi", "MOC3041M", 1, 7_500m, "—", "Triyak Sürücü (Sıfır Geçişli)", "PDIP-6", MontajTipi.Tht),
            ("onsemi", "FOD3182TV", 1, 5_000m, "—", "IGBT / MOSFET Gate Sürücü", "PDIP-8", MontajTipi.Tht)
        ];

        return liste.Select(x => new HamParca(
            "optokuplorler", x.Uretici, x.Mpn,
            $"OPTOKUPLÖR {x.Kanal}CH {x.CikisTipi} {ParcaKodlama.AnlamliBasamak(x.Izolasyon, 5)}Vrms {x.Kilif}",
            x.Montaj,
            [
                new("kanal_sayisi", x.Kanal.ToString(), x.Kanal),
                new("izolasyon_voltaji", $"{ParcaKodlama.AnlamliBasamak(x.Izolasyon, 5)} Vrms", x.Izolasyon),
                new("ctr", x.Ctr),
                new("cikis_tipi", x.CikisTipi),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", "-55 ~ +110 °C")
            ]));
    }

    // -----------------------------------------------------------------------
    // Kızılötesi bileşenler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> KizilotesiBilesenler()
    {
        (string Uretici, string Mpn, string Tip, decimal Nm, decimal Khz, string Besleme, decimal Aci, MontajTipi Montaj)[] liste =
        [
            ("Vishay Semiconductor", "TSOP38238", "IR Alıcı Modül", 940m, 38m, "2.5 - 5.5 V", 90m, MontajTipi.Tht),
            ("Vishay Semiconductor", "TSOP34838", "IR Alıcı Modül", 940m, 38m, "2.5 - 5.5 V", 90m, MontajTipi.Tht),
            ("Vishay Semiconductor", "TSOP38336", "IR Alıcı Modül", 940m, 36m, "2.5 - 5.5 V", 90m, MontajTipi.Tht),
            ("Vishay Semiconductor", "TSSP58038", "IR Yakınlık Sensörü", 940m, 38m, "2.5 - 5.5 V", 60m, MontajTipi.Tht),
            ("Vishay Semiconductor", "TSAL6200", "IR Verici LED", 940m, 0m, "1.35 V", 34m, MontajTipi.Tht),
            ("Vishay Semiconductor", "TSAL6100", "IR Verici LED", 940m, 0m, "1.35 V", 20m, MontajTipi.Tht),
            ("Vishay Semiconductor", "TSAL7400", "IR Verici LED", 950m, 0m, "1.35 V", 50m, MontajTipi.Tht),
            ("Vishay Semiconductor", "TSHF5410", "IR Verici LED", 890m, 0m, "1.5 V", 20m, MontajTipi.Tht),
            ("Vishay Semiconductor", "BPW34", "Fotodiyot", 900m, 0m, "—", 130m, MontajTipi.Tht),
            ("Vishay Semiconductor", "BPW34S", "Fotodiyot (SMD)", 900m, 0m, "—", 130m, MontajTipi.Smt),
            ("Vishay Semiconductor", "BPV10NF", "Fotodiyot (IR Filtreli)", 900m, 0m, "—", 40m, MontajTipi.Tht),
            ("Vishay Semiconductor", "TEMT6000X01", "Ortam Işığı Sensörü", 570m, 0m, "3.0 - 5.0 V", 120m, MontajTipi.Smt),
            ("Vishay Semiconductor", "TCRT5000", "Yansımalı Optik Sensör", 950m, 0m, "—", 16m, MontajTipi.Tht),
            ("Vishay Semiconductor", "TCST2103", "Yarıklı Optik Sensör", 950m, 0m, "—", 0m, MontajTipi.Tht),
            ("Vishay Semiconductor", "TCUT1600X01", "İki Kanallı Yansımalı Sensör", 950m, 0m, "—", 0m, MontajTipi.Smt),

            ("Everlight", "IR333C", "IR Verici LED", 940m, 0m, "1.35 V", 20m, MontajTipi.Tht),
            ("Everlight", "IR204-A", "IR Verici LED", 940m, 0m, "1.35 V", 20m, MontajTipi.Tht),
            ("Everlight", "IRM-3638T", "IR Alıcı Modül", 940m, 38m, "2.7 - 5.5 V", 90m, MontajTipi.Tht),
            ("Everlight", "PT334-6C", "Fototransistör", 940m, 0m, "—", 20m, MontajTipi.Tht),
            ("Everlight", "ITR8307", "Yansımalı Optik Sensör", 940m, 0m, "—", 0m, MontajTipi.Tht),
            ("Everlight", "ITR9608-F", "Yarıklı Optik Sensör", 940m, 0m, "—", 0m, MontajTipi.Tht),
            ("Broadcom", "HSDL-3201-021", "IrDA Alıcı-Verici", 875m, 0m, "2.4 - 3.6 V", 30m, MontajTipi.Smt),
            ("Lite-On", "LTR-301", "Fototransistör", 940m, 0m, "—", 24m, MontajTipi.Tht),
            ("Kingbright", "KP-2012F3C", "IR Verici LED (SMD)", 940m, 0m, "1.35 V", 130m, MontajTipi.Smt)
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("sensor_tipi", x.Tip),
                new("dalga_boyu", $"{ParcaKodlama.AnlamliBasamak(x.Nm, 4)} nm", x.Nm),
                new("montaj_sekli", x.Montaj == MontajTipi.Smt ? "Yüzey Montaj" : "Delikli Montaj")
            };

            if (x.Khz > 0m)
                ozellikler.Add(new ParcaOzelligi("frekans", $"{ParcaKodlama.AnlamliBasamak(x.Khz / 1000m, 4)} MHz", x.Khz / 1000m));

            if (x.Besleme != "—")
                ozellikler.Add(new ParcaOzelligi("besleme_voltaji", x.Besleme));

            if (x.Aci > 0m)
                ozellikler.Add(new ParcaOzelligi("gorus_acisi", $"{ParcaKodlama.AnlamliBasamak(x.Aci, 3)}°", x.Aci));

            yield return new HamParca(
                "kizilotesi-bilesenler", x.Uretici, x.Mpn,
                $"{x.Tip} {ParcaKodlama.AnlamliBasamak(x.Nm, 4)}nm{(x.Khz > 0m ? " " + ParcaKodlama.AnlamliBasamak(x.Khz, 3) + "kHz" : "")}",
                x.Montaj, ozellikler);
        }
    }
}
