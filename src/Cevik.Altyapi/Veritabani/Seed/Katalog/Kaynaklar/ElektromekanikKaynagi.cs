using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Elektromekanik bileşenler — konnektörler, klemensler, röleler, anahtarlar ve
/// potansiyometreler.
///
/// Konnektör aileleri kombinatoryal üretilir çünkü sipariş kodu doğrudan kutup sayısını
/// taşır ve üretici o aileyi kutup kutup listeler:
///
///   JST XH   : B | n | B-XH-A(LF)(SN)          -> B4B-XH-A(LF)(SN)   (4 kutup, 2.50 mm)
///   JST PH   : B | n | B-PH-K-S(LF)(SN)        -> B6B-PH-K-S(LF)(SN) (6 kutup, 2.00 mm)
///   Würth    : 613 | pin(2) | 11121            -> 61300411121        (1x4, 2.54 mm)
///   Samtec   : TSW-1 | poz(2) | -07-G-S|D      -> TSW-108-07-G-S
///   Degson   : DG301-5.0- | nn | P-12-00AH     -> DG301-5.0-03P-12-00AH
///
/// Trimpot serileri de öyle: Bourns 3296W-1-<b>103</b>LF kodundaki 103, EIA üç haneli
/// direnç kodudur ve tüm kademe üreticinin katalogunda vardır.
/// </summary>
public static class ElektromekanikKaynagi
{
    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in KabloKartKonnektorler()) yield return p;
        foreach (var p in KartKartKonnektorler()) yield return p;
        foreach (var p in PcbKlemensler()) yield return p;
        foreach (var p in ArayuzKonnektorleri()) yield return p;
        foreach (var p in Roleler()) yield return p;
        foreach (var p in TactileButonlar()) yield return p;
        foreach (var p in AnahtarEnkoderler()) yield return p;
        foreach (var p in Potansiyometreler()) yield return p;
    }

    // -----------------------------------------------------------------------
    // Kablo-kart konnektörler (JST)
    // -----------------------------------------------------------------------

    private sealed record JstAilesi(
        string Ad, decimal Adim, decimal Akim, decimal Volt, int MinKutup, int MaxKutup,
        string DikBaslikKalibi, string YanBaslikKalibi, string GovdeKalibi);

    private static readonly JstAilesi[] JstAileleri =
    [
        new("XH", 2.50m, 3m, 250m, 2, 16, "B{n}B-XH-A(LF)(SN)", "S{n}B-XH-A(LF)(SN)", "XHP-{n}"),
        new("PH", 2.00m, 2m, 100m, 2, 16, "B{n}B-PH-K-S(LF)(SN)", "S{n}B-PH-K-S(LF)(SN)", "PHR-{n}"),
        new("ZH", 1.50m, 1m, 50m, 2, 12, "B{n}B-ZR(LF)(SN)", "S{n}B-ZR(LF)(SN)", "ZHR-{n}"),
        new("VH", 3.96m, 10m, 250m, 2, 10, "B{n}P-VH(LF)(SN)", "S{n}P-VH(LF)(SN)", "VHR-{n}N")
    ];

    private static IEnumerable<HamParca> KabloKartKonnektorler()
    {
        foreach (var aile in JstAileleri)
        {
            for (var n = aile.MinKutup; n <= aile.MaxKutup; n++)
            {
                yield return Konnektor("kablo-kart-konnektorler", "JST",
                    aile.DikBaslikKalibi.Replace("{n}", n.ToString()),
                    $"JST {aile.Ad} Serisi Kart Başlığı", aile.Adim, n, 1, "Dik (Üstten Girişli)",
                    aile.Akim, aile.Volt, "Kilitli", MontajTipi.Tht);

                yield return Konnektor("kablo-kart-konnektorler", "JST",
                    aile.YanBaslikKalibi.Replace("{n}", n.ToString()),
                    $"JST {aile.Ad} Serisi Kart Başlığı", aile.Adim, n, 1, "Yan (Açılı) Girişli",
                    aile.Akim, aile.Volt, "Kilitli", MontajTipi.Tht);

                yield return Konnektor("kablo-kart-konnektorler", "JST",
                    aile.GovdeKalibi.Replace("{n}", n.ToString()),
                    $"JST {aile.Ad} Serisi Kablo Gövdesi", aile.Adim, n, 1, "Kablo Tarafı",
                    aile.Akim, aile.Volt, "Kilitli", MontajTipi.Yok);
            }
        }

        // JST SH serisi — 1.00 mm, yalnızca yüzey montaj başlıklı.
        for (var n = 2; n <= 15; n++)
        {
            yield return Konnektor("kablo-kart-konnektorler", "JST",
                $"SM{n:00}B-SRSS-TB(LF)(SN)", "JST SH Serisi Kart Başlığı",
                1.00m, n, 1, "Yan (Açılı) Girişli", 1m, 50m, "Kilitli", MontajTipi.Smt);

            yield return Konnektor("kablo-kart-konnektorler", "JST",
                $"SHR-{n:00}V-S-B", "JST SH Serisi Kablo Gövdesi",
                1.00m, n, 1, "Kablo Tarafı", 1m, 50m, "Kilitli", MontajTipi.Yok);
        }

        // Molex KK 254 serisi — 2.54 mm dik kart başlığı.
        for (var n = 2; n <= 12; n++)
        {
            yield return Konnektor("kablo-kart-konnektorler", "Molex",
                $"22-23-2{n:00}1", "Molex KK 254 Kart Başlığı",
                2.54m, n, 1, "Dik (Üstten Girişli)", 4m, 250m, "Sürtünme Kilitli", MontajTipi.Tht);
        }

        // Küratörlü: krimp terminaller ve yaygın kablo takımları.
        (string Uretici, string Mpn, string Tip, decimal Adim, int Pin, decimal Akim)[] ekler =
        [
            ("JST", "SXH-001T-P0.6", "JST XH Krimp Terminal (Dişi)", 2.50m, 1, 3m),
            ("JST", "SPH-002T-P0.5S", "JST PH Krimp Terminal (Dişi)", 2.00m, 1, 2m),
            ("JST", "SZH-002T-P0.5", "JST ZH Krimp Terminal (Dişi)", 1.50m, 1, 1m),
            ("JST", "SVH-21T-P1.1", "JST VH Krimp Terminal (Dişi)", 3.96m, 1, 10m),
            ("Molex", "08-50-0114", "Molex KK Krimp Terminal (Dişi)", 2.54m, 1, 4m),
            ("TE Connectivity", "1-480699-0", "TE Universal MATE-N-LOK Gövde", 6.35m, 9, 13m),
            ("TE Connectivity", "770602-1", "TE Krimp Terminal (Dişi)", 6.35m, 1, 13m),
            ("Würth Elektronik", "649002113322", "WR-WTB 2.54 mm Kart Başlığı", 2.54m, 2, 3m),
            ("Würth Elektronik", "649004113322", "WR-WTB 2.54 mm Kart Başlığı", 2.54m, 4, 3m),
            ("Würth Elektronik", "649006113322", "WR-WTB 2.54 mm Kart Başlığı", 2.54m, 6, 3m)
        ];

        foreach (var e in ekler)
            yield return Konnektor("kablo-kart-konnektorler", e.Uretici, e.Mpn, e.Tip, e.Adim, e.Pin, 1,
                "Kablo Tarafı", e.Akim, 250m, "Kilitli", MontajTipi.Yok);
    }

    // -----------------------------------------------------------------------
    // Kart-kart konnektörler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> KartKartKonnektorler()
    {
        // Würth WR-PHD 2.54 mm pin başlıkları: 613 + toplam pin (2 hane) + sıra kodu.
        for (var n = 2; n <= 20; n++)
        {
            yield return Konnektor("kart-kart-konnektorler", "Würth Elektronik",
                $"613{n:00}011121", "WR-PHD Tek Sıra Pin Başlığı",
                2.54m, n, 1, "Dik (Üstten Girişli)", 3m, 250m, "Kilitsiz", MontajTipi.Tht);
        }

        for (var n = 4; n <= 40; n += 2)
        {
            yield return Konnektor("kart-kart-konnektorler", "Würth Elektronik",
                $"613{n:00}021121", "WR-PHD Çift Sıra Pin Başlığı",
                2.54m, n, 2, "Dik (Üstten Girişli)", 3m, 250m, "Kilitsiz", MontajTipi.Tht);
        }

        // Samtec TSW pin başlığı ve SSW soket serisi.
        for (var n = 2; n <= 20; n++)
        {
            yield return Konnektor("kart-kart-konnektorler", "Samtec",
                $"TSW-1{n:00}-07-G-S", "Samtec TSW Tek Sıra Pin Başlığı",
                2.54m, n, 1, "Dik (Üstten Girişli)", 4.7m, 250m, "Kilitsiz", MontajTipi.Tht);

            yield return Konnektor("kart-kart-konnektorler", "Samtec",
                $"TSW-1{n:00}-07-G-D", "Samtec TSW Çift Sıra Pin Başlığı",
                2.54m, n * 2, 2, "Dik (Üstten Girişli)", 4.7m, 250m, "Kilitsiz", MontajTipi.Tht);

            yield return Konnektor("kart-kart-konnektorler", "Samtec",
                $"SSW-1{n:00}-01-G-S", "Samtec SSW Tek Sıra Soket",
                2.54m, n, 1, "Dik (Üstten Girişli)", 4.7m, 250m, "Kilitsiz", MontajTipi.Tht);
        }

        (string Uretici, string Mpn, string Tip, decimal Adim, int Pin, int Sira, string Yon, MontajTipi Montaj)[] ekler =
        [
            ("Hirose", "DF13-4P-1.25DSA(20)", "Hirose DF13 Kart Başlığı", 1.25m, 4, 1, "Dik (Üstten Girişli)", MontajTipi.Tht),
            ("Hirose", "DF13-6P-1.25DSA(20)", "Hirose DF13 Kart Başlığı", 1.25m, 6, 1, "Dik (Üstten Girişli)", MontajTipi.Tht),
            ("Hirose", "DF13-10P-1.25DSA(20)", "Hirose DF13 Kart Başlığı", 1.25m, 10, 1, "Dik (Üstten Girişli)", MontajTipi.Tht),
            ("Hirose", "FH12-24S-0.5SH(55)", "Hirose FH12 FPC/FFC Soketi", 0.50m, 24, 1, "Yatay", MontajTipi.Smt),
            ("Hirose", "FH12-30S-0.5SH(55)", "Hirose FH12 FPC/FFC Soketi", 0.50m, 30, 1, "Yatay", MontajTipi.Smt),
            ("Molex", "52745-1097", "Molex FFC/FPC Soketi", 1.00m, 10, 1, "Yatay", MontajTipi.Smt),
            ("Molex", "5031540690", "Molex Easy-On FFC/FPC Soketi", 0.50m, 6, 1, "Yatay", MontajTipi.Smt),
            ("Amphenol", "10029449-111RLF", "Amphenol Minitek Kart Başlığı", 2.00m, 10, 2, "Dik (Üstten Girişli)", MontajTipi.Smt),
            ("Harwin", "M20-9990246", "Harwin M20 Tek Sıra Pin Başlığı", 2.54m, 2, 1, "Dik (Üstten Girişli)", MontajTipi.Tht),
            ("Harwin", "M20-9990646", "Harwin M20 Tek Sıra Pin Başlığı", 2.54m, 6, 1, "Dik (Üstten Girişli)", MontajTipi.Tht),
            ("Harwin", "M50-3600542", "Harwin Archer 1.27 mm Soket", 1.27m, 10, 2, "Dik (Üstten Girişli)", MontajTipi.Tht),
            ("Samtec", "FTSH-105-01-L-DV-K", "Samtec FTSH 1.27 mm Debug Başlığı", 1.27m, 10, 2, "Dik (Üstten Girişli)", MontajTipi.Tht),
            ("Samtec", "SSQ-110-03-G-D", "Samtec SSQ Çift Sıra Yüksek Soket", 2.54m, 20, 2, "Dik (Üstten Girişli)", MontajTipi.Tht)
        ];

        foreach (var e in ekler)
            yield return Konnektor("kart-kart-konnektorler", e.Uretici, e.Mpn, e.Tip, e.Adim, e.Pin, e.Sira,
                e.Yon, 1m, 250m, "Kilitsiz", e.Montaj);
    }

    // -----------------------------------------------------------------------
    // PCB klemensler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> PcbKlemensler()
    {
        // Degson DG301 (fişli) ve DG128 (vidalı) serileri — kutup sayısı kodda.
        for (var n = 2; n <= 12; n++)
        {
            yield return Klemens("Degson", $"DG301-5.0-{n:00}P-12-00AH",
                "Fişli Klemens (Pluggable)", 5.00m, n, 12m, 300m, "16 - 26 AWG", "Dik (Üstten Girişli)");

            yield return Klemens("Degson", $"DG128-5.0-{n:00}P-14-00AH",
                "Vidalı Klemens", 5.00m, n, 15m, 300m, "12 - 26 AWG", "Dik (Üstten Girişli)");

            yield return Klemens("Degson", $"DG128-3.5-{n:00}P-14-00AH",
                "Vidalı Klemens", 3.50m, n, 10m, 300m, "16 - 26 AWG", "Dik (Üstten Girişli)");
        }

        (string Uretici, string Mpn, string Tip, decimal Adim, int Pin, decimal Akim, decimal Volt, string Awg)[] ekler =
        [
            ("Phoenix Contact", "1729128", "MKDS 1,5 Vidalı Klemens", 5.08m, 2, 17.5m, 630m, "14 - 26 AWG"),
            ("Phoenix Contact", "1729131", "MKDS 1,5 Vidalı Klemens", 5.08m, 3, 17.5m, 630m, "14 - 26 AWG"),
            ("Phoenix Contact", "1729144", "MKDS 1,5 Vidalı Klemens", 5.08m, 4, 17.5m, 630m, "14 - 26 AWG"),
            ("Phoenix Contact", "1935161", "MKDS 3 Vidalı Klemens", 5.08m, 2, 24m, 400m, "12 - 24 AWG"),
            ("Phoenix Contact", "1803578", "MC 1,5 Fişli Klemens Başlığı", 3.81m, 2, 8m, 160m, "16 - 28 AWG"),
            ("Phoenix Contact", "1803581", "MC 1,5 Fişli Klemens Başlığı", 3.81m, 3, 8m, 160m, "16 - 28 AWG"),
            ("Phoenix Contact", "1827703", "MSTB 2,5 Fişli Klemens Gövdesi", 5.08m, 2, 12m, 320m, "14 - 24 AWG"),
            ("Weidmüller", "1615560000", "LSF-SMT Yaylı Klemens", 3.50m, 2, 8m, 160m, "16 - 26 AWG"),
            ("Weidmüller", "1615570000", "LSF-SMT Yaylı Klemens", 3.50m, 3, 8m, 160m, "16 - 26 AWG"),
            ("Weidmüller", "1748760000", "BL Fişli Klemens Gövdesi", 5.08m, 2, 16m, 320m, "14 - 26 AWG"),
            ("WAGO", "2060-451/998-404", "PCB Yaylı Klemens (SMD)", 4.00m, 1, 9m, 160m, "20 - 26 AWG"),
            ("WAGO", "236-402", "PCB Yaylı Klemens", 5.00m, 2, 12m, 250m, "14 - 26 AWG"),
            ("WAGO", "236-403", "PCB Yaylı Klemens", 5.00m, 3, 12m, 250m, "14 - 26 AWG"),
            ("WAGO", "2604-1102", "PCB Yaylı Klemens", 3.50m, 2, 8m, 160m, "16 - 28 AWG"),
            ("Würth Elektronik", "691214110002", "WR-TBL Vidalı Klemens", 5.08m, 2, 16m, 300m, "12 - 26 AWG"),
            ("Würth Elektronik", "691214110003", "WR-TBL Vidalı Klemens", 5.08m, 3, 16m, 300m, "12 - 26 AWG"),
            ("Würth Elektronik", "691137710002", "WR-TBL Yaylı Klemens", 3.50m, 2, 9m, 160m, "16 - 26 AWG")
        ];

        foreach (var e in ekler)
            yield return Klemens(e.Uretici, e.Mpn, e.Tip, e.Adim, e.Pin, e.Akim, e.Volt, e.Awg, "Dik (Üstten Girişli)");
    }

    private static HamParca Klemens(
        string uretici, string mpn, string tip, decimal adim, int pin,
        decimal akim, decimal volt, string awg, string yon) =>
        new(
            "pcb-klemensler", uretici, mpn,
            $"KLEMENS {tip} {ParcaKodlama.AnlamliBasamak(adim, 3)}mm {pin}P {ParcaKodlama.AnlamliBasamak(akim, 3)}A",
            MontajTipi.Tht,
            [
                new("konnektor_tipi", tip),
                new("adim_mm", $"{ParcaKodlama.AnlamliBasamak(adim, 3)} mm", adim),
                new("pin_sayisi", pin.ToString(), pin),
                new("akim_derecesi", $"{ParcaKodlama.AnlamliBasamak(akim, 4)} A", akim),
                new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(volt, 4)} V", volt),
                new("awg", awg),
                new("yon", yon)
            ]);

    private static HamParca Konnektor(
        string kategori, string uretici, string mpn, string tip, decimal adim, int pin, int sira,
        string yon, decimal akim, decimal volt, string kilit, MontajTipi montaj)
    {
        var ozellikler = new List<ParcaOzelligi>
        {
            new("konnektor_tipi", tip),
            new("adim_mm", $"{ParcaKodlama.AnlamliBasamak(adim, 3)} mm", adim),
            new("pin_sayisi", pin.ToString(), pin),
            new("sira_sayisi", sira.ToString(), sira),
            new("yon", yon),
            new("akim_derecesi", $"{ParcaKodlama.AnlamliBasamak(akim, 4)} A", akim)
        };

        // Kart-kart kategorisinde kilit mekanizması yerine montaj şekli filtreleniyor.
        if (kategori == "kart-kart-konnektorler")
            ozellikler.Add(new ParcaOzelligi("montaj_sekli", montaj == MontajTipi.Smt ? "Yüzey Montaj" : "Delikli Montaj"));
        else
        {
            ozellikler.Add(new ParcaOzelligi("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(volt, 4)} V", volt));
            ozellikler.Add(new ParcaOzelligi("kilitleme", kilit));
        }

        return new HamParca(
            kategori, uretici, mpn,
            $"KONN {tip} {ParcaKodlama.AnlamliBasamak(adim, 3)}mm {pin}P {yon}",
            montaj, ozellikler);
    }

    // -----------------------------------------------------------------------
    // Arayüz konnektörleri
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> ArayuzKonnektorleri()
    {
        (string Uretici, string Mpn, string Tip, int Pin, string Yon, MontajTipi Montaj, decimal Akim, decimal Omur)[] liste =
        [
            ("Amphenol", "10118193-0001LF", "USB 2.0 Micro-B Soket", 5, "Yatay", MontajTipi.Smt, 1m, 10_000m),
            ("Amphenol", "10103594-0001LF", "USB 2.0 Type-A Soket", 4, "Dik (Üstten Girişli)", MontajTipi.Tht, 1.5m, 1_500m),
            ("Amphenol", "12401598E4#2A", "USB Type-C Soket (16 Pin)", 16, "Yatay", MontajTipi.Smt, 5m, 10_000m),
            ("Amphenol", "GSB4485132HR", "RJ45 Soket (Ekranlı)", 8, "Dik (Üstten Girişli)", MontajTipi.Tht, 1.5m, 750m),
            ("Amphenol", "RJHSE-5380", "RJ45 Soket", 8, "Dik (Üstten Girişli)", MontajTipi.Tht, 1.5m, 750m),
            ("Amphenol", "RJHSE-5381", "RJ45 Soket (LED'li)", 8, "Dik (Üstten Girişli)", MontajTipi.Tht, 1.5m, 750m),
            ("Amphenol", "L717SDB09PA4CH4F", "D-Sub 9 Pin Erkek", 9, "Dik (Üstten Girişli)", MontajTipi.Tht, 5m, 500m),
            ("Amphenol", "L717SDE09S1ACH4F", "D-Sub 9 Pin Dişi", 9, "Dik (Üstten Girişli)", MontajTipi.Tht, 5m, 500m),

            ("Molex", "1050170001", "USB 2.0 Micro-B Soket", 5, "Yatay", MontajTipi.Smt, 1m, 10_000m),
            ("Molex", "0673298030", "USB 2.0 Micro-B Soket", 5, "Yatay", MontajTipi.Smt, 1m, 10_000m),
            ("Molex", "2172561001", "USB Type-C Soket (24 Pin)", 24, "Yatay", MontajTipi.Smt, 5m, 10_000m),
            ("Molex", "0473460001", "microSD Kart Soketi", 8, "Yatay", MontajTipi.Smt, 0.5m, 10_000m),
            ("Molex", "1041570811", "RJ45 Soket", 8, "Dik (Üstten Girişli)", MontajTipi.Tht, 1.5m, 750m),
            ("Molex", "0533980671", "SIM Kart Soketi", 6, "Yatay", MontajTipi.Smt, 0.5m, 5_000m),

            ("Würth Elektronik", "629105150521", "USB 2.0 Type-A Soket", 4, "Dik (Üstten Girişli)", MontajTipi.Tht, 1.5m, 1_500m),
            ("Würth Elektronik", "614105150721", "USB 2.0 Mini-B Soket", 5, "Yatay", MontajTipi.Smt, 1m, 5_000m),
            ("Würth Elektronik", "629105150521", "USB 2.0 Type-A Soket", 4, "Dik (Üstten Girişli)", MontajTipi.Tht, 1.5m, 1_500m),
            ("Würth Elektronik", "632723100011", "USB Type-C Soket (24 Pin)", 24, "Yatay", MontajTipi.Smt, 5m, 10_000m),
            ("Würth Elektronik", "615008138421", "USB 2.0 Micro-B Soket", 5, "Yatay", MontajTipi.Smt, 1m, 10_000m),
            ("Würth Elektronik", "693071010801", "microSD Kart Soketi", 8, "Yatay", MontajTipi.Smt, 0.5m, 5_000m),
            ("Würth Elektronik", "7499111121A", "RJ45 Soket (Trafolu)", 8, "Dik (Üstten Girişli)", MontajTipi.Tht, 1.5m, 750m),

            ("TE Connectivity", "292304-2", "USB 2.0 Type-A Soket", 4, "Dik (Üstten Girişli)", MontajTipi.Tht, 1.5m, 1_500m),
            ("TE Connectivity", "1932259-1", "RJ45 Soket", 8, "Dik (Üstten Girişli)", MontajTipi.Tht, 1.5m, 750m),
            ("TE Connectivity", "2129691-1", "USB Type-C Soket (24 Pin)", 24, "Yatay", MontajTipi.Smt, 5m, 10_000m),
            ("Hirose", "ZX62D-B-5P8", "USB 2.0 Micro-B Soket", 5, "Yatay", MontajTipi.Smt, 1m, 10_000m),
            ("Hirose", "DF40C-100DP-0.4V(51)", "Kart-Kart Yığın Konnektörü", 100, "Yatay", MontajTipi.Smt, 0.3m, 30m),

            ("CUI Inc", "PJ-002AH", "DC Barrel Jack 2.1 mm", 3, "Dik (Üstten Girişli)", MontajTipi.Tht, 5m, 5_000m),
            ("CUI Inc", "PJ-102AH", "DC Barrel Jack 2.1 mm", 3, "Dik (Üstten Girişli)", MontajTipi.Tht, 5m, 5_000m),
            ("CUI Inc", "PJ-036AH", "DC Barrel Jack 2.5 mm", 3, "Dik (Üstten Girişli)", MontajTipi.Tht, 5m, 5_000m),
            ("CUI Inc", "SJ1-3523N", "3.5 mm Stereo Jack", 3, "Dik (Üstten Girişli)", MontajTipi.Tht, 0.5m, 5_000m),
            ("CUI Inc", "MD-60SM", "Mini DIN 6 Pin Soket", 6, "Dik (Üstten Girişli)", MontajTipi.Tht, 1m, 5_000m),
            ("Keystone Electronics", "3583", "Kart Kenarı Test Noktası", 1, "Dik (Üstten Girişli)", MontajTipi.Tht, 5m, 1_000m),
            ("Phoenix Contact", "1616669", "Endüstriyel RJ45 Soket", 8, "Dik (Üstten Girişli)", MontajTipi.Tht, 1.5m, 750m)
        ];

        return liste.Select(x => new HamParca(
            "arayuz-konnektorleri", x.Uretici, x.Mpn,
            $"KONN {x.Tip} {x.Pin}P {x.Yon}",
            x.Montaj,
            [
                new("konnektor_tipi", x.Tip),
                new("pin_sayisi", x.Pin.ToString(), x.Pin),
                new("yon", x.Yon),
                new("montaj_sekli", x.Montaj == MontajTipi.Smt ? "Yüzey Montaj" : "Delikli Montaj"),
                new("akim_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Akim, 3)} A", x.Akim),
                new("omur_dongu", $"{x.Omur:N0} döngü", x.Omur)
            ]));
    }

    // -----------------------------------------------------------------------
    // Röleler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Roleler()
    {
        (string Uretici, string Mpn, string Tip, decimal Bobin, string Kontak, decimal Akim, decimal Volt, MontajTipi Montaj)[] liste =
        [
            ("Omron", "G5V-1-DC5", "Sinyal Rölesi", 5m, "SPDT (1 Form C)", 1m, 125m, MontajTipi.Tht),
            ("Omron", "G5V-1-DC12", "Sinyal Rölesi", 12m, "SPDT (1 Form C)", 1m, 125m, MontajTipi.Tht),
            ("Omron", "G5V-2-H1-DC5", "Sinyal Rölesi", 5m, "DPDT (2 Form C)", 0.5m, 125m, MontajTipi.Tht),
            ("Omron", "G5V-2-H1-DC12", "Sinyal Rölesi", 12m, "DPDT (2 Form C)", 0.5m, 125m, MontajTipi.Tht),
            ("Omron", "G5LE-14-DC5", "Güç Rölesi", 5m, "SPDT (1 Form C)", 10m, 250m, MontajTipi.Tht),
            ("Omron", "G5LE-14-DC12", "Güç Rölesi", 12m, "SPDT (1 Form C)", 10m, 250m, MontajTipi.Tht),
            ("Omron", "G5LE-1-DC24", "Güç Rölesi", 24m, "SPDT (1 Form C)", 10m, 250m, MontajTipi.Tht),
            ("Omron", "G2R-1-E-DC12", "Güç Rölesi", 12m, "SPDT (1 Form C)", 16m, 250m, MontajTipi.Tht),
            ("Omron", "G2R-2-DC24", "Güç Rölesi", 24m, "DPDT (2 Form C)", 5m, 250m, MontajTipi.Tht),
            ("Omron", "G6K-2F-Y-DC5", "Yüksek Frekans Sinyal Rölesi", 5m, "DPDT (2 Form C)", 0.3m, 125m, MontajTipi.Smt),
            ("Omron", "G6S-2-DC5", "Sinyal Rölesi", 5m, "DPDT (2 Form C)", 2m, 125m, MontajTipi.Smt),
            ("Omron", "G3MB-202P-DC5", "Katı Hal Rölesi (SSR)", 5m, "SPST-NO (1 Form A)", 2m, 240m, MontajTipi.Tht),
            ("Omron", "G3MC-202P-DC5", "Katı Hal Rölesi (SSR)", 5m, "SPST-NO (1 Form A)", 2m, 240m, MontajTipi.Tht),

            ("Panasonic Electric Works", "TQ2-5V", "Sinyal Rölesi", 5m, "DPDT (2 Form C)", 1m, 125m, MontajTipi.Tht),
            ("Panasonic Electric Works", "ALQ105", "Sinyal Rölesi (Bistabil)", 5m, "DPDT (2 Form C)", 2m, 125m, MontajTipi.Tht),
            ("Panasonic Electric Works", "AQY212GH", "Foto MOS Rölesi", 5m, "SPST-NO (1 Form A)", 0.55m, 60m, MontajTipi.Smt),
            ("Panasonic Electric Works", "JW1FSN-DC12V", "Güç Rölesi", 12m, "SPDT (1 Form C)", 10m, 250m, MontajTipi.Tht),
            ("Panasonic Electric Works", "APAN3105", "Foto MOS Rölesi", 5m, "SPST-NO (1 Form A)", 0.1m, 400m, MontajTipi.Smt),

            ("TE Connectivity", "RT314F05", "Güç Rölesi", 5m, "SPDT (1 Form C)", 16m, 250m, MontajTipi.Tht),
            ("TE Connectivity", "RT314012", "Güç Rölesi", 12m, "SPDT (1 Form C)", 16m, 250m, MontajTipi.Tht),
            ("TE Connectivity", "RT424012", "Güç Rölesi", 12m, "DPDT (2 Form C)", 8m, 250m, MontajTipi.Tht),
            ("TE Connectivity", "OMIH-SH-105L", "Güç Rölesi", 5m, "SPST-NO (1 Form A)", 16m, 277m, MontajTipi.Tht),
            ("TE Connectivity", "V23079A1001B301", "Sinyal Rölesi", 5m, "DPDT (2 Form C)", 2m, 125m, MontajTipi.Tht),
            ("TE Connectivity", "IM03GR", "Sinyal Rölesi", 5m, "DPDT (2 Form C)", 2m, 125m, MontajTipi.Tht),

            ("Hongfa", "HF3FF/005-1HST", "Güç Rölesi", 5m, "SPST-NO (1 Form A)", 10m, 250m, MontajTipi.Tht),
            ("Hongfa", "HF3FF/012-1ZS", "Güç Rölesi", 12m, "SPDT (1 Form C)", 10m, 250m, MontajTipi.Tht),
            ("Hongfa", "HF115F/012-1ZS3", "Güç Rölesi", 12m, "SPDT (1 Form C)", 16m, 250m, MontajTipi.Tht),
            ("Hongfa", "HF32F/005-HSL2", "Güç Rölesi", 5m, "SPST-NO (1 Form A)", 10m, 250m, MontajTipi.Tht),
            ("Hongfa", "HFD4/5", "Sinyal Rölesi", 5m, "DPDT (2 Form C)", 2m, 125m, MontajTipi.Tht),

            ("Songle", "SRD-05VDC-SL-C", "Güç Rölesi", 5m, "SPDT (1 Form C)", 10m, 250m, MontajTipi.Tht),
            ("Songle", "SRD-12VDC-SL-C", "Güç Rölesi", 12m, "SPDT (1 Form C)", 10m, 250m, MontajTipi.Tht),
            ("Songle", "SRD-24VDC-SL-C", "Güç Rölesi", 24m, "SPDT (1 Form C)", 10m, 250m, MontajTipi.Tht),

            ("Finder", "40.52.9.024.0000", "Endüstriyel Röle", 24m, "DPDT (2 Form C)", 8m, 250m, MontajTipi.Tht),
            ("Finder", "40.61.9.012.0000", "Endüstriyel Röle", 12m, "SPDT (1 Form C)", 16m, 250m, MontajTipi.Tht),
            ("Finder", "36.11.9.012.4011", "Minyatür Röle", 12m, "SPDT (1 Form C)", 10m, 250m, MontajTipi.Tht),
            ("Finder", "34.51.7.024.0010", "İnce Tip Röle", 24m, "SPDT (1 Form C)", 6m, 250m, MontajTipi.Tht),
            ("Littelfuse", "SSRD-25A", "Katı Hal Rölesi (SSR)", 12m, "SPST-NO (1 Form A)", 25m, 280m, MontajTipi.Yok)
        ];

        return liste.Select(x => new HamParca(
            "roleler", x.Uretici, x.Mpn,
            $"RÖLE {x.Tip} {ParcaKodlama.AnlamliBasamak(x.Bobin, 3)}VDC {x.Kontak} {ParcaKodlama.AnlamliBasamak(x.Akim, 3)}A",
            x.Montaj,
            [
                new("role_tipi", x.Tip),
                new("bobin_voltaji", $"{ParcaKodlama.AnlamliBasamak(x.Bobin, 3)} VDC", x.Bobin),
                new("kontak_duzeni", x.Kontak),
                new("kontak_akimi", $"{ParcaKodlama.AnlamliBasamak(x.Akim, 4)} A", x.Akim),
                new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Volt, 4)} VAC", x.Volt),
                new("montaj_sekli", x.Montaj switch
                {
                    MontajTipi.Smt => "Yüzey Montaj",
                    MontajTipi.Tht => "Delikli Montaj",
                    _ => "Panel / Ray Montajı"
                })
            ]));
    }

    // -----------------------------------------------------------------------
    // Tactile butonlar
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> TactileButonlar()
    {
        (string Uretici, string Mpn, string Tip, decimal Kuvvet, decimal Omur, decimal Akim, string Boyut, MontajTipi Montaj)[] liste =
        [
            ("Omron", "B3F-1000", "Tactile Buton", 0.98m, 1_000_000m, 0.05m, "6.0 x 6.0 x 4.3 mm", MontajTipi.Tht),
            ("Omron", "B3F-1002", "Tactile Buton", 1.57m, 1_000_000m, 0.05m, "6.0 x 6.0 x 4.3 mm", MontajTipi.Tht),
            ("Omron", "B3F-1005", "Tactile Buton", 2.55m, 1_000_000m, 0.05m, "6.0 x 6.0 x 4.3 mm", MontajTipi.Tht),
            ("Omron", "B3F-4055", "Tactile Buton", 1.57m, 1_000_000m, 0.05m, "12.0 x 12.0 x 7.3 mm", MontajTipi.Tht),
            ("Omron", "B3FS-1000P", "Tactile Buton (SMD)", 1.57m, 300_000m, 0.05m, "6.0 x 6.0 x 3.1 mm", MontajTipi.Smt),
            ("Omron", "B3U-1000P", "Minyatür Tactile Buton", 1.57m, 300_000m, 0.05m, "3.0 x 2.5 x 1.6 mm", MontajTipi.Smt),
            ("Omron", "B3U-1100P", "Minyatür Tactile Buton", 2.55m, 300_000m, 0.05m, "3.0 x 2.5 x 1.6 mm", MontajTipi.Smt),
            ("Omron", "B3W-1050", "Aydınlatmalı Tactile Buton", 1.57m, 300_000m, 0.05m, "6.0 x 6.0 x 4.3 mm", MontajTipi.Tht),

            ("C&K", "PTS645SM43SMTR92LFS", "Tactile Buton (SMD)", 1.6m, 200_000m, 0.05m, "6.0 x 6.0 x 4.3 mm", MontajTipi.Smt),
            ("C&K", "PTS645SK50SMTR92LFS", "Tactile Buton (SMD)", 1.6m, 200_000m, 0.05m, "6.0 x 6.0 x 5.0 mm", MontajTipi.Smt),
            ("C&K", "PTS645VL432LFS", "Tactile Buton", 1.6m, 200_000m, 0.05m, "6.0 x 6.0 x 4.3 mm", MontajTipi.Tht),
            ("C&K", "PTS526 SM15 SMTR2 LFS", "Minyatür Tactile Buton (SMD)", 1.6m, 100_000m, 0.05m, "5.2 x 5.2 x 1.5 mm", MontajTipi.Smt),
            ("C&K", "KSC221GLFS", "Tactile Buton (SMD)", 1.6m, 500_000m, 0.05m, "6.2 x 6.2 x 3.6 mm", MontajTipi.Smt),
            ("C&K", "KSC441JLFS", "Tactile Buton (SMD)", 2.5m, 300_000m, 0.05m, "6.2 x 6.2 x 4.3 mm", MontajTipi.Smt),
            ("C&K", "KMR221GLFS", "Minyatür Tactile Buton (SMD)", 1.6m, 300_000m, 0.05m, "4.2 x 3.2 x 2.5 mm", MontajTipi.Smt),

            ("Alps Alpine", "SKQGABE010", "Tactile Buton (SMD)", 1.57m, 100_000m, 0.05m, "5.2 x 5.2 x 1.5 mm", MontajTipi.Smt),
            ("Alps Alpine", "SKHHAKA010", "Tactile Buton", 1.57m, 100_000m, 0.05m, "6.0 x 6.0 x 5.0 mm", MontajTipi.Tht),
            ("Alps Alpine", "SKRPACE010", "Minyatür Tactile Buton (SMD)", 1.57m, 100_000m, 0.05m, "3.5 x 2.9 x 1.7 mm", MontajTipi.Smt),
            ("Alps Alpine", "SKQYABE010", "Tactile Buton (SMD)", 2.55m, 100_000m, 0.05m, "5.2 x 5.2 x 1.5 mm", MontajTipi.Smt),

            ("E-Switch", "TL3301AF160QG", "Tactile Buton (SMD)", 1.6m, 100_000m, 0.05m, "6.2 x 6.2 x 3.1 mm", MontajTipi.Smt),
            ("E-Switch", "TL3305AF160QG", "Tactile Buton (SMD)", 1.6m, 100_000m, 0.05m, "6.2 x 6.2 x 5.0 mm", MontajTipi.Smt),
            ("E-Switch", "TL1105AF160Q", "Tactile Buton", 1.6m, 100_000m, 0.05m, "6.0 x 6.0 x 4.3 mm", MontajTipi.Tht),
            ("E-Switch", "TL3315NF160Q", "Minyatür Tactile Buton (SMD)", 1.6m, 100_000m, 0.05m, "3.0 x 2.0 x 1.6 mm", MontajTipi.Smt),

            ("Würth Elektronik", "434121025816", "WS-TASV Tactile Buton", 1.6m, 100_000m, 0.05m, "6.0 x 6.0 x 4.3 mm", MontajTipi.Tht),
            ("Würth Elektronik", "434331025826", "WS-TASV Tactile Buton (SMD)", 1.6m, 100_000m, 0.05m, "6.0 x 6.0 x 3.1 mm", MontajTipi.Smt),
            ("Würth Elektronik", "430182070816", "WS-TAHT Tactile Buton", 1.6m, 100_000m, 0.05m, "12.0 x 12.0 x 7.3 mm", MontajTipi.Tht),
            ("Würth Elektronik", "434111025816", "WS-TASV Tactile Buton", 1.0m, 100_000m, 0.05m, "6.0 x 6.0 x 4.3 mm", MontajTipi.Tht),
            ("Panasonic", "EVQ-P7A01P", "Minyatür Tactile Buton (SMD)", 1.6m, 300_000m, 0.02m, "3.5 x 2.9 x 1.7 mm", MontajTipi.Smt),
            ("Panasonic", "EVQ-11A05R", "Tactile Buton (SMD)", 1.6m, 100_000m, 0.02m, "6.0 x 6.0 x 3.1 mm", MontajTipi.Smt)
        ];

        return liste.Select(x => new HamParca(
            "tactile-butonlar", x.Uretici, x.Mpn,
            $"BUTON {x.Tip} {ParcaKodlama.AnlamliBasamak(x.Kuvvet, 3)}N {x.Boyut}",
            x.Montaj,
            [
                new("anahtar_tipi", x.Tip),
                new("calisma_kuvveti", $"{ParcaKodlama.AnlamliBasamak(x.Kuvvet, 3)} N", x.Kuvvet),
                new("omur_dongu", $"{x.Omur:N0} döngü", x.Omur),
                new("akim_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Akim, 3)} A", x.Akim),
                new("boyutlar", x.Boyut),
                new("montaj_sekli", x.Montaj == MontajTipi.Smt ? "Yüzey Montaj" : "Delikli Montaj")
            ]));
    }

    // -----------------------------------------------------------------------
    // Anahtar ve enkoderler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> AnahtarEnkoderler()
    {
        (string Uretici, string Mpn, string Tip, string Kontak, decimal Akim, decimal Volt, decimal Omur, MontajTipi Montaj)[] liste =
        [
            ("Alps Alpine", "EC11E15244G1", "Rotary Enkoder (Butonlu)", "24 Adım / Tur", 0.01m, 5m, 30_000m, MontajTipi.Tht),
            ("Alps Alpine", "EC11E18244AU", "Rotary Enkoder", "24 Adım / Tur", 0.01m, 5m, 30_000m, MontajTipi.Tht),
            ("Alps Alpine", "EC12E2420801", "Rotary Enkoder", "24 Adım / Tur", 0.01m, 5m, 30_000m, MontajTipi.Tht),
            ("Alps Alpine", "SRBM1L0100", "Kaydırmalı Anahtar", "SPDT (1 Form C)", 0.3m, 12m, 10_000m, MontajTipi.Smt),
            ("Alps Alpine", "SSSS811101", "Kaydırmalı Anahtar", "SPDT (1 Form C)", 0.1m, 12m, 10_000m, MontajTipi.Smt),

            ("Bourns", "PEC11R-4215F-S0024", "Rotary Enkoder (Butonlu)", "24 Adım / Tur", 0.01m, 5m, 20_000m, MontajTipi.Tht),
            ("Bourns", "PEC11R-4220F-S0024", "Rotary Enkoder (Butonlu)", "24 Adım / Tur", 0.01m, 5m, 20_000m, MontajTipi.Tht),
            ("Bourns", "PEC12R-4220F-S0024", "Rotary Enkoder", "24 Adım / Tur", 0.01m, 5m, 20_000m, MontajTipi.Tht),
            ("Bourns", "PEC16-4220F-S0024", "Rotary Enkoder", "24 Adım / Tur", 0.01m, 5m, 15_000m, MontajTipi.Tht),
            ("Bourns", "ECW1J-B24-BC0024L", "Optik Rotary Enkoder", "24 Adım / Tur", 0.01m, 5m, 1_000_000m, MontajTipi.Tht),

            ("C&K", "7101SYZQE", "Toggle Anahtar", "SPDT (1 Form C)", 5m, 120m, 60_000m, MontajTipi.Tht),
            ("C&K", "7103SYZQE", "Toggle Anahtar (Orta Konumlu)", "SPDT (1 Form C)", 5m, 120m, 60_000m, MontajTipi.Tht),
            ("C&K", "7201SYZQE", "Toggle Anahtar", "DPDT (2 Form C)", 5m, 120m, 60_000m, MontajTipi.Tht),
            ("C&K", "1101M2S3CQE2", "Toggle Anahtar (Minyatür)", "SPDT (1 Form C)", 0.4m, 20m, 40_000m, MontajTipi.Tht),
            ("C&K", "OS102011MA1QN1", "Kaydırmalı Anahtar", "SPDT (1 Form C)", 0.3m, 30m, 10_000m, MontajTipi.Tht),

            ("NKK Switches", "M2012SS1W01", "Toggle Anahtar", "SPDT (1 Form C)", 0.4m, 125m, 30_000m, MontajTipi.Tht),
            ("NKK Switches", "SS12SDP2", "Kaydırmalı Anahtar", "SPDT (1 Form C)", 0.4m, 125m, 30_000m, MontajTipi.Tht),
            ("NKK Switches", "MB2011SS1W01", "Basmalı Anahtar", "SPST (1 Form A)", 0.4m, 125m, 50_000m, MontajTipi.Tht),

            ("E-Switch", "100SP1T1B4M2QE", "Toggle Anahtar", "SPDT (1 Form C)", 5m, 120m, 30_000m, MontajTipi.Tht),
            ("E-Switch", "RR3130ABLKBLKEF", "Rocker Anahtar", "SPST (1 Form A)", 16m, 250m, 10_000m, MontajTipi.Yok),
            ("E-Switch", "EG1218", "Kaydırmalı Anahtar", "SPDT (1 Form C)", 0.3m, 50m, 10_000m, MontajTipi.Tht),
            ("E-Switch", "PV6F240SS-1", "Basmalı Anahtar (Anti-Vandal)", "SPST (1 Form A)", 3m, 250m, 50_000m, MontajTipi.Yok),

            ("CTS", "209-4MST", "DIP Anahtar (4 Konum)", "4 x SPST", 0.1m, 50m, 2_000m, MontajTipi.Tht),
            ("CTS", "209-8MST", "DIP Anahtar (8 Konum)", "8 x SPST", 0.1m, 50m, 2_000m, MontajTipi.Tht),
            ("CTS", "219-4MST", "DIP Anahtar (4 Konum)", "4 x SPST", 0.1m, 50m, 2_000m, MontajTipi.Tht),
            ("CTS", "218-8LPST", "DIP Anahtar (8 Konum, SMD)", "8 x SPST", 0.1m, 50m, 2_000m, MontajTipi.Smt),
            ("CTS", "220AMA10", "Rotary DIP Anahtar (10 Konum)", "BCD Kodlu", 0.1m, 50m, 5_000m, MontajTipi.Tht),

            ("Omron", "A6S-4104-H", "DIP Anahtar (4 Konum)", "4 x SPST", 0.025m, 24m, 1_000m, MontajTipi.Tht),
            ("Omron", "A6S-8104-H", "DIP Anahtar (8 Konum)", "8 x SPST", 0.025m, 24m, 1_000m, MontajTipi.Tht),
            ("Omron", "D2F-01F", "Mikro Anahtar (Manivelalı)", "SPDT (1 Form C)", 0.1m, 30m, 1_000_000m, MontajTipi.Yok),
            ("Omron", "SS-5GL", "Mikro Anahtar (Manivelalı)", "SPDT (1 Form C)", 5m, 250m, 1_000_000m, MontajTipi.Yok),
            ("Omron", "SS-5", "Mikro Anahtar", "SPDT (1 Form C)", 5m, 250m, 1_000_000m, MontajTipi.Yok)
        ];

        return liste.Select(x => new HamParca(
            "anahtar-enkoderler", x.Uretici, x.Mpn,
            $"ANAHTAR {x.Tip} {x.Kontak} {ParcaKodlama.AnlamliBasamak(x.Akim, 3)}A {ParcaKodlama.AnlamliBasamak(x.Volt, 4)}V",
            x.Montaj,
            [
                new("anahtar_tipi", x.Tip),
                new("kontak_duzeni", x.Kontak),
                new("akim_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Akim, 4)} A", x.Akim),
                new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Volt, 4)} V", x.Volt),
                new("omur_dongu", $"{x.Omur:N0} döngü", x.Omur),
                new("montaj_sekli", x.Montaj switch
                {
                    MontajTipi.Smt => "Yüzey Montaj",
                    MontajTipi.Tht => "Delikli Montaj",
                    _ => "Panel Montajı"
                })
            ]));
    }

    // -----------------------------------------------------------------------
    // Potansiyometre ve trimpotlar
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Potansiyometreler()
    {
        // Bourns trimpot serileri — kod sonundaki üç hane EIA direnç kodudur.
        decimal[] degerler = [100m, 200m, 500m, 1_000m, 2_000m, 5_000m, 10_000m, 20_000m, 50_000m,
                              100_000m, 200_000m, 500_000m, 1_000_000m];

        (string Seri, string Tip, string Tur, string Guc, MontajTipi Montaj)[] seriler =
        [
            ("3296W-1", "Çok Turlu Trimpot (Dikey)", "25 Tur", "0.5 W", MontajTipi.Tht),
            ("3296Y-1", "Çok Turlu Trimpot (Yatay)", "25 Tur", "0.5 W", MontajTipi.Tht),
            ("3386P-1", "Tek Turlu Trimpot (Dikey)", "1 Tur", "0.5 W", MontajTipi.Tht),
            ("3362P-1", "Tek Turlu Trimpot (Dikey)", "1 Tur", "0.5 W", MontajTipi.Tht),
            ("3266W-1", "Çok Turlu Trimpot (Dikey)", "12 Tur", "0.25 W", MontajTipi.Tht)
        ];

        foreach (var (seri, tip, tur, guc, montaj) in seriler)
        foreach (var ohm in degerler)
        {
            var kod = ParcaKodlama.EiaUcHane(ohm);

            yield return new HamParca(
                "potansiyometre-trimpotlar", "Bourns", $"{seri}-{kod}LF",
                $"TRIMPOT {ParcaKodlama.DirencKisa(ohm)} {tur} {guc} {tip}",
                montaj,
                [
                    new("direnc_degeri", ParcaKodlama.DirencYazisi(ohm), ohm),
                    new("potansiyometre_tipi", tip),
                    new("tur_sayisi", tur),
                    new("tolerans", "±%10"),
                    new("guc_derecesi", guc),
                    new("montaj_sekli", "Delikli Montaj")
                ]);
        }

        (string Uretici, string Mpn, decimal Ohm, string Tip, string Tur, string Guc)[] panel =
        [
            ("Bourns", "PTV09A-4225F-B103", 10_000m, "Panel Potansiyometre (9 mm)", "1 Tur", "0.05 W"),
            ("Bourns", "PTV09A-4225F-B503", 50_000m, "Panel Potansiyometre (9 mm)", "1 Tur", "0.05 W"),
            ("Bourns", "PTV09A-4225F-B104", 100_000m, "Panel Potansiyometre (9 mm)", "1 Tur", "0.05 W"),
            ("Bourns", "PDB181-K420K-104B", 100_000m, "Panel Potansiyometre (16 mm)", "1 Tur", "0.2 W"),
            ("Bourns", "PDB181-K420K-103B", 10_000m, "Panel Potansiyometre (16 mm)", "1 Tur", "0.2 W"),
            ("Bourns", "3590S-2-103L", 10_000m, "Hassas Çok Turlu Potansiyometre", "10 Tur", "2 W"),
            ("Bourns", "3590S-2-104L", 100_000m, "Hassas Çok Turlu Potansiyometre", "10 Tur", "2 W"),
            ("Alps Alpine", "RK09K1130A2P", 10_000m, "Panel Potansiyometre (9 mm)", "1 Tur", "0.05 W"),
            ("Alps Alpine", "RK09K1130A5W", 50_000m, "Panel Potansiyometre (9 mm)", "1 Tur", "0.05 W"),
            ("Alps Alpine", "RK09L1140A5R", 10_000m, "Panel Potansiyometre (Uzun Şaftlı)", "1 Tur", "0.05 W"),
            ("Vishay", "P160KNP-0QC15B10K", 10_000m, "Panel Potansiyometre (16 mm)", "1 Tur", "0.25 W"),
            ("Vishay", "T73YE103KT20", 10_000m, "Trimpot (SMD)", "1 Tur", "0.125 W"),
            ("Vishay", "T73YE104KT20", 100_000m, "Trimpot (SMD)", "1 Tur", "0.125 W"),
            ("TE Connectivity", "3224W-1-103E", 10_000m, "Çok Turlu Trimpot (SMD)", "12 Tur", "0.25 W")
        ];

        foreach (var p in panel)
        {
            yield return new HamParca(
                "potansiyometre-trimpotlar", p.Uretici, p.Mpn,
                $"POT {ParcaKodlama.DirencKisa(p.Ohm)} {p.Tur} {p.Guc} {p.Tip}",
                p.Tip.Contains("SMD", StringComparison.Ordinal) ? MontajTipi.Smt : MontajTipi.Tht,
                [
                    new("direnc_degeri", ParcaKodlama.DirencYazisi(p.Ohm), p.Ohm),
                    new("potansiyometre_tipi", p.Tip),
                    new("tur_sayisi", p.Tur),
                    new("tolerans", "±%20"),
                    new("guc_derecesi", p.Guc),
                    new("montaj_sekli", p.Tip.Contains("SMD", StringComparison.Ordinal) ? "Yüzey Montaj" : "Delikli / Panel Montajı")
                ]);
        }
    }
}
