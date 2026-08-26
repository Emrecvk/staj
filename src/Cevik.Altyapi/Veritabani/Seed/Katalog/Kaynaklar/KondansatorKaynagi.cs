using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Kondansatör parça numaraları.
///
///   KEMET C serisi   : C | kılıf | C | değer | tol | volt | dielektrik | ACTU
///                      -> C0603C104K5RACTU  (0603, 100 nF, ±%10, 50 V, X7R)
///   Kyocera AVX      : kılıf | volt | dielektrik | değer | tol | AT2A
///                      -> 08055C104KAT2A    (0805, 50 V, X7R, 100 nF, ±%10)
///   Panasonic EEU    : EEU- | seri | volt(2) | değer(3)
///                      -> EEU-FR1V101       (FR serisi, 35 V, 100 µF)
///   KEMET T491       : T491 | kılıf | değer | tol | volt(3) | AT
///                      -> T491A105K016AT    (A kılıf, 1 µF, ±%10, 16 V)
///   Kyocera AVX TAJ  : TAJ | kılıf | değer | tol | volt(3) | RNJ
///                      -> TAJA105K016RNJ
///
/// MLCC üretiminde <see cref="MlccKurallari"/> tablosu fiziksel sınırları uygular:
/// bir 0402 kılıfa 100 µF sığmaz, 50 V'luk bir 0402 X7R'de üst sınır 10 nF'dir.
/// Bu tablo olmadan şema "geçerli görünen ama var olmayan" kodlar üretirdi.
/// </summary>
public static class KondansatorKaynagi
{
    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in Mlcc()) yield return p;
        foreach (var p in SecilmisMlcc()) yield return p;
        foreach (var p in Elektrolitik()) yield return p;
        foreach (var p in SecilmisElektrolitik()) yield return p;
        foreach (var p in Tantal()) yield return p;
        foreach (var p in Film()) yield return p;
    }

    // -----------------------------------------------------------------------
    // Seramik (MLCC)
    // -----------------------------------------------------------------------

    /// <summary>Bir dielektrik + kılıf ikilisinin gerçek kapasitans/voltaj sınırları (pF).</summary>
    private sealed record MlccKurali(
        string Dielektrik,
        string Kilif,
        decimal MinPf,
        (decimal Volt, decimal MaxPf)[] Voltajlar);

    private static readonly MlccKurali[] MlccKurallari =
    [
        // C0G / NP0 — düşük değer, yüksek kararlılık.
        // Alt sınır 10 pF: altındaki değerlerde tolerans yüzde değil mutlak pF cinsinden
        // (B/C/D kodları) verilir ve buradaki ±%5 (J) kodu geçerli olmaz.
        new("C0G / NP0", "0402", 10m,  [(25m, 1_000m),  (50m, 470m)]),
        new("C0G / NP0", "0603", 10m,  [(25m, 2_200m),  (50m, 1_000m),  (100m, 470m)]),
        new("C0G / NP0", "0805", 10m,  [(50m, 4_700m),  (100m, 1_000m)]),
        new("C0G / NP0", "1206", 100m, [(50m, 10_000m), (100m, 4_700m)]),
        new("C0G / NP0", "1210", 100m, [(50m, 22_000m), (100m, 10_000m)]),

        // X7R — genel amaçlı ayrıştırma
        new("X7R", "0402", 100m,    [(16m, 100_000m),    (25m, 47_000m),    (50m, 10_000m)]),
        new("X7R", "0603", 100m,    [(16m, 1_000_000m),  (25m, 470_000m),   (50m, 100_000m),   (100m, 10_000m)]),
        new("X7R", "0805", 1_000m,  [(16m, 2_200_000m),  (25m, 1_000_000m), (50m, 470_000m),   (100m, 47_000m)]),
        new("X7R", "1206", 1_000m,  [(16m, 10_000_000m), (25m, 4_700_000m), (50m, 1_000_000m), (100m, 100_000m)]),
        new("X7R", "1210", 10_000m, [(16m, 22_000_000m), (25m, 10_000_000m), (50m, 2_200_000m)]),

        // X5R — yüksek kapasitans, dar sıcaklık aralığı
        new("X5R", "0402", 1_000m,     [(6.3m, 2_200_000m),   (10m, 1_000_000m),  (16m, 470_000m)]),
        new("X5R", "0603", 10_000m,    [(6.3m, 10_000_000m),  (10m, 4_700_000m),  (16m, 2_200_000m),  (25m, 1_000_000m)]),
        new("X5R", "0805", 100_000m,   [(6.3m, 22_000_000m),  (10m, 10_000_000m), (16m, 4_700_000m),  (25m, 2_200_000m)]),
        new("X5R", "1206", 1_000_000m, [(6.3m, 47_000_000m),  (10m, 22_000_000m), (16m, 10_000_000m), (25m, 4_700_000m)]),
        new("X5R", "1210", 1_000_000m, [(6.3m, 100_000_000m), (10m, 47_000_000m), (16m, 22_000_000m)])
    ];

    /// <summary>KEMET voltaj kodu tablosu.</summary>
    private static readonly Dictionary<decimal, char> KemetVoltaj = new()
    {
        [6.3m] = '9', [10m] = '8', [16m] = '4', [25m] = '3', [50m] = '5', [100m] = '1'
    };

    /// <summary>Kyocera AVX voltaj kodu tablosu.</summary>
    private static readonly Dictionary<decimal, char> AvxVoltaj = new()
    {
        [6.3m] = '6', [10m] = 'Z', [16m] = 'Y', [25m] = '3', [50m] = '5', [100m] = '1'
    };

    private static readonly Dictionary<string, char> KemetDielektrik = new()
    {
        ["C0G / NP0"] = 'G', ["X7R"] = 'R', ["X5R"] = 'P'
    };

    private static readonly Dictionary<string, char> AvxDielektrik = new()
    {
        ["C0G / NP0"] = 'A', ["X7R"] = 'C', ["X5R"] = 'D'
    };

    private static IEnumerable<HamParca> Mlcc()
    {
        foreach (var kural in MlccKurallari)
        {
            // C0G düşük değer serisidir ve E12 kademesinde üretilir;
            // yüksek kapasiteli X7R/X5R gövdeler pratikte E6 kademesindedir.
            var mantisler = kural.Dielektrik.StartsWith("C0G", StringComparison.Ordinal)
                ? ParcaKodlama.E12
                : ParcaKodlama.E6;

            var tolerans = kural.Dielektrik.StartsWith("C0G", StringComparison.Ordinal) ? "±%5" : "±%10";
            var tolHarf = tolerans == "±%5" ? 'J' : 'K';

            foreach (var (volt, maxPf) in kural.Voltajlar)
            {
                foreach (var pf in ParcaKodlama.Yay(mantisler, 0, 8))
                {
                    if (pf < kural.MinPf || pf > maxPf) continue;

                    var degerKodu = ParcaKodlama.KapasitansKodu(pf);

                    yield return MlccParca("KEMET",
                        $"C{kural.Kilif}C{degerKodu}{tolHarf}{KemetVoltaj[volt]}{KemetDielektrik[kural.Dielektrik]}ACTU",
                        kural.Kilif, pf, volt, kural.Dielektrik, tolerans);

                    yield return MlccParca("Kyocera AVX",
                        $"{kural.Kilif}{AvxVoltaj[volt]}{AvxDielektrik[kural.Dielektrik]}{degerKodu}{tolHarf}AT2A",
                        kural.Kilif, pf, volt, kural.Dielektrik, tolerans);
                }
            }
        }
    }

    private static HamParca MlccParca(
        string uretici, string mpn, string kilif, decimal pf, decimal volt, string dielektrik, string tolerans)
    {
        var sicaklik = dielektrik == "X5R" ? "-55 ~ +85 °C" : "-55 ~ +125 °C";

        return new HamParca(
            "seramik-kondansatorler",
            uretici,
            mpn,
            $"CAP SER {ParcaKodlama.KapasitansYazisi(pf)} {tolerans} {ParcaKodlama.AnlamliBasamak(volt, 3)}V {dielektrik} {kilif}",
            MontajTipi.Smt,
            [
                new("kapasitans", ParcaKodlama.KapasitansYazisi(pf), pf / 1_000_000m),
                new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(volt, 3)} V", volt),
                new("dielektrik", dielektrik),
                new("boyut_kodu", kilif),
                new("tolerans", tolerans),
                new("calisma_sicakligi", sicaklik)
            ]);
    }

    /// <summary>
    /// Murata, Samsung, TDK, Yageo ve Taiyo Yuden'in yaygın MLCC kodları.
    /// Bu üreticilerin sipariş kodunda kapasitansa göre değişen bir kalınlık/elektrot
    /// alanı bulunur (GRM188<b>R71H</b>104KA<b>93</b>D gibi) ve bu alan şemadan
    /// türetilemez; bu yüzden kombinatoryal üretmek yerine gerçek kodlar listelenir.
    /// </summary>
    private static IEnumerable<HamParca> SecilmisMlcc()
    {
        (string Uretici, string Mpn, string Kilif, decimal Pf, decimal Volt, string Diel, string Tol)[] liste =
        [
            ("Murata", "GRM188R71H104KA93D", "0603", 100_000m, 50m, "X7R", "±%10"),
            ("Murata", "GRM155R71C104KA88D", "0402", 100_000m, 16m, "X7R", "±%10"),
            ("Murata", "GRM155R71H102KA01D", "0402", 1_000m, 50m, "X7R", "±%10"),
            ("Murata", "GRM216R71H103KA01D", "0805", 10_000m, 50m, "X7R", "±%10"),
            ("Murata", "GRM188R61A106ME69D", "0603", 10_000_000m, 10m, "X5R", "±%20"),
            ("Murata", "GRM188R61C225KE15D", "0603", 2_200_000m, 16m, "X5R", "±%10"),
            ("Murata", "GRM21BR61E106KA73L", "0805", 10_000_000m, 25m, "X5R", "±%10"),
            ("Murata", "GRM31CR61E226KE15L", "1206", 22_000_000m, 25m, "X5R", "±%10"),
            ("Murata", "GRM32ER61A476ME20L", "1210", 47_000_000m, 10m, "X5R", "±%20"),
            ("Murata", "GRM1885C1H101JA01D", "0603", 100m, 50m, "C0G / NP0", "±%5"),
            ("Murata", "GRM1885C1H220JA01D", "0603", 22m, 50m, "C0G / NP0", "±%5"),
            ("Murata", "GRM155R61A104KA01D", "0402", 100_000m, 10m, "X5R", "±%10"),

            ("Samsung Electro-Mechanics", "CL10B104KB8NNNC", "0603", 100_000m, 25m, "X7R", "±%10"),
            ("Samsung Electro-Mechanics", "CL05B104KO5NNNC", "0402", 100_000m, 16m, "X7R", "±%10"),
            ("Samsung Electro-Mechanics", "CL21B104KBCNNNC", "0805", 100_000m, 50m, "X7R", "±%10"),
            ("Samsung Electro-Mechanics", "CL31B105KBHNNNE", "1206", 1_000_000m, 25m, "X7R", "±%10"),
            ("Samsung Electro-Mechanics", "CL21A106KAYNNNE", "0805", 10_000_000m, 16m, "X5R", "±%10"),
            ("Samsung Electro-Mechanics", "CL05A105KQ5NNNC", "0402", 1_000_000m, 6.3m, "X5R", "±%10"),
            ("Samsung Electro-Mechanics", "CL10C220JB8NNNC", "0603", 22m, 25m, "C0G / NP0", "±%5"),
            ("Samsung Electro-Mechanics", "CL32A476MQVNNNE", "1210", 47_000_000m, 6.3m, "X5R", "±%20"),

            ("TDK", "C1608X7R1H104K080AB", "0603", 100_000m, 50m, "X7R", "±%10"),
            ("TDK", "C1005X7R1H103K050BB", "0402", 10_000m, 50m, "X7R", "±%10"),
            ("TDK", "C2012X5R1A106K125AB", "0805", 10_000_000m, 10m, "X5R", "±%10"),
            ("TDK", "C3216X7R1H105K160AB", "1206", 1_000_000m, 50m, "X7R", "±%10"),
            ("TDK", "C1608C0G1H220J080AA", "0603", 22m, 50m, "C0G / NP0", "±%5"),

            ("Yageo", "CC0603KRX7R9BB104", "0603", 100_000m, 50m, "X7R", "±%10"),
            ("Yageo", "CC0402KRX7R7BB104", "0402", 100_000m, 16m, "X7R", "±%10"),
            ("Yageo", "CC0805KKX7R9BB104", "0805", 100_000m, 50m, "X7R", "±%10"),
            ("Yageo", "CC1206KKX7R8BB105", "1206", 1_000_000m, 25m, "X7R", "±%10"),

            ("Taiyo Yuden", "TMK107BJ105KA-T", "0603", 1_000_000m, 25m, "X5R", "±%10"),
            ("Taiyo Yuden", "EMK212BJ106KG-T", "0805", 10_000_000m, 25m, "X5R", "±%10"),
            ("Taiyo Yuden", "LMK107BJ475KA-T", "0603", 4_700_000m, 25m, "X5R", "±%10")
        ];

        return liste.Select(x => MlccParca(x.Uretici, x.Mpn, x.Kilif, x.Pf, x.Volt, x.Diel, x.Tol));
    }

    // -----------------------------------------------------------------------
    // Alüminyum elektrolitik
    // -----------------------------------------------------------------------

    /// <summary>EIA voltaj kodları — Panasonic ve diğer Japon üreticiler ortak kullanır.</summary>
    private static readonly (decimal Volt, string Kod, decimal MaxUf)[] ElektrolitikVoltajlar =
    [
        (6.3m,  "0J", 6_800m),
        (10m,   "1A", 4_700m),
        (16m,   "1C", 3_300m),
        (25m,   "1E", 2_200m),
        (35m,   "1V", 1_000m),
        (50m,   "1H", 470m),
        (63m,   "1J", 330m),
        (100m,  "2A", 220m),
        (160m,  "2C", 100m),
        (250m,  "2E", 47m),
        (400m,  "2G", 22m)
    ];

    private static readonly decimal[] ElektrolitikDegerler =
        [1m, 2.2m, 3.3m, 4.7m, 10m, 22m, 33m, 47m, 100m, 220m, 330m, 470m, 1_000m, 2_200m, 3_300m, 4_700m, 6_800m];

    private static IEnumerable<HamParca> Elektrolitik()
    {
        // FR: düşük empedans / uzun ömür, FC: genel amaçlı. İkisi de radyal, delikli montaj.
        (string Seri, string Ad, int OmurSaat, string Esr)[] seriler =
        [
            ("FR", "Düşük ESR", 10_000, "Düşük"),
            ("FC", "Genel Amaçlı", 5_000, "Standart")
        ];

        foreach (var (seri, ad, omur, esrSinifi) in seriler)
        foreach (var (volt, voltKod, maxUf) in ElektrolitikVoltajlar)
        foreach (var uf in ElektrolitikDegerler)
        {
            if (uf > maxUf) continue;

            var degerKodu = UfKodu(uf);

            yield return new HamParca(
                "elektrolitik-kondansatorler",
                "Panasonic",
                $"EEU-{seri}{voltKod}{degerKodu}",
                $"CAP ALU {ParcaKodlama.AnlamliBasamak(uf, 4)}µF ±%20 {ParcaKodlama.AnlamliBasamak(volt, 3)}V RADYAL",
                MontajTipi.Tht,
                [
                    new("kapasitans", $"{ParcaKodlama.AnlamliBasamak(uf, 4)} µF", uf),
                    new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(volt, 3)} V", volt),
                    new("kondansator_tipi", $"Alüminyum Elektrolitik — {ad}"),
                    new("esr", esrSinifi == "Düşük" ? "Düşük ESR" : "Standart ESR"),
                    new("omur_saat", $"{omur:N0} saat @105 °C", omur),
                    new("boyutlar", ElektrolitikGovde(uf, volt)),
                    new("montaj_sekli", "Radyal / Delikli")
                ]);
        }
    }

    /// <summary>
    /// µF değerini 3 haneli EIA koduna çevirir: 100 µF -> "101", 1000 µF -> "102".
    /// 10 µF altındaki değerlerde ondalık ayraç olarak "R" kullanılır: 2.2 µF -> "2R2".
    /// Üssel gösterim burada kullanılamaz, çünkü 2.2 µF'yi "020" yapıp 2 µF'ye
    /// yuvarlardı — yani var olmayan bir parça numarası üretirdi.
    /// </summary>
    private static string UfKodu(decimal uf)
    {
        if (uf < 10m)
        {
            var metin = ParcaKodlama.AnlamliBasamak(uf, 2);
            var nokta = metin.IndexOf('.');
            var harfli = nokta < 0
                ? metin + "R"
                : string.Concat(metin.AsSpan(0, nokta), "R", metin.AsSpan(nokta + 1));

            // "0.47" -> "0R47" -> baştaki sıfır düşer: "R47"
            if (harfli.StartsWith("0R", StringComparison.Ordinal)) harfli = harfli[1..];

            return harfli.PadRight(3, '0');
        }

        var us = 0;
        var deger = uf;
        while (deger >= 100m) { deger /= 10m; us++; }

        return $"{Math.Round(deger, MidpointRounding.AwayFromZero):00}{us}";
    }

    /// <summary>Kapasitans ve voltaja göre tipik radyal gövde ölçüsü.</summary>
    private static string ElektrolitikGovde(decimal uf, decimal volt)
    {
        var hacim = uf * volt;
        return hacim switch
        {
            < 200m => "5 x 11 mm",
            < 1_000m => "6.3 x 11 mm",
            < 5_000m => "8 x 11.5 mm",
            < 20_000m => "10 x 16 mm",
            < 60_000m => "12.5 x 20 mm",
            _ => "16 x 25 mm"
        };
    }

    private static IEnumerable<HamParca> SecilmisElektrolitik()
    {
        (string Uretici, string Mpn, decimal Uf, decimal Volt, string Tip, int Omur)[] liste =
        [
            ("Nichicon", "UVR1H101MPD", 100m, 50m, "Alüminyum Elektrolitik — Genel Amaçlı", 2_000),
            ("Nichicon", "UVR1C101MDD", 100m, 16m, "Alüminyum Elektrolitik — Genel Amaçlı", 2_000),
            ("Nichicon", "UVR1V101MPD", 100m, 35m, "Alüminyum Elektrolitik — Genel Amaçlı", 2_000),
            ("Nichicon", "UVR1E471MPD", 470m, 25m, "Alüminyum Elektrolitik — Genel Amaçlı", 2_000),
            ("Nichicon", "UHE1C102MHD", 1_000m, 16m, "Alüminyum Elektrolitik — Düşük Empedans", 5_000),
            ("Nichicon", "UPW1V101MPD", 100m, 35m, "Alüminyum Elektrolitik — Düşük Empedans", 5_000),
            ("Rubycon", "16ZLH1000MEFC10X16", 1_000m, 16m, "Alüminyum Elektrolitik — Düşük ESR", 8_000),
            ("Rubycon", "25YXF100MEFC6.3X11", 100m, 25m, "Alüminyum Elektrolitik — Düşük ESR", 8_000),
            ("Rubycon", "35YXF470MEFC10X12.5", 470m, 35m, "Alüminyum Elektrolitik — Düşük ESR", 8_000),
            ("Illinois Capacitor", "107RSU016M", 100m, 16m, "Alüminyum Elektrolitik — Genel Amaçlı", 2_000),
            ("Illinois Capacitor", "477RSU025M", 470m, 25m, "Alüminyum Elektrolitik — Genel Amaçlı", 2_000)
        ];

        return liste.Select(x => new HamParca(
            "elektrolitik-kondansatorler",
            x.Uretici,
            x.Mpn,
            $"CAP ALU {ParcaKodlama.AnlamliBasamak(x.Uf, 4)}µF ±%20 {ParcaKodlama.AnlamliBasamak(x.Volt, 3)}V RADYAL",
            MontajTipi.Tht,
            [
                new("kapasitans", $"{ParcaKodlama.AnlamliBasamak(x.Uf, 4)} µF", x.Uf),
                new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Volt, 3)} V", x.Volt),
                new("kondansator_tipi", x.Tip),
                new("esr", x.Omur >= 5_000 ? "Düşük ESR" : "Standart ESR"),
                new("omur_saat", $"{x.Omur:N0} saat @105 °C", x.Omur),
                new("boyutlar", ElektrolitikGovde(x.Uf, x.Volt)),
                new("montaj_sekli", "Radyal / Delikli")
            ]));
    }

    // -----------------------------------------------------------------------
    // Tantal
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Tantal()
    {
        // EIA kılıf kodu -> (metrik ad, min µF, max µF)
        (string Kod, string Ad, decimal MinUf, decimal MaxUf)[] kiliflar =
        [
            ("A", "EIA 3216-18", 0.1m, 10m),
            ("B", "EIA 3528-21", 0.47m, 22m),
            ("C", "EIA 6032-28", 1m, 100m),
            ("D", "EIA 7343-31", 4.7m, 330m)
        ];

        // Tantalda derating şarttır: yüksek voltajlı gövdede kapasitans düşer.
        (decimal Volt, string Kod, decimal MaxUf)[] voltajlar =
        [
            (4m, "004", 330m), (6.3m, "006", 220m), (10m, "010", 100m),
            (16m, "016", 47m), (25m, "025", 22m), (35m, "035", 10m), (50m, "050", 4.7m)
        ];

        decimal[] degerler = [0.1m, 0.22m, 0.47m, 1m, 2.2m, 3.3m, 4.7m, 10m, 22m, 33m, 47m, 100m, 220m, 330m];

        foreach (var (kilifKod, kilifAd, minUf, kilifMax) in kiliflar)
        foreach (var (volt, voltKod, voltMax) in voltajlar)
        foreach (var uf in degerler)
        {
            if (uf < minUf || uf > kilifMax || uf > voltMax) continue;

            var degerKodu = ParcaKodlama.KapasitansKodu(uf * 1_000_000m);

            yield return TantalParca("KEMET", $"T491{kilifKod}{degerKodu}K{voltKod}AT",
                kilifKod, kilifAd, uf, volt);

            yield return TantalParca("Kyocera AVX", $"TAJ{kilifKod}{degerKodu}K{voltKod}RNJ",
                kilifKod, kilifAd, uf, volt);
        }
    }

    private static HamParca TantalParca(
        string uretici, string mpn, string kilifKod, string kilifAd, decimal uf, decimal volt) =>
        new(
            "tantal-kondansatorler",
            uretici,
            mpn,
            $"CAP TANTAL {ParcaKodlama.AnlamliBasamak(uf, 4)}µF ±%10 {ParcaKodlama.AnlamliBasamak(volt, 3)}V {kilifKod}",
            MontajTipi.Smt,
            [
                new("kapasitans", $"{ParcaKodlama.AnlamliBasamak(uf, 4)} µF", uf),
                new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(volt, 3)} V", volt),
                new("tolerans", "±%10"),
                new("esr", volt >= 25m ? "Standart ESR" : "Düşük ESR"),
                new("kilif", $"{kilifKod} ({kilifAd})"),
                new("calisma_sicakligi", "-55 ~ +125 °C")
            ]);

    // -----------------------------------------------------------------------
    // Film
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Film()
    {
        (string Uretici, string Mpn, decimal Uf, decimal Volt, string Tip, decimal Adim)[] liste =
        [
            ("EPCOS", "B32529C0104J000", 0.1m, 63m, "Metalize Polyester (MKT)", 5m),
            ("EPCOS", "B32529C0224J000", 0.22m, 63m, "Metalize Polyester (MKT)", 5m),
            ("EPCOS", "B32529C0474J000", 0.47m, 63m, "Metalize Polyester (MKT)", 5m),
            ("EPCOS", "B32529C0105J000", 1m, 63m, "Metalize Polyester (MKT)", 5m),
            ("EPCOS", "B32922C3104M000", 0.1m, 305m, "X2 Parazit Giderme", 15m),
            ("EPCOS", "B32922C3224M000", 0.22m, 305m, "X2 Parazit Giderme", 15m),
            ("EPCOS", "B32923C3474M000", 0.47m, 305m, "X2 Parazit Giderme", 22.5m),
            ("EPCOS", "B32924C3105M000", 1m, 305m, "X2 Parazit Giderme", 27.5m),

            ("Vishay", "MKT1817310065", 0.1m, 63m, "Metalize Polyester (MKT)", 5m),
            ("Vishay", "MKT1817422065", 0.22m, 63m, "Metalize Polyester (MKT)", 5m),
            ("Vishay", "BFC233820104", 0.1m, 275m, "X2 Parazit Giderme", 15m),
            ("Vishay", "BFC233920474", 0.47m, 275m, "X2 Parazit Giderme", 22.5m),

            ("KEMET", "R82DC3100DQ50J", 0.01m, 63m, "Metalize Polyester (MKT)", 5m),
            ("KEMET", "R82EC3100DQ60J", 0.1m, 63m, "Metalize Polyester (MKT)", 5m),
            ("KEMET", "R46KI310000M1M", 0.1m, 275m, "X2 Parazit Giderme", 15m),
            ("KEMET", "R46KN422000M1M", 0.22m, 275m, "X2 Parazit Giderme", 15m),

            ("Würth Elektronik", "890324025003", 0.1m, 63m, "Metalize Polyester (MKT)", 5m),
            ("Würth Elektronik", "890324025011", 0.47m, 63m, "Metalize Polyester (MKT)", 7.5m),
            ("Würth Elektronik", "890334025003", 0.1m, 305m, "X2 Parazit Giderme", 15m),

            ("Panasonic", "ECQ-E1104KF", 0.1m, 100m, "Metalize Polyester (MKT)", 7.5m),
            ("Panasonic", "ECQ-E1224KF", 0.22m, 100m, "Metalize Polyester (MKT)", 10m),
            ("Panasonic", "ECQ-E1474KF", 0.47m, 100m, "Metalize Polyester (MKT)", 15m),
            ("Panasonic", "ECW-F2104JA", 0.1m, 250m, "Polipropilen (MKP)", 15m),
            ("Panasonic", "ECW-F2224JA", 0.22m, 250m, "Polipropilen (MKP)", 22.5m),

            ("Cornell Dubilier", "940C20P1K-F", 0.1m, 2_000m, "Polipropilen (MKP)", 22.5m),
            ("Cornell Dubilier", "940C20W1K-F", 1m, 2_000m, "Polipropilen (MKP)", 37.5m)
        ];

        return liste.Select(x => new HamParca(
            "film-kondansatorler",
            x.Uretici,
            x.Mpn,
            $"CAP FILM {ParcaKodlama.AnlamliBasamak(x.Uf, 4)}µF {ParcaKodlama.AnlamliBasamak(x.Volt, 4)}V {x.Tip}",
            MontajTipi.Tht,
            [
                new("kapasitans", $"{ParcaKodlama.AnlamliBasamak(x.Uf, 4)} µF", x.Uf),
                new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Volt, 4)} V", x.Volt),
                new("tolerans", x.Tip.StartsWith("X2", StringComparison.Ordinal) ? "±%20" : "±%5"),
                new("kondansator_tipi", x.Tip),
                new("adim_mm", $"{ParcaKodlama.AnlamliBasamak(x.Adim, 3)} mm", x.Adim),
                new("montaj_sekli", "Radyal / Delikli")
            ]));
    }
}
