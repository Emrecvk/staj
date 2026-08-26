using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Direnç parça numaraları — üreticilerin yayımladığı sipariş kodu şemasının
/// birebir uygulanmasıyla üretilir. Şemalar:
///
///   Yageo RC     : RC | kılıf | tolerans | R-07 | değer | L      -> RC0603FR-0710KL
///   Vishay CRCW  : CRCW | kılıf | değer(4) | tolerans | TCR | EA -> CRCW060310K0FKEA
///   Panasonic ERJ: ERJ- | boy+seri | tolerans | değer | son harf -> ERJ-3EKF1002V
///   KOA RK73     : RK73 | seri | boy | TTD | değer | tolerans    -> RK73H1JTTD1002F
///   Bourns CR    : CR | kılıf | -FX-/-JW- | değer | ELF          -> CR0603-FX-1002ELF
///   Yageo CFR/MFR: CFR- | güç | JB-52- | değer                   -> CFR-25JB-52-10K
///   Vishay CCF   : CCF | güç | değer(4) | F | K | E36            -> CCF0710K0FKE36
///
/// Değer serileri EIA/IEC 60063 standardıdır (E12 ±%10 kademeli gövde, E24 ±%5),
/// yani üretilen her kombinasyon üreticinin katalogunda listelenen bir parçadır.
/// Parametreler MPN'den türetilir; ayrıca rastgele seçilmez.
/// </summary>
public static class DirencKaynagi
{
    /// <summary>Kılıf başına anma gücü — tüm çip direnç üreticilerinde ortaktır.</summary>
    private static readonly Dictionary<string, string> KilifGucu = new()
    {
        ["0402"] = "1/16 W",
        ["0603"] = "1/10 W",
        ["0805"] = "1/8 W",
        ["1206"] = "1/4 W",
        ["1210"] = "1/3 W",
        ["2010"] = "3/4 W",
        ["2512"] = "1 W"
    };

    private const string SicaklikAraligi = "-55 ~ +155 °C";
    private const string Teknoloji = "Kalın Film";

    /// <summary>±%5 gövde: E12 serisi, 1 Ω – 8.2 MΩ, artı 0 Ω jumper.</summary>
    private static IReadOnlyList<decimal> BesYuzdeDegerler { get; } =
        new[] { 0m }.Concat(ParcaKodlama.Yay(ParcaKodlama.E12, 0, 6)).ToList();

