using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Endüktans, ferrit boncuk ve kristal parça numaraları.
///
///   Bourns SRN   : SRN | boy | TA- | değer | tolerans   -> SRN6045TA-100M  (10 µH ±%20)
///   TDK MLZ      : MLZ | boy | tolerans | değer | WT000  -> MLZ2012M100WT000
///   Coilcraft XAL: XAL | boy | - | değer(nH) | ME | B    -> XAL6060-103MEB  (10 µH)
///   Murata BLM   : BLM | boy | PG | empedans | SN1D      -> BLM18PG221SN1D  (220 Ω @100 MHz)
///   TDK MPZ      : MPZ | boy | S | empedans | A          -> MPZ1608S221A
///   Abracon      : seri | - | frekans | MHZ- | yük | -T  -> ABM8-16.000MHZ-B2-T
///
/// Doyma akımı (Isat) ve DCR gibi değerler parça numarasında KODLANMAZ; parçaya özgü
/// ölçüm sonuçlarıdır. Bu yüzden üretilen parçalarda bu alanlar boş bırakılır ve
/// yalnızca kodun taşıdığı bilgi (endüktans, tolerans, gövde, ekranlama) yazılır.
/// Uydurma bir "3.2 A" değeri yazmak, katalogu yine sallamaya çevirirdi.
/// </summary>
public static class BobinKristalKaynagi
{
    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in GucBobinleri()) yield return p;
        foreach (var p in SecilmisBobinler()) yield return p;
        foreach (var p in FerritBoncuklar()) yield return p;
        foreach (var p in Kristaller()) yield return p;
        foreach (var p in SecilmisOsilatorler()) yield return p;
    }

    // -----------------------------------------------------------------------
    // Güç bobinleri
    // -----------------------------------------------------------------------

    /// <summary>Endüktans değeri (µH) — güç bobinlerinin standart E6/E12 kademesi.</summary>
    private static readonly decimal[] BobinDegerleri =
        [1.0m, 1.5m, 2.2m, 3.3m, 4.7m, 6.8m, 10m, 15m, 22m, 33m, 47m, 68m, 100m, 150m, 220m, 330m, 470m, 680m, 1000m];

    private static IEnumerable<HamParca> GucBobinleri()
    {
        // Bourns SRN — ekranlı sarım tipi. Gövde kodu boyutu verir: 6045 = 6.0x6.0x4.5 mm.
        (string Boy, string Olcu, decimal MinUh, decimal MaxUh)[] srn =
        [
            ("2012", "2.0 x 2.0 x 1.2 mm", 1m, 47m),
            ("3010", "3.0 x 3.0 x 1.0 mm", 1m, 100m),
            ("4018", "4.0 x 4.0 x 1.8 mm", 1m, 220m),
            ("5040", "5.0 x 5.0 x 4.0 mm", 1m, 470m),
            ("6045", "6.0 x 6.0 x 4.5 mm", 1m, 1000m),
            ("8040", "8.0 x 8.0 x 4.0 mm", 1m, 1000m)
        ];

        foreach (var (boy, olcu, min, max) in srn)
        foreach (var uh in BobinDegerleri)
        {
            if (uh < min || uh > max) continue;

            yield return Bobin("Bourns", $"SRN{boy}TA-{UhKodu(uh)}M", uh, "±%20", olcu, "Ekranlı", MontajTipi.Smt);
        }

        // TDK MLZ — çok katmanlı çip bobin, küçük değer aralığı.
        (string Boy, string Olcu, decimal MinUh, decimal MaxUh)[] mlz =
        [
            ("1608", "1.6 x 0.8 x 0.8 mm", 1m, 22m),
            ("2012", "2.0 x 1.25 x 1.25 mm", 1m, 47m),
            ("3216", "3.2 x 1.6 x 1.6 mm", 1m, 100m)
        ];

        foreach (var (boy, olcu, min, max) in mlz)
        foreach (var uh in BobinDegerleri)
        {
            if (uh < min || uh > max) continue;

            yield return Bobin("TDK", $"MLZ{boy}M{UhKodu(uh)}WT000", uh, "±%20", olcu, "Ekranlı", MontajTipi.Smt);
        }

        // Coilcraft XAL — kompozit gövde, değer kodu nanohenry tabanlıdır.
        (string Boy, string Olcu, decimal MinUh, decimal MaxUh)[] xal =
        [
            ("4030", "4.0 x 4.0 x 3.1 mm", 1m, 22m),
            ("5030", "5.5 x 5.3 x 3.1 mm", 1m, 33m),
            ("6060", "6.4 x 6.6 x 6.1 mm", 1m, 100m),
            ("7030", "7.7 x 7.0 x 3.1 mm", 1m, 47m)
        ];

        foreach (var (boy, olcu, min, max) in xal)
        foreach (var uh in BobinDegerleri)
        {
            if (uh < min || uh > max) continue;

            yield return Bobin("Coilcraft", $"XAL{boy}-{NhKodu(uh)}MEB", uh, "±%20", olcu, "Ekranlı", MontajTipi.Smt);
        }
    }

    /// <summary>µH değerini 3 haneli koda çevirir: 10 µH -> "100", 4.7 µH -> "4R7", 470 µH -> "471".</summary>
    private static string UhKodu(decimal uh)
    {
        if (uh < 10m)
        {
            var m = ParcaKodlama.AnlamliBasamak(uh, 2);
            var n = m.IndexOf('.');
            return (n < 0 ? m + "R" : string.Concat(m.AsSpan(0, n), "R", m.AsSpan(n + 1))).PadRight(3, '0');
        }

        var us = 0;
        var deger = uh;
        while (deger >= 100m) { deger /= 10m; us++; }

        return $"{Math.Round(deger, MidpointRounding.AwayFromZero):00}{us}";
    }

    /// <summary>Coilcraft nanohenry tabanlı kod: 10 µH = 10000 nH -> "103".</summary>
    private static string NhKodu(decimal uh) => ParcaKodlama.KapasitansKodu(uh * 1_000m);

    private static HamParca Bobin(
        string uretici, string mpn, decimal uh, string tolerans, string olcu, string ekranlama, MontajTipi montaj) =>
        new(
            "guc-bobinleri",
            uretici,
            mpn,
            $"IND {ParcaKodlama.EnduktansYazisi(uh * 1_000m)} {tolerans} {ekranlama} {olcu}",
            montaj,
            [
                new("enduktans", ParcaKodlama.EnduktansYazisi(uh * 1_000m), uh),
                new("tolerans", tolerans),
                new("ekranlama", ekranlama),
                new("boyutlar", olcu),
                new("montaj_sekli", montaj == MontajTipi.Smt ? "Yüzey Montaj" : "Delikli Montaj")
            ]);

    /// <summary>
    /// Doyma akımı ve DCR'ı bilinen, yaygın kullanılan bobinler. Bu değerler parça
    /// numarasından türetilemediği için yalnızca burada, parça bazında verilir.
    /// </summary>
    private static IEnumerable<HamParca> SecilmisBobinler()
    {
        (string Uretici, string Mpn, decimal Uh, decimal Isat, decimal Dcr, string Olcu)[] liste =
        [
            ("Würth Elektronik", "744043100", 10m, 1.35m, 121m, "4.8 x 4.8 x 2.8 mm"),
            ("Würth Elektronik", "744043220", 22m, 0.90m, 290m, "4.8 x 4.8 x 2.8 mm"),
            ("Würth Elektronik", "744042100", 10m, 0.90m, 240m, "4.8 x 4.8 x 1.8 mm"),
            ("Würth Elektronik", "7447709220", 22m, 3.10m, 51m, "12.0 x 12.0 x 6.0 mm"),
            ("Würth Elektronik", "744773068", 6.8m, 4.50m, 21m, "10.0 x 10.0 x 3.8 mm"),
            ("Coilcraft", "XAL6060-103MEB", 10m, 9.20m, 14.5m, "6.4 x 6.6 x 6.1 mm"),
            ("Coilcraft", "XFL4020-102MEB", 1m, 11.0m, 8.6m, "4.0 x 4.0 x 2.1 mm"),
            ("Coilcraft", "XFL4020-222MEB", 2.2m, 8.70m, 14.7m, "4.0 x 4.0 x 2.1 mm"),
            ("TDK", "VLS6045EX-100M", 10m, 3.40m, 48m, "6.0 x 6.0 x 4.5 mm"),
            ("TDK", "VLS252012ET-4R7M", 4.7m, 0.95m, 235m, "2.5 x 2.0 x 1.2 mm"),
            ("Murata", "1276AS-H-4R7M=P2", 4.7m, 2.30m, 44m, "2.5 x 2.0 x 1.2 mm"),
            ("Bourns", "SRR1260-100M", 10m, 6.00m, 19m, "12.5 x 12.5 x 6.0 mm")
        ];

        return liste.Select(x => new HamParca(
            "guc-bobinleri",
            x.Uretici,
            x.Mpn,
            $"IND {ParcaKodlama.EnduktansYazisi(x.Uh * 1_000m)} ±%20 {ParcaKodlama.AnlamliBasamak(x.Isat, 3)}A EKRANLI",
            MontajTipi.Smt,
            [
                new("enduktans", ParcaKodlama.EnduktansYazisi(x.Uh * 1_000m), x.Uh),
                new("doyma_akimi", $"{ParcaKodlama.AnlamliBasamak(x.Isat, 3)} A", x.Isat),
                new("dc_direnc", $"{ParcaKodlama.AnlamliBasamak(x.Dcr, 4)} mΩ", x.Dcr),
                new("tolerans", "±%20"),
                new("ekranlama", "Ekranlı"),
                new("boyutlar", x.Olcu),
                new("montaj_sekli", "Yüzey Montaj")
            ]));
    }

    // -----------------------------------------------------------------------
    // Ferrit boncuk
    // -----------------------------------------------------------------------

    private static readonly decimal[] EmpedansDegerleri =
        [10m, 30m, 60m, 100m, 120m, 220m, 330m, 470m, 600m, 1000m, 1500m, 2200m];

    private static IEnumerable<HamParca> FerritBoncuklar()
    {
        // Murata BLM..PG serisi
        (string Boy, string Kilif)[] blm = [("15", "0402"), ("18", "0603"), ("21", "0805"), ("31", "1206")];

        foreach (var (boy, kilif) in blm)
        foreach (var ohm in EmpedansDegerleri)
            yield return Ferrit("Murata", $"BLM{boy}PG{ParcaKodlama.EiaUcHane(ohm)}SN1D", kilif, ohm);

        // TDK MPZ serisi — metrik boy kodu
        (string Boy, string Kilif)[] mpz = [("1005", "0402"), ("1608", "0603"), ("2012", "0805")];

        foreach (var (boy, kilif) in mpz)
        foreach (var ohm in EmpedansDegerleri)
            yield return Ferrit("TDK", $"MPZ{boy}S{ParcaKodlama.EiaUcHane(ohm)}A", kilif, ohm);
    }

    private static HamParca Ferrit(string uretici, string mpn, string kilif, decimal ohm) =>
        new(
            "ferrit-boncuklar",
            uretici,
            mpn,
            $"FERRIT BONCUK {ParcaKodlama.AnlamliBasamak(ohm, 4)}Ω @100MHz {kilif}",
            MontajTipi.Smt,
            [
                new("empedans_100mhz", $"{ParcaKodlama.AnlamliBasamak(ohm, 4)} Ω", ohm),
                new("boyut_kodu", kilif),
                new("calisma_sicakligi", "-55 ~ +125 °C")
            ]);

    // -----------------------------------------------------------------------
    // Kristal ve osilatör
    // -----------------------------------------------------------------------

    /// <summary>Gömülü sistemlerde fiilen kullanılan standart kristal frekansları.</summary>
    private static readonly (string Yazi, decimal Mhz)[] KristalFrekanslari =
    [
        ("4.000", 4m), ("6.000", 6m), ("8.000", 8m), ("10.000", 10m),
        ("11.0592", 11.0592m), ("12.000", 12m), ("12.288", 12.288m), ("14.7456", 14.7456m),
        ("16.000", 16m), ("18.432", 18.432m), ("20.000", 20m), ("22.1184", 22.1184m),
        ("24.000", 24m), ("25.000", 25m), ("26.000", 26m), ("27.000", 27m),
        ("32.000", 32m), ("40.000", 40m), ("48.000", 48m), ("50.000", 50m)
    ];

    private static IEnumerable<HamParca> Kristaller()
    {
        // Abracon SMD kristal serileri — kılıf ölçüsü seri adında kodludur.
        (string Seri, string Kilif, string YukKodu, decimal YukPf, MontajTipi Montaj)[] seriler =
        [
            ("ABM8",  "SMD 3.2 x 2.5 mm", "B2", 18m, MontajTipi.Smt),
            ("ABM3B", "SMD 5.0 x 3.2 mm", "B2", 18m, MontajTipi.Smt),
            ("ABM7",  "SMD 6.0 x 3.5 mm", "B2", 18m, MontajTipi.Smt),
            ("ABLS",  "HC-49/US Delikli", "B4", 20m, MontajTipi.Tht)
        ];

        foreach (var (seri, kilif, yukKodu, yukPf, montaj) in seriler)
        foreach (var (yazi, mhz) in KristalFrekanslari)
        {
            yield return new HamParca(
                "kristal-osilatorler",
                "Abracon",
                $"{seri}-{yazi}MHZ-{yukKodu}-T",
                $"KRISTAL {yazi} MHz ±20ppm {ParcaKodlama.AnlamliBasamak(yukPf, 3)}pF {kilif}",
                montaj,
                [
                    new("frekans", $"{yazi} MHz", mhz),
                    new("yuk_kapasitansi", $"{ParcaKodlama.AnlamliBasamak(yukPf, 3)} pF", yukPf),
                    new("kararlilik", "±20 ppm", 20m),
                    new("kilif", kilif),
                    new("calisma_sicakligi", "-20 ~ +70 °C")
                ]);
        }
    }

    private static IEnumerable<HamParca> SecilmisOsilatorler()
    {
        (string Uretici, string Mpn, string Aciklama, string Frekans, decimal Mhz, string Kilif, string Besleme, decimal Ppm)[] liste =
        [
            ("Abracon", "ABS07-32.768KHZ-T", "KRISTAL 32.768 kHz saat kristali", "32.768 kHz", 0.032768m, "SMD 3.2 x 1.5 mm", "—", 20m),
            ("Abracon", "ABS07-32.768KHZ-7-T", "KRISTAL 32.768 kHz 7pF saat kristali", "32.768 kHz", 0.032768m, "SMD 3.2 x 1.5 mm", "—", 20m),
            ("Abracon", "ABS25-32.768KHZ-6-T", "KRISTAL 32.768 kHz silindirik", "32.768 kHz", 0.032768m, "Silindirik 2 x 6 mm", "—", 20m),
            ("Epson", "MC-306 32.768K-A0:ROHS", "KRISTAL 32.768 kHz silindirik SMD", "32.768 kHz", 0.032768m, "SMD 8.0 x 3.8 mm", "—", 20m),
            ("Epson", "FC-135 32.768KA-AC3", "KRISTAL 32.768 kHz minyatür SMD", "32.768 kHz", 0.032768m, "SMD 3.2 x 1.5 mm", "—", 20m),
            ("Epson", "SG-8002DC 25.0000M-PCBL3", "OSILATOR 25 MHz programlanabilir CMOS", "25.000 MHz", 25m, "SMD 7.0 x 5.0 mm", "3.3 V", 50m),
            ("NDK", "NX3225SA-16.000M-STD-CSR-3", "KRISTAL 16 MHz SMD", "16.000 MHz", 16m, "SMD 3.2 x 2.5 mm", "—", 10m),
            ("NDK", "NX2016SA-32.768KHZ-EXS00A-MU00525", "KRISTAL 32.768 kHz minyatür SMD", "32.768 kHz", 0.032768m, "SMD 2.0 x 1.6 mm", "—", 20m),
            ("IQD", "LFSPXO009680BULK", "OSILATOR 25 MHz HCMOS SMD", "25.000 MHz", 25m, "SMD 7.0 x 5.0 mm", "3.3 V", 50m),
            ("IQD", "LFXTAL003240BULK", "KRISTAL 16 MHz HC-49/US", "16.000 MHz", 16m, "HC-49/US Delikli", "—", 30m),
            ("CTS", "403C11A16M00000", "KRISTAL 16 MHz SMD 5.0 x 3.2 mm", "16.000 MHz", 16m, "SMD 5.0 x 3.2 mm", "—", 30m),
            ("CTS", "403C11A08M00000", "KRISTAL 8 MHz SMD 5.0 x 3.2 mm", "8.000 MHz", 8m, "SMD 5.0 x 3.2 mm", "—", 30m),
            ("Abracon", "ASEM1-25.000MHZ-LC-T", "OSILATOR 25 MHz MEMS CMOS", "25.000 MHz", 25m, "SMD 2.5 x 2.0 mm", "3.3 V", 50m),
            ("Abracon", "ASV-27.000MHZ-EJ-T", "OSILATOR 27 MHz HCMOS", "27.000 MHz", 27m, "SMD 7.0 x 5.0 mm", "3.3 V", 50m),
            ("Silicon Labs", "SI5351A-B-GT", "SAAT URETECI I2C programlanabilir 3 çıkışlı", "200 MHz", 200m, "MSOP-10", "3.3 V", 50m)
        ];

        return liste.Select(x =>
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("frekans", x.Frekans, x.Mhz),
                new("kararlilik", $"±{ParcaKodlama.AnlamliBasamak(x.Ppm, 3)} ppm", x.Ppm),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", "-40 ~ +85 °C")
            };

            if (x.Besleme != "—")
                ozellikler.Add(new ParcaOzelligi("besleme_voltaji", x.Besleme));

            return new HamParca("kristal-osilatorler", x.Uretici, x.Mpn, x.Aciklama,
                MontajTipi.Smt, ozellikler);
        });
    }
}
