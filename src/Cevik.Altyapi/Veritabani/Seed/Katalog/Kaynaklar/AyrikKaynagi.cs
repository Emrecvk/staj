using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Ayrık yarı iletkenler — diyot, zener, MOSFET, bipolar transistör, tristör, IGBT.
///
/// Zener serileri kombinatoryal üretilir: BZX55C / BZX84-C / 1N47xxA aileleri sabit bir
/// standart voltaj listesi üzerinden numaralanır ve bu listenin tamamı üreticinin
/// katalogunda vardır. Geri kalan aileler küratörlüdür.
/// </summary>
public static class AyrikKaynagi
{
    /// <summary>IEC standart zener gerilimleri — BZX ve 1N47xx serilerinin ortak kademesi.</summary>
    private static readonly decimal[] ZenerGerilimleri =
    [
        2.4m, 2.7m, 3.0m, 3.3m, 3.6m, 3.9m, 4.3m, 4.7m, 5.1m, 5.6m, 6.2m, 6.8m,
        7.5m, 8.2m, 9.1m, 10m, 11m, 12m, 13m, 15m, 16m, 18m, 20m, 22m, 24m,
        27m, 30m, 33m, 36m, 39m, 43m, 47m, 51m, 56m
    ];

    /// <summary>1N4728A ... 1N4764A — 1 W serisinin gerilim karşılıkları (sırayla).</summary>
    private static readonly decimal[] OneN47xx =
    [
        3.3m, 3.6m, 3.9m, 4.3m, 4.7m, 5.1m, 5.6m, 6.2m, 6.8m, 7.5m, 8.2m, 9.1m,
        10m, 11m, 12m, 13m, 15m, 16m, 18m, 20m, 22m, 24m, 27m, 30m, 33m, 36m,
        39m, 43m, 47m, 51m, 56m, 62m, 68m, 75m, 82m, 91m, 100m
    ];

    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in Zenerler()) yield return p;
        foreach (var p in Diyotlar()) yield return p;
        foreach (var p in Mosfetler()) yield return p;
        foreach (var p in BipolarTransistorler()) yield return p;
        foreach (var p in TristorTriyaklar()) yield return p;
        foreach (var p in Igbtler()) yield return p;
    }

    // -----------------------------------------------------------------------
    // Zener diyotlar
    // -----------------------------------------------------------------------

    /// <summary>4.7 V -> "4V7", 12 V -> "12". BZX serisinin gerilim kodlaması.</summary>
    private static string ZenerKodu(decimal volt)
    {
        if (volt >= 10m) return ParcaKodlama.AnlamliBasamak(volt, 3);

        var metin = ParcaKodlama.AnlamliBasamak(volt, 2);
        var nokta = metin.IndexOf('.');

        return nokta < 0
            ? metin + "V0"
            : string.Concat(metin.AsSpan(0, nokta), "V", metin.AsSpan(nokta + 1));
    }

    private static IEnumerable<HamParca> Zenerler()
    {
        foreach (var volt in ZenerGerilimleri)
        {
            var kod = ZenerKodu(volt);

            // Vishay BZX55C — 500 mW, DO-35 eksenel
            yield return Zener("Vishay", $"BZX55C{kod}", volt, "500 mW", "±%5", "DO-35", MontajTipi.Tht);

            // Nexperia BZX84-C — 250 mW, SOT-23
            yield return Zener("Nexperia", $"BZX84-C{kod},215", volt, "250 mW", "±%5", "SOT-23", MontajTipi.Smt);

            // onsemi BZX84C — aynı gövde, farklı sipariş soneki
            yield return Zener("onsemi", $"BZX84C{kod}LT1G", volt, "250 mW", "±%5", "SOT-23", MontajTipi.Smt);
        }

        // 1N4728A ... 1N4764A — 1 W, DO-41
        for (var i = 0; i < OneN47xx.Length; i++)
        {
            var mpn = $"1N{4728 + i}A";
            yield return Zener("Vishay", mpn, OneN47xx[i], "1 W", "±%5", "DO-41", MontajTipi.Tht);
        }
    }

    private static HamParca Zener(
        string uretici, string mpn, decimal volt, string guc, string tolerans, string kilif, MontajTipi montaj) =>
        new(
            "zener-diyotlar", uretici, mpn,
            $"DIYOT ZENER {ParcaKodlama.AnlamliBasamak(volt, 3)}V {guc} {tolerans} {kilif}",
            montaj,
            [
                new("zener_voltaji", $"{ParcaKodlama.AnlamliBasamak(volt, 3)} V", volt),
                new("guc_derecesi", guc),
                new("tolerans", tolerans),
                new("kilif", kilif),
                new("calisma_sicakligi", "-65 ~ +175 °C")
            ]);

    // -----------------------------------------------------------------------
    // Diyotlar
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Diyotlar()
    {
        // (üretici, MPN, tip, VR volt, IF amper, VF volt, trr ns (0 = belirtilmez), kılıf, montaj)
        (string Uretici, string Mpn, string Tip, decimal Vr, decimal If, decimal Vf, decimal Trr, string Kilif, MontajTipi Montaj)[] liste =
        [
            // Doğrultucu — 1N400x ailesi
            ("Vishay", "1N4001-E3/54", "Doğrultucu", 50m, 1m, 1.1m, 0m, "DO-41", MontajTipi.Tht),
            ("Vishay", "1N4002-E3/54", "Doğrultucu", 100m, 1m, 1.1m, 0m, "DO-41", MontajTipi.Tht),
            ("Vishay", "1N4004-E3/54", "Doğrultucu", 400m, 1m, 1.1m, 0m, "DO-41", MontajTipi.Tht),
            ("Vishay", "1N4007-E3/54", "Doğrultucu", 1000m, 1m, 1.1m, 0m, "DO-41", MontajTipi.Tht),
            ("onsemi", "1N4001RLG", "Doğrultucu", 50m, 1m, 1.1m, 0m, "DO-41", MontajTipi.Tht),
            ("onsemi", "1N4004RLG", "Doğrultucu", 400m, 1m, 1.1m, 0m, "DO-41", MontajTipi.Tht),
            ("onsemi", "1N4007RLG", "Doğrultucu", 1000m, 1m, 1.1m, 0m, "DO-41", MontajTipi.Tht),
            ("Diodes Incorporated", "1N4007-T", "Doğrultucu", 1000m, 1m, 1.1m, 0m, "DO-41", MontajTipi.Tht),
            ("Diodes Incorporated", "1N5408-T", "Doğrultucu", 1000m, 3m, 1.2m, 0m, "DO-201AD", MontajTipi.Tht),
            ("Vishay", "1N5399-E3/54", "Doğrultucu", 1000m, 1.5m, 1.1m, 0m, "DO-15", MontajTipi.Tht),

            // Doğrultucu — SMD
            ("Diodes Incorporated", "S1M-13-F", "Doğrultucu", 1000m, 1m, 1.1m, 0m, "SMA (DO-214AC)", MontajTipi.Smt),
            ("Diodes Incorporated", "S1J-13-F", "Doğrultucu", 600m, 1m, 1.1m, 0m, "SMA (DO-214AC)", MontajTipi.Smt),
            ("Diodes Incorporated", "S3M-13-F", "Doğrultucu", 1000m, 3m, 1.15m, 0m, "SMC (DO-214AB)", MontajTipi.Smt),
            ("Vishay", "US1M-E3/61T", "Hızlı Doğrultucu", 1000m, 1m, 1.7m, 75m, "SMA (DO-214AC)", MontajTipi.Smt),

            // Hızlı toparlanmalı
            ("Vishay", "UF4007-E3/54", "Hızlı Doğrultucu", 1000m, 1m, 1.7m, 75m, "DO-41", MontajTipi.Tht),
            ("Vishay", "FR107-E3/54", "Hızlı Doğrultucu", 700m, 1m, 1.3m, 500m, "DO-41", MontajTipi.Tht),
            ("onsemi", "MUR460RLG", "Ultra Hızlı", 600m, 4m, 1.05m, 75m, "DO-201AD", MontajTipi.Tht),
            ("STMicroelectronics", "STTH1L06A", "Ultra Hızlı", 600m, 1m, 1.05m, 22m, "SMA (DO-214AC)", MontajTipi.Smt),

            // Schottky — THT
            ("Vishay", "1N5817-E3/54", "Schottky", 20m, 1m, 0.45m, 0m, "DO-41", MontajTipi.Tht),
            ("Vishay", "1N5819-E3/54", "Schottky", 40m, 1m, 0.6m, 0m, "DO-41", MontajTipi.Tht),
            ("Vishay", "1N5822-E3/54", "Schottky", 40m, 3m, 0.525m, 0m, "DO-201AD", MontajTipi.Tht),
            ("onsemi", "1N5818RLG", "Schottky", 30m, 1m, 0.55m, 0m, "DO-41", MontajTipi.Tht),
            ("onsemi", "MBR1045G", "Schottky", 45m, 10m, 0.72m, 0m, "TO-220AC", MontajTipi.Tht),
            ("onsemi", "MBR20100CTG", "Schottky", 100m, 20m, 0.85m, 0m, "TO-220-3", MontajTipi.Tht),

            // Schottky — SMD
            ("Vishay", "SS14-E3/61T", "Schottky", 40m, 1m, 0.5m, 0m, "SMA (DO-214AC)", MontajTipi.Smt),
            ("Vishay", "SS16-E3/61T", "Schottky", 60m, 1m, 0.6m, 0m, "SMA (DO-214AC)", MontajTipi.Smt),
            ("Vishay", "SS110-E3/61T", "Schottky", 100m, 1m, 0.75m, 0m, "SMA (DO-214AC)", MontajTipi.Smt),
            ("Vishay", "SS34-E3/57T", "Schottky", 40m, 3m, 0.5m, 0m, "SMC (DO-214AB)", MontajTipi.Smt),
            ("onsemi", "MBR0520LT1G", "Schottky", 20m, 0.5m, 0.385m, 0m, "SOD-123", MontajTipi.Smt),
            ("onsemi", "MBR0540T1G", "Schottky", 40m, 0.5m, 0.53m, 0m, "SOD-123", MontajTipi.Smt),
            ("onsemi", "MBRS340T3G", "Schottky", 40m, 3m, 0.5m, 0m, "SMC (DO-214AB)", MontajTipi.Smt),
            ("Nexperia", "PMEG3010EJ,115", "Schottky", 30m, 1m, 0.42m, 0m, "SOD-323F", MontajTipi.Smt),
            ("Nexperia", "PMEG6020ER,115", "Schottky", 60m, 2m, 0.53m, 0m, "SOD-123W", MontajTipi.Smt),
            ("Diodes Incorporated", "B340A-13-F", "Schottky", 40m, 3m, 0.5m, 0m, "SMA (DO-214AC)", MontajTipi.Smt),
            ("Diodes Incorporated", "SDM10K45-7-F", "Schottky", 45m, 1m, 0.45m, 0m, "SOD-323", MontajTipi.Smt),

            // Sinyal / anahtarlama
            ("Vishay", "1N4148-TAP", "Anahtarlama", 100m, 0.3m, 1m, 4m, "DO-35", MontajTipi.Tht),
            ("Diodes Incorporated", "1N4148W-7-F", "Anahtarlama", 100m, 0.3m, 1m, 4m, "SOD-123", MontajTipi.Smt),
            ("Diodes Incorporated", "1N4148WS-7-F", "Anahtarlama", 75m, 0.15m, 1m, 4m, "SOD-323", MontajTipi.Smt),
            ("Vishay", "LL4148-GS08", "Anahtarlama", 100m, 0.15m, 1m, 4m, "MiniMELF", MontajTipi.Smt),
            ("Nexperia", "BAV99,215", "İkili Anahtarlama", 100m, 0.215m, 1.25m, 4m, "SOT-23", MontajTipi.Smt),
            ("Nexperia", "BAV70,215", "İkili Anahtarlama (Ortak Katot)", 100m, 0.215m, 1.25m, 4m, "SOT-23", MontajTipi.Smt),
            ("Nexperia", "BAS16,215", "Anahtarlama", 100m, 0.215m, 1m, 4m, "SOT-23", MontajTipi.Smt),
            ("onsemi", "BAT54LT1G", "Schottky Sinyal", 30m, 0.2m, 0.4m, 0m, "SOD-523", MontajTipi.Smt),
            ("onsemi", "BAT54SLT1G", "İkili Schottky (Seri)", 30m, 0.2m, 0.4m, 0m, "SOT-23", MontajTipi.Smt),
            ("onsemi", "BAT54CLT1G", "İkili Schottky (Ortak Katot)", 30m, 0.2m, 0.4m, 0m, "SOT-23", MontajTipi.Smt),
            ("onsemi", "BAT54ALT1G", "İkili Schottky (Ortak Anot)", 30m, 0.2m, 0.4m, 0m, "SOT-23", MontajTipi.Smt),

            // Köprü doğrultucu
            ("Diodes Incorporated", "DB107-G", "Köprü Doğrultucu", 1000m, 1m, 1.1m, 0m, "DBS (DIP-4)", MontajTipi.Tht),
            ("Diodes Incorporated", "KBP206G", "Köprü Doğrultucu", 600m, 2m, 1.1m, 0m, "KBP", MontajTipi.Tht),
            ("Vishay", "KBU8J-E4/51", "Köprü Doğrultucu", 600m, 8m, 1.1m, 0m, "KBU", MontajTipi.Tht),
            ("Vishay", "GBU8J-E3/45", "Köprü Doğrultucu", 600m, 8m, 1.1m, 0m, "GBU", MontajTipi.Tht),
            ("onsemi", "MB10S-TP", "Köprü Doğrultucu", 1000m, 0.5m, 1.1m, 0m, "MBS (SOIC-4)", MontajTipi.Smt),

            // Yüksek verim / SiC
            ("STMicroelectronics", "STPSC6H065D", "SiC Schottky", 650m, 6m, 1.35m, 0m, "TO-220AC", MontajTipi.Tht),
            ("Infineon Technologies", "IDH08G65C6XKSA1", "SiC Schottky", 650m, 8m, 1.5m, 0m, "TO-220-2", MontajTipi.Tht),
            ("ROHM Semiconductor", "SCS210AGC", "SiC Schottky", 650m, 10m, 1.5m, 0m, "TO-220AC", MontajTipi.Tht)
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("diyot_tipi", x.Tip),
                new("ters_voltaj", $"{ParcaKodlama.AnlamliBasamak(x.Vr, 5)} V", x.Vr),
                new("ileri_akim", $"{ParcaKodlama.AnlamliBasamak(x.If, 4)} A", x.If),
                new("ileri_voltaj", $"{ParcaKodlama.AnlamliBasamak(x.Vf, 4)} V", x.Vf),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", "-65 ~ +150 °C")
            };

            if (x.Trr > 0m)
                ozellikler.Insert(4, new ParcaOzelligi("toparlanma_suresi", $"{ParcaKodlama.AnlamliBasamak(x.Trr, 4)} ns", x.Trr));

            yield return new HamParca(
                "diyotlar", x.Uretici, x.Mpn,
                $"DIYOT {x.Tip} {ParcaKodlama.AnlamliBasamak(x.Vr, 5)}V {ParcaKodlama.AnlamliBasamak(x.If, 4)}A {x.Kilif}",
                x.Montaj, ozellikler);
        }
    }

    // -----------------------------------------------------------------------
    // MOSFET
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Mosfetler()
    {
        // (üretici, MPN, kanal, VDS, ID, RDS(on) mΩ, VGS(th), kılıf, montaj)
        (string Uretici, string Mpn, string Kanal, decimal Vds, decimal Id, decimal Rds, decimal Vgs, string Kilif, MontajTipi Montaj)[] liste =
        [
            // Infineon / IR — THT güç
            ("Infineon Technologies", "IRF540NPBF", "N Kanal", 100m, 33m, 44m, 4m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRFZ44NPBF", "N Kanal", 55m, 49m, 17.5m, 4m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRF3205PBF", "N Kanal", 55m, 110m, 8m, 4m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRLZ44NPBF", "N Kanal (Lojik Seviye)", 55m, 47m, 22m, 2m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRL540NPBF", "N Kanal (Lojik Seviye)", 100m, 36m, 44m, 2m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRLB8721PBF", "N Kanal (Lojik Seviye)", 30m, 62m, 8.7m, 2.35m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRF640NPBF", "N Kanal", 200m, 18m, 150m, 4m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRF830PBF", "N Kanal", 500m, 4.5m, 1_500m, 4m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRF9540NPBF", "P Kanal", 100m, 23m, 117m, 4m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRF4905PBF", "P Kanal", 55m, 74m, 20m, 4m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRFP250NPBF", "N Kanal", 200m, 30m, 75m, 4m, "TO-247AC", MontajTipi.Tht),
            ("Infineon Technologies", "IRFP460PBF", "N Kanal", 500m, 20m, 270m, 4m, "TO-247AC", MontajTipi.Tht),
            ("Infineon Technologies", "IRFB4110PBF", "N Kanal", 100m, 180m, 4.5m, 4m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRLML6344TRPBF", "N Kanal (Lojik Seviye)", 30m, 5m, 29m, 1.1m, "SOT-23", MontajTipi.Smt),
            ("Infineon Technologies", "IRLML2502TRPBF", "N Kanal (Lojik Seviye)", 20m, 4.2m, 45m, 1.2m, "SOT-23", MontajTipi.Smt),
            ("Infineon Technologies", "IRLML6402TRPBF", "P Kanal (Lojik Seviye)", 20m, 3.7m, 65m, 1.2m, "SOT-23", MontajTipi.Smt),
            ("Infineon Technologies", "IPP60R190P6XKSA1", "N Kanal (Süper Kavşak)", 600m, 20.2m, 190m, 3m, "TO-220", MontajTipi.Tht),
            ("Infineon Technologies", "BSS138N H6327", "N Kanal (Lojik Seviye)", 60m, 0.36m, 3_500m, 1.5m, "SOT-23", MontajTipi.Smt),

            // onsemi / Fairchild
            ("onsemi", "FQP30N06L", "N Kanal (Lojik Seviye)", 60m, 32m, 35m, 2m, "TO-220AB", MontajTipi.Tht),
            ("onsemi", "FQP50N06", "N Kanal", 60m, 52m, 22m, 4m, "TO-220AB", MontajTipi.Tht),
            ("onsemi", "FQP27P06", "P Kanal", 60m, 27m, 70m, 4m, "TO-220AB", MontajTipi.Tht),
            ("onsemi", "2N7000G", "N Kanal", 60m, 0.2m, 5_000m, 2.1m, "TO-92", MontajTipi.Tht),
            ("onsemi", "BS170G", "N Kanal", 60m, 0.5m, 5_000m, 2.1m, "TO-92", MontajTipi.Tht),
            ("onsemi", "BSS138LT1G", "N Kanal (Lojik Seviye)", 50m, 0.22m, 3_500m, 1.5m, "SOT-23", MontajTipi.Smt),
            ("onsemi", "BSS84LT1G", "P Kanal", 50m, 0.13m, 10_000m, 1.5m, "SOT-23", MontajTipi.Smt),
            ("onsemi", "NTR4501NT1G", "N Kanal (Lojik Seviye)", 30m, 3.4m, 45m, 1m, "SOT-23", MontajTipi.Smt),
            ("onsemi", "NTD5867NL-1G", "N Kanal (Lojik Seviye)", 60m, 41m, 12m, 2m, "DPAK", MontajTipi.Smt),
            ("onsemi", "FDD8896", "N Kanal", 30m, 100m, 4.7m, 2m, "DPAK", MontajTipi.Smt),

            // Alpha & Omega
            ("Alpha & Omega Semiconductor", "AO3400A", "N Kanal (Lojik Seviye)", 30m, 5.7m, 28m, 1.4m, "SOT-23", MontajTipi.Smt),
            ("Alpha & Omega Semiconductor", "AO3401A", "P Kanal (Lojik Seviye)", 30m, 4.3m, 60m, 1.1m, "SOT-23", MontajTipi.Smt),
            ("Alpha & Omega Semiconductor", "AO3402", "N Kanal (Lojik Seviye)", 30m, 5.4m, 33m, 1.4m, "SOT-23", MontajTipi.Smt),
            ("Alpha & Omega Semiconductor", "AON6758", "N Kanal", 30m, 85m, 3.5m, 1.6m, "DFN 5x6", MontajTipi.Smt),
            ("Alpha & Omega Semiconductor", "AOD4184A", "N Kanal (Lojik Seviye)", 40m, 50m, 8.5m, 2m, "DPAK", MontajTipi.Smt),

            // Vishay
            ("Vishay", "SI2302CDS-T1-GE3", "N Kanal (Lojik Seviye)", 20m, 2.7m, 55m, 0.9m, "SOT-23", MontajTipi.Smt),
            ("Vishay", "SI2301CDS-T1-GE3", "P Kanal (Lojik Seviye)", 20m, 2.7m, 75m, 0.9m, "SOT-23", MontajTipi.Smt),
            ("Vishay", "SI2308BDS-T1-GE3", "N Kanal (Lojik Seviye)", 60m, 2.7m, 100m, 1.5m, "SOT-23", MontajTipi.Smt),
            ("Vishay", "SIR184DP-T1-RE3", "N Kanal", 40m, 100m, 2.9m, 2m, "PowerPAK SO-8", MontajTipi.Smt),
            ("Vishay", "IRF7343PBF", "İkili N/P Kanal", 55m, 4.9m, 90m, 3m, "SOIC-8", MontajTipi.Smt),
            ("Vishay", "SUP75N08-11L-E3", "N Kanal (Lojik Seviye)", 75m, 75m, 11m, 2m, "TO-220AB", MontajTipi.Tht),

            // Diodes / Nexperia / ST / Toshiba
            ("Diodes Incorporated", "DMG2305UX-7", "P Kanal (Lojik Seviye)", 20m, 3.6m, 46m, 1m, "SOT-23", MontajTipi.Smt),
            ("Diodes Incorporated", "DMN2075U-7", "N Kanal (Lojik Seviye)", 20m, 3.5m, 47m, 0.8m, "SOT-23", MontajTipi.Smt),
            ("Diodes Incorporated", "DMN3042L-7", "N Kanal (Lojik Seviye)", 30m, 5.4m, 34m, 1.2m, "SOT-23", MontajTipi.Smt),
            ("Nexperia", "PMV45EN,215", "N Kanal (Lojik Seviye)", 30m, 5.5m, 27m, 1.2m, "SOT-23", MontajTipi.Smt),
            ("Nexperia", "BUK9K6R2-40E,115", "N Kanal", 40m, 30m, 6.2m, 2m, "LFPAK33", MontajTipi.Smt),
            ("STMicroelectronics", "STP55NF06L", "N Kanal (Lojik Seviye)", 60m, 50m, 18m, 2.5m, "TO-220", MontajTipi.Tht),
            ("STMicroelectronics", "STP16NF06L", "N Kanal (Lojik Seviye)", 60m, 16m, 80m, 2.5m, "TO-220", MontajTipi.Tht),
            ("STMicroelectronics", "STP80NF70", "N Kanal", 68m, 80m, 8m, 4m, "TO-220", MontajTipi.Tht),
            ("STMicroelectronics", "STD5NK50ZT4", "N Kanal", 500m, 4.4m, 1_500m, 4m, "DPAK", MontajTipi.Smt),
            ("Toshiba", "TK100E06N1,S1X", "N Kanal", 60m, 100m, 3.9m, 3m, "TO-220SIS", MontajTipi.Tht),
            ("Toshiba", "SSM3K341R,LF", "N Kanal (Lojik Seviye)", 30m, 4m, 33m, 1.2m, "SOT-23F", MontajTipi.Smt),
            ("Texas Instruments", "CSD18540Q5B", "N Kanal", 60m, 100m, 1.8m, 2.2m, "VSON-8", MontajTipi.Smt),
            ("Texas Instruments", "CSD17573Q5B", "N Kanal", 30m, 100m, 1.4m, 1.5m, "VSON-8", MontajTipi.Smt)
        ];

        return liste.Select(x => new HamParca(
            "mosfetler", x.Uretici, x.Mpn,
            $"MOSFET {x.Kanal} {ParcaKodlama.AnlamliBasamak(x.Vds, 4)}V {ParcaKodlama.AnlamliBasamak(x.Id, 4)}A {ParcaKodlama.AnlamliBasamak(x.Rds, 4)}mΩ {x.Kilif}",
            x.Montaj,
            [
                new("kanal_tipi", x.Kanal),
                new("vds_max", $"{ParcaKodlama.AnlamliBasamak(x.Vds, 4)} V", x.Vds),
                new("id_max", $"{ParcaKodlama.AnlamliBasamak(x.Id, 4)} A", x.Id),
                new("rds_on", $"{ParcaKodlama.AnlamliBasamak(x.Rds, 5)} mΩ", x.Rds),
                new("vgs_esik", $"{ParcaKodlama.AnlamliBasamak(x.Vgs, 3)} V", x.Vgs),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", "-55 ~ +175 °C")
            ]));
    }

    // -----------------------------------------------------------------------
    // Bipolar transistörler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> BipolarTransistorler()
    {
        (string Uretici, string Mpn, string Tip, decimal Vce, decimal Ic, decimal Hfe, string Guc, string Kilif, MontajTipi Montaj)[] liste =
        [
            ("onsemi", "2N3904BU", "NPN", 40m, 0.2m, 100m, "625 mW", "TO-92", MontajTipi.Tht),
            ("onsemi", "2N3906BU", "PNP", 40m, 0.2m, 100m, "625 mW", "TO-92", MontajTipi.Tht),
            ("onsemi", "2N2222ATFR", "NPN", 40m, 0.8m, 100m, "500 mW", "TO-18", MontajTipi.Tht),
            ("onsemi", "PN2222ABU", "NPN", 40m, 0.6m, 100m, "625 mW", "TO-92", MontajTipi.Tht),
            ("onsemi", "2N2907ARLRAG", "PNP", 60m, 0.6m, 100m, "400 mW", "TO-18", MontajTipi.Tht),
            ("onsemi", "MMBT3904LT1G", "NPN", 40m, 0.2m, 100m, "225 mW", "SOT-23", MontajTipi.Smt),
            ("onsemi", "MMBT3906LT1G", "PNP", 40m, 0.2m, 100m, "225 mW", "SOT-23", MontajTipi.Smt),
            ("onsemi", "MMBT2222ALT1G", "NPN", 40m, 0.6m, 100m, "225 mW", "SOT-23", MontajTipi.Smt),
            ("onsemi", "MMBT5551LT1G", "NPN", 160m, 0.6m, 80m, "225 mW", "SOT-23", MontajTipi.Smt),
            ("onsemi", "MMBT5401LT1G", "PNP", 150m, 0.6m, 60m, "225 mW", "SOT-23", MontajTipi.Smt),
            ("onsemi", "MMBTA42LT1G", "NPN (Yüksek Voltaj)", 300m, 0.5m, 40m, "225 mW", "SOT-23", MontajTipi.Smt),
            ("onsemi", "MMBTA92LT1G", "PNP (Yüksek Voltaj)", 300m, 0.5m, 40m, "225 mW", "SOT-23", MontajTipi.Smt),
            ("onsemi", "TIP31CG", "NPN (Güç)", 100m, 3m, 25m, "40 W", "TO-220", MontajTipi.Tht),
            ("onsemi", "TIP32CG", "PNP (Güç)", 100m, 3m, 25m, "40 W", "TO-220", MontajTipi.Tht),
            ("onsemi", "TIP41CG", "NPN (Güç)", 100m, 6m, 25m, "65 W", "TO-220", MontajTipi.Tht),
            ("onsemi", "TIP42CG", "PNP (Güç)", 100m, 6m, 25m, "65 W", "TO-220", MontajTipi.Tht),
            ("onsemi", "TIP122G", "NPN (Darlington)", 100m, 5m, 1000m, "65 W", "TO-220", MontajTipi.Tht),
            ("onsemi", "TIP127G", "PNP (Darlington)", 100m, 5m, 1000m, "65 W", "TO-220", MontajTipi.Tht),
            ("onsemi", "MJE13003G", "NPN (Anahtarlama)", 400m, 1.5m, 25m, "40 W", "TO-220", MontajTipi.Tht),
            ("onsemi", "2N3055G", "NPN (Güç)", 60m, 15m, 20m, "115 W", "TO-3", MontajTipi.Tht),
            ("onsemi", "TIP2955G", "PNP (Güç)", 60m, 15m, 20m, "90 W", "TO-247", MontajTipi.Tht),
            ("onsemi", "TIP3055G", "NPN (Güç)", 60m, 15m, 20m, "90 W", "TO-247", MontajTipi.Tht),

            ("Nexperia", "BC547B,112", "NPN", 45m, 0.1m, 290m, "500 mW", "TO-92", MontajTipi.Tht),
            ("Nexperia", "BC548B,112", "NPN", 30m, 0.1m, 290m, "500 mW", "TO-92", MontajTipi.Tht),
            ("Nexperia", "BC549C,112", "NPN (Düşük Gürültü)", 30m, 0.1m, 520m, "500 mW", "TO-92", MontajTipi.Tht),
            ("Nexperia", "BC557B,112", "PNP", 45m, 0.1m, 290m, "500 mW", "TO-92", MontajTipi.Tht),
            ("Nexperia", "BC558B,112", "PNP", 30m, 0.1m, 290m, "500 mW", "TO-92", MontajTipi.Tht),
            ("Nexperia", "BC847B,215", "NPN", 45m, 0.1m, 290m, "250 mW", "SOT-23", MontajTipi.Smt),
            ("Nexperia", "BC857B,215", "PNP", 45m, 0.1m, 290m, "250 mW", "SOT-23", MontajTipi.Smt),
            ("Nexperia", "BC817-40,215", "NPN", 45m, 0.5m, 400m, "250 mW", "SOT-23", MontajTipi.Smt),
            ("Nexperia", "BC807-40,215", "PNP", 45m, 0.5m, 400m, "250 mW", "SOT-23", MontajTipi.Smt),
            ("Nexperia", "PMBT2222A,215", "NPN", 40m, 0.6m, 100m, "250 mW", "SOT-23", MontajTipi.Smt),
            ("Nexperia", "PZT2222A,115", "NPN", 40m, 1m, 100m, "1 W", "SOT-223", MontajTipi.Smt),
            ("Nexperia", "BCP56,115", "NPN (Güç)", 80m, 1m, 63m, "1.5 W", "SOT-223", MontajTipi.Smt),
            ("Nexperia", "BCP53-16,115", "PNP (Güç)", 80m, 1m, 100m, "1.5 W", "SOT-223", MontajTipi.Smt),

            ("STMicroelectronics", "BD139-16", "NPN (Güç)", 80m, 1.5m, 100m, "12.5 W", "TO-126", MontajTipi.Tht),
            ("STMicroelectronics", "BD140-16", "PNP (Güç)", 80m, 1.5m, 100m, "12.5 W", "TO-126", MontajTipi.Tht),
            ("STMicroelectronics", "BD135-16", "NPN (Güç)", 45m, 1.5m, 100m, "12.5 W", "TO-126", MontajTipi.Tht),
            ("STMicroelectronics", "BD136-16", "PNP (Güç)", 45m, 1.5m, 100m, "12.5 W", "TO-126", MontajTipi.Tht),
            ("STMicroelectronics", "BDX53C", "NPN (Darlington)", 100m, 8m, 750m, "60 W", "TO-220", MontajTipi.Tht),

            ("ROHM Semiconductor", "DTC114EKAT146", "NPN (Dirençli)", 50m, 0.1m, 100m, "300 mW", "SOT-346", MontajTipi.Smt),
            ("ROHM Semiconductor", "DTA114EKAT146", "PNP (Dirençli)", 50m, 0.1m, 100m, "300 mW", "SOT-346", MontajTipi.Smt),
            ("ROHM Semiconductor", "2SC2412KT146Q", "NPN", 50m, 0.15m, 270m, "300 mW", "SOT-346", MontajTipi.Smt),
            ("Toshiba", "2SC945", "NPN", 50m, 0.15m, 200m, "250 mW", "TO-92", MontajTipi.Tht),
            ("Diodes Incorporated", "MMBT3904-7-F", "NPN", 40m, 0.2m, 100m, "225 mW", "SOT-23", MontajTipi.Smt),
            ("Diodes Incorporated", "ZXTN19100CFFTA", "NPN (Düşük VCEsat)", 100m, 3m, 200m, "1.4 W", "SOT-1220", MontajTipi.Smt)
        ];

        return liste.Select(x => new HamParca(
            "bipolar-transistorler", x.Uretici, x.Mpn,
            $"TRANSISTOR {x.Tip} {ParcaKodlama.AnlamliBasamak(x.Vce, 4)}V {ParcaKodlama.AnlamliBasamak(x.Ic, 4)}A {x.Kilif}",
            x.Montaj,
            [
                new("transistor_tipi", x.Tip),
                new("vce_max", $"{ParcaKodlama.AnlamliBasamak(x.Vce, 4)} V", x.Vce),
                new("ic_max", $"{ParcaKodlama.AnlamliBasamak(x.Ic, 4)} A", x.Ic),
                new("hfe", ParcaKodlama.AnlamliBasamak(x.Hfe, 4), x.Hfe),
                new("guc_derecesi", x.Guc),
                new("kilif", x.Kilif)
            ]));
    }

    // -----------------------------------------------------------------------
    // Tristör ve triyak
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> TristorTriyaklar()
    {
        (string Uretici, string Mpn, string Tip, decimal Volt, decimal Akim, string Kilif, MontajTipi Montaj)[] liste =
        [
            ("STMicroelectronics", "BTA16-600BWRG", "Triyak (Snubbersız)", 600m, 16m, "TO-220AB", MontajTipi.Tht),
            ("STMicroelectronics", "BTA16-800BWRG", "Triyak (Snubbersız)", 800m, 16m, "TO-220AB", MontajTipi.Tht),
            ("STMicroelectronics", "BTA24-600BWRG", "Triyak (Snubbersız)", 600m, 25m, "TO-220AB", MontajTipi.Tht),
            ("STMicroelectronics", "BTA24-800CW", "Triyak (Snubbersız)", 800m, 25m, "TO-220AB", MontajTipi.Tht),
            ("STMicroelectronics", "BTA12-600BWRG", "Triyak (Snubbersız)", 600m, 12m, "TO-220AB", MontajTipi.Tht),
            ("STMicroelectronics", "BTB16-600BWRG", "Triyak", 600m, 16m, "TO-220AB", MontajTipi.Tht),
            ("STMicroelectronics", "BTB12-600BWRG", "Triyak", 600m, 12m, "TO-220AB", MontajTipi.Tht),
            ("STMicroelectronics", "T435-600B", "Triyak (Lojik Seviye)", 600m, 4m, "TO-220AB", MontajTipi.Tht),
            ("STMicroelectronics", "T1635T-8I", "Triyak (Lojik Seviye)", 800m, 16m, "TO-220AB Yalıtımlı", MontajTipi.Tht),
            ("STMicroelectronics", "Z0103MN5AA4", "Triyak (Düşük Güç)", 600m, 1m, "SOT-223", MontajTipi.Smt),
            ("STMicroelectronics", "Z0107MN5AA4", "Triyak (Düşük Güç)", 600m, 1m, "SOT-223", MontajTipi.Smt),
            ("STMicroelectronics", "TYN612RG", "Tristör (SCR)", 600m, 12m, "TO-220AB", MontajTipi.Tht),
            ("STMicroelectronics", "TYN1225RG", "Tristör (SCR)", 1200m, 25m, "TO-220AB", MontajTipi.Tht),
            ("STMicroelectronics", "TS820-600B", "Tristör (SCR)", 600m, 8m, "TO-220AB", MontajTipi.Tht),
            ("STMicroelectronics", "X0202MA5AL2", "Tristör (Hassas Kapı)", 600m, 1.25m, "SOT-223", MontajTipi.Smt),

            ("onsemi", "MAC97A6G", "Triyak (Düşük Güç)", 400m, 0.6m, "TO-92", MontajTipi.Tht),
            ("onsemi", "MAC4DCMG", "Triyak (Lojik Seviye)", 600m, 4m, "TO-220AB", MontajTipi.Tht),
            ("onsemi", "MCR100-6RLRAG", "Tristör (SCR)", 400m, 0.8m, "TO-92", MontajTipi.Tht),
            ("onsemi", "2N5060RLRAG", "Tristör (SCR)", 30m, 0.8m, "TO-92", MontajTipi.Tht),
            ("onsemi", "BT136S-600E", "Triyak", 600m, 4m, "SOT-428 (DPAK)", MontajTipi.Smt),

            ("Littelfuse", "Q6015L5TP", "Triyak (Alternistör)", 600m, 15m, "TO-220AB", MontajTipi.Tht),
            ("Littelfuse", "Q8025L6TP", "Triyak (Alternistör)", 800m, 25m, "TO-220AB", MontajTipi.Tht),
            ("Littelfuse", "L4008L6TP", "Tristör (SCR)", 600m, 8m, "TO-220AB", MontajTipi.Tht),
            ("Littelfuse", "S6012L", "Tristör (SCR)", 600m, 12m, "TO-220AB", MontajTipi.Tht),
            ("Littelfuse", "MOC3021M", "Optik Triyak Sürücü", 400m, 0.06m, "PDIP-6", MontajTipi.Tht)
        ];

        return liste.Select(x => new HamParca(
            "tristor-triyaklar", x.Uretici, x.Mpn,
            $"{x.Tip} {ParcaKodlama.AnlamliBasamak(x.Volt, 5)}V {ParcaKodlama.AnlamliBasamak(x.Akim, 4)}A {x.Kilif}",
            x.Montaj,
            [
                new("sensor_tipi", x.Tip),
                new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Volt, 5)} V", x.Volt),
                new("akim_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Akim, 4)} A", x.Akim),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", "-40 ~ +125 °C")
            ]));
    }

    // -----------------------------------------------------------------------
    // IGBT
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Igbtler()
    {
        (string Uretici, string Mpn, decimal Volt, decimal Akim, string Kilif, MontajTipi Montaj)[] liste =
        [
            ("Infineon Technologies", "IRG4BC30UDPBF", 600m, 23m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRG4PC50UDPBF", 600m, 55m, "TO-247AC", MontajTipi.Tht),
            ("Infineon Technologies", "IRGB4062DPBF", 600m, 24m, "TO-220AB", MontajTipi.Tht),
            ("Infineon Technologies", "IRGP4063DPBF", 600m, 96m, "TO-247AC", MontajTipi.Tht),
            ("Infineon Technologies", "IKW40N120H3", 1200m, 40m, "TO-247", MontajTipi.Tht),
            ("Infineon Technologies", "IKW75N65EH5", 650m, 75m, "TO-247", MontajTipi.Tht),
            ("Infineon Technologies", "IKW50N60TXKSA1", 600m, 50m, "TO-247", MontajTipi.Tht),
            ("Infineon Technologies", "IHW20N120R3", 1200m, 20m, "TO-247", MontajTipi.Tht),
            ("Infineon Technologies", "IKZ50N65EH5", 650m, 50m, "TO-247", MontajTipi.Tht),

            ("onsemi", "FGA25N120ANTDTU", 1200m, 25m, "TO-3PN", MontajTipi.Tht),
            ("onsemi", "FGH60N60SMD", 600m, 60m, "TO-247", MontajTipi.Tht),
            ("onsemi", "FGH40N60SMD", 600m, 40m, "TO-247", MontajTipi.Tht),
            ("onsemi", "NGTB25N120FL2WG", 1200m, 25m, "TO-247", MontajTipi.Tht),
            ("onsemi", "FGD3040G2", 400m, 15m, "DPAK", MontajTipi.Smt),

            ("STMicroelectronics", "STGW40N120KD", 1200m, 40m, "TO-247", MontajTipi.Tht),
            ("STMicroelectronics", "STGW60H65DFB", 650m, 60m, "TO-247", MontajTipi.Tht),
            ("STMicroelectronics", "STGP10NC60HD", 600m, 10m, "TO-220", MontajTipi.Tht),
            ("STMicroelectronics", "STGB10NC60HDT4", 600m, 10m, "D2PAK", MontajTipi.Smt),
            ("STMicroelectronics", "STGWA20H65DFB", 650m, 20m, "TO-247", MontajTipi.Tht),

            ("ROHM Semiconductor", "RGT30TS65DGC11", 650m, 30m, "TO-247", MontajTipi.Tht),
            ("Toshiba", "GT30J341(Q,S1,SE", 600m, 30m, "TO-3P(N)", MontajTipi.Tht),
            ("Toshiba", "GT20J341(Q,S1,SE", 600m, 20m, "TO-3P(N)", MontajTipi.Tht)
        ];

        return liste.Select(x => new HamParca(
            "igbt-guc-modulleri", x.Uretici, x.Mpn,
            $"IGBT {ParcaKodlama.AnlamliBasamak(x.Volt, 5)}V {ParcaKodlama.AnlamliBasamak(x.Akim, 4)}A {x.Kilif}",
            x.Montaj,
            [
                new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Volt, 5)} V", x.Volt),
                new("akim_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Akim, 4)} A", x.Akim),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", "-55 ~ +175 °C")
            ]));
    }
}