    /// <summary>±%1 gövde: E24 serisi 1 Ω – 910 kΩ, artı yaygın megaohm değerleri.</summary>
    private static IReadOnlyList<decimal> BirYuzdeDegerler { get; } =
        ParcaKodlama.Yay(ParcaKodlama.E24, 0, 5)
            .Concat([1_000_000m, 1_500_000m, 2_200_000m, 4_700_000m, 10_000_000m])
            .ToList();

    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in YageoRc()) yield return p;
        foreach (var p in VishayCrcw()) yield return p;
        foreach (var p in PanasonicErj()) yield return p;
        foreach (var p in KoaRk73()) yield return p;
        foreach (var p in BournsCr()) yield return p;
        foreach (var p in SusumuRg()) yield return p;
        foreach (var p in DelikliMontaj()) yield return p;
    }

    // -----------------------------------------------------------------------
    // Yüzey montaj
    // -----------------------------------------------------------------------

    /// <summary>Yageo RC serisi — RC0603FR-0710KL biçimi.</summary>
    private static IEnumerable<HamParca> YageoRc()
    {
        foreach (var kilif in new[] { "0402", "0603", "0805", "1206" })
        {
            foreach (var (tolHarf, tolYazi, basamak, degerler) in Toleranslar())
            {
                foreach (var ohm in degerler)
                {
                    var kod = ParcaKodlama.HarfliDirencKodu(ohm, basamak);
                    yield return CipDirenc(
                        "Yageo", $"RC{kilif}{tolHarf}R-07{kod}L", kilif, ohm, tolYazi, tolHarf);
                }
            }
        }
    }

    /// <summary>Vishay CRCW serisi — CRCW060310K0FKEA biçimi (değer daima 4 karakter).</summary>
    private static IEnumerable<HamParca> VishayCrcw()
    {
        foreach (var kilif in new[] { "0402", "0603", "0805", "1206", "2010" })
        {
            foreach (var (tolHarf, tolYazi, _, degerler) in Toleranslar())
            {
                // TCR kodu toleransa bağlıdır: F -> K (±100 ppm), J -> N (±200 ppm)
                var tcrHarf = tolHarf == 'F' ? 'K' : 'N';

                foreach (var ohm in degerler)
                {
                    var kod = ParcaKodlama.VishayDirencKodu(ohm);
                    yield return CipDirenc(
                        "Vishay", $"CRCW{kilif}{kod}{tolHarf}{tcrHarf}EA", kilif, ohm, tolYazi, tolHarf);
                }
            }
        }
    }

    /// <summary>
    /// Panasonic ERJ serisi. Ön ek boya göre değişir (ERJ-3EKF vs ERJ-6ENF) ve
    /// 0402 boyunda son harf V yerine X'tir; tablo bu yüzden elle yazılmıştır.
    /// </summary>
    private static IEnumerable<HamParca> PanasonicErj()
    {
        (string Kilif, string BirOnek, string BesOnek, string Son)[] boylar =
        [
            ("0402", "ERJ-2RKF", "ERJ-2GEJ",  "X"),
            ("0603", "ERJ-3EKF", "ERJ-3GEYJ", "V"),
            ("0805", "ERJ-6ENF", "ERJ-6GEYJ", "V"),
            ("1206", "ERJ-8ENF", "ERJ-8GEYJ", "V")
        ];

        foreach (var (kilif, birOnek, besOnek, son) in boylar)
        {
            foreach (var ohm in BirYuzdeDegerler)
                yield return CipDirenc("Panasonic",
                    $"{birOnek}{ParcaKodlama.EiaDortHane(ohm)}{son}", kilif, ohm, "±%1", 'F');

            foreach (var ohm in BesYuzdeDegerler)
                yield return CipDirenc("Panasonic",
                    $"{besOnek}{ParcaKodlama.EiaUcHane(ohm)}{son}", kilif, ohm, "±%5", 'J');
        }
    }

    /// <summary>KOA RK73 serisi — RK73H (±%1) / RK73B (±%5), boy kodu harfli.</summary>
    private static IEnumerable<HamParca> KoaRk73()
    {
        (string Kilif, string BoyKodu)[] boylar =
        [
            ("0402", "1E"), ("0603", "1J"), ("0805", "2A"), ("1206", "2B"), ("2512", "3A")
        ];

        foreach (var (kilif, boy) in boylar)
        {
            foreach (var ohm in BirYuzdeDegerler)
                yield return CipDirenc("KOA Speer",
                    $"RK73H{boy}TTD{ParcaKodlama.EiaDortHane(ohm)}F", kilif, ohm, "±%1", 'F');

            foreach (var ohm in BesYuzdeDegerler)
                yield return CipDirenc("KOA Speer",
                    $"RK73B{boy}TTD{ParcaKodlama.EiaUcHane(ohm)}J", kilif, ohm, "±%5", 'J');
        }
    }

    /// <summary>Bourns CR serisi — CR0603-FX-1002ELF biçimi.</summary>
    private static IEnumerable<HamParca> BournsCr()
    {
        foreach (var kilif in new[] { "0402", "0603", "0805", "1206" })
        {
            foreach (var ohm in BirYuzdeDegerler)
                yield return CipDirenc("Bourns",
                    $"CR{kilif}-FX-{ParcaKodlama.EiaDortHane(ohm)}ELF", kilif, ohm, "±%1", 'F');

            foreach (var ohm in BesYuzdeDegerler)
                yield return CipDirenc("Bourns",
                    $"CR{kilif}-JW-{ParcaKodlama.EiaUcHane(ohm)}ELF", kilif, ohm, "±%5", 'J');
        }
    }

    /// <summary>
    /// Susumu RG serisi — ince film hassas direnç. Kılıf kodu metriktir (1608 = 0603) ve
    /// tolerans harfi B = ±%0.1'dir. Kalın film serilerinden farkı, ±25 ppm/°C sıcaklık
    /// katsayısı ve ±%0.1 toleranstır; bu yüzden ayrı bir teknoloji olarak listelenir.
    /// </summary>
    private static IEnumerable<HamParca> SusumuRg()
    {
        (string Metrik, string Eia)[] boylar = [("1005", "0402"), ("1608", "0603"), ("2012", "0805"), ("3216", "1206")];

        // Hassas seride tam E24 kademesi üretilir; burada yaygın stok aralığını kullanıyoruz.
        var degerler = ParcaKodlama.Yay(ParcaKodlama.E24, 1, 5).ToList();

        foreach (var (metrik, eia) in boylar)
        foreach (var ohm in degerler)
        {
            yield return new HamParca(
                "smd-direncler", "Susumu", $"RG{metrik}P-{ParcaKodlama.EiaUcHane(ohm)}-B-T5",
                $"RES SMD {ParcaKodlama.DirencKisa(ohm)} ±%0.1 {KilifGucu[eia]} {eia} INCE FILM",
                MontajTipi.Smt,
                [
                    new("direnc_degeri", ParcaKodlama.DirencYazisi(ohm), ohm),
                    new("tolerans", "±%0.1"),
                    new("guc_derecesi", KilifGucu[eia]),
                    new("boyut_kodu", eia),
                    new("direnc_teknolojisi", "İnce Film"),
                    new("sicaklik_katsayisi", "±25 ppm/°C", 25m),
                    new("calisma_sicakligi", "-55 ~ +155 °C")
                ]);
        }
    }

    private static (char Harf, string Yazi, int Basamak, IReadOnlyList<decimal> Degerler)[] Toleranslar() =>
    [
        ('F', "±%1", 3, BirYuzdeDegerler),
        ('J', "±%5", 2, BesYuzdeDegerler)
    ];

    private static HamParca CipDirenc(
        string uretici, string mpn, string kilif, decimal ohm, string tolerans, char tolHarf)
    {
        var guc = KilifGucu[kilif];
        var tcr = tolHarf == 'F' ? 100 : 200;

        return new HamParca(
            "smd-direncler",
            uretici,
            mpn,
            $"RES SMD {ParcaKodlama.DirencKisa(ohm)} {tolerans} {guc} {kilif}",
            MontajTipi.Smt,
            [
                new("direnc_degeri", ParcaKodlama.DirencYazisi(ohm), ohm),
                new("tolerans", tolerans),
                new("guc_derecesi", guc),
                new("boyut_kodu", kilif),
                new("direnc_teknolojisi", Teknoloji),
                new("sicaklik_katsayisi", $"±{tcr} ppm/°C", tcr),
                new("calisma_sicakligi", SicaklikAraligi)
            ]);
    }

    // -----------------------------------------------------------------------
    // Delikli montaj (eksenel)
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> DelikliMontaj()
    {
        // Yageo CFR — karbon film, ±%5. Güç kodu: 12=1/8W, 25=1/4W, 50=1/2W, 100=1W.
        (string Kod, string Guc)[] cfrGucler = [("12", "1/8 W"), ("25", "1/4 W"), ("50", "1/2 W"), ("100", "1 W")];

        foreach (var (kod, guc) in cfrGucler)
        foreach (var ohm in BesYuzdeDegerler)
        {
            if (ohm == 0m) continue; // eksenel seride 0 Ω jumper yoktur

            yield return EkseneDirenc("Yageo",
                $"CFR-{kod}JB-52-{ParcaKodlama.HarfliDirencKodu(ohm, 2)}",
                ohm, "±%5", guc, "Karbon Film", 500);
        }

        // Yageo MFR — metal film, ±%1.
        (string Kod, string Guc)[] mfrGucler = [("25", "1/4 W"), ("50", "1/2 W")];

        foreach (var (kod, guc) in mfrGucler)
        foreach (var ohm in BesYuzdeDegerler)
        {
            if (ohm == 0m) continue;

            yield return EkseneDirenc("Yageo",
                $"MFR-{kod}FBF52-{ParcaKodlama.HarfliDirencKodu(ohm, 3)}",
                ohm, "±%1", guc, "Metal Film", 50);
        }

        // Vishay CCF — metal film, ±%1. CCF07 = 1/4 W, CCF60 = 1/2 W.
        (string Kod, string Guc)[] ccfGucler = [("07", "1/4 W"), ("60", "1/2 W")];

        foreach (var (kod, guc) in ccfGucler)
        foreach (var ohm in BesYuzdeDegerler)
        {
            if (ohm == 0m) continue;

            yield return EkseneDirenc("Vishay",
                $"CCF{kod}{ParcaKodlama.VishayDirencKodu(ohm)}FKE36",
                ohm, "±%1", guc, "Metal Film", 50);
        }
    }

    private static HamParca EkseneDirenc(
        string uretici, string mpn, decimal ohm, string tolerans, string guc, string teknoloji, int tcr) =>
        new(
            "tht-direncler",
            uretici,
            mpn,
            $"RES {ParcaKodlama.DirencKisa(ohm)} {tolerans} {guc} EKSENEL",
            MontajTipi.Tht,
            [
                new("direnc_degeri", ParcaKodlama.DirencYazisi(ohm), ohm),
                new("tolerans", tolerans),
                new("guc_derecesi", guc),
                new("direnc_teknolojisi", teknoloji),
                new("sicaklik_katsayisi", $"±{tcr} ppm/°C", tcr),
                new("calisma_sicakligi", "-55 ~ +155 °C")
            ]);
}
