using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Devre koruma — sigortalar, PTC sigortalar, varistörler ve TVS/ESD koruma.
///
/// Üç aile kombinatoryal üretilir çünkü sipariş kodu doğrudan anma değerini taşır
/// ve üretici o kademelerin tamamını listeler:
///
///   Bourns PTC     : MF-MSMF | akım kodu | -2      -> MF-MSMF050-2   (0.50 A)
///   Littelfuse PTC : kılıf | L | akım kodu | YR    -> 1206L050YR     (0.50 A, 1206)
///   Bourns MOV     : MOV- | disk | D | gerilim | K -> MOV-14D471K    (14 mm, 470 V)
///   TVS            : SMAJ/SMBJ/SMCJ | gerilim | A  -> SMBJ12A        (12 V, 600 W)
///
/// Kenetleme gerilimi (clamping) parça numarasında kodlanmaz, ölçüm değeridir;
/// bu yüzden yalnızca küratörlü ESD parçalarında verilir.
/// </summary>
public static class KorumaKaynagi
{
    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in Sigortalar()) yield return p;
        foreach (var p in PtcSigortalar()) yield return p;
        foreach (var p in Varistorler()) yield return p;
        foreach (var p in TvsEsd()) yield return p;
    }

    // -----------------------------------------------------------------------
    // Sigortalar
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Sigortalar()
    {
        (string Uretici, string Mpn, decimal Akim, decimal Volt, decimal Kesme, string Tepki, string Boyut, MontajTipi Montaj)[] liste =
        [
            ("Littelfuse", "0451.500MRL", 0.5m, 125m, 50m, "Hızlı (Fast-Acting)", "Nano2 SMD 8.7 x 4.2 mm", MontajTipi.Smt),
            ("Littelfuse", "0451001.MRL", 1m, 125m, 50m, "Hızlı (Fast-Acting)", "Nano2 SMD 8.7 x 4.2 mm", MontajTipi.Smt),
            ("Littelfuse", "0451002.MRL", 2m, 125m, 50m, "Hızlı (Fast-Acting)", "Nano2 SMD 8.7 x 4.2 mm", MontajTipi.Smt),
            ("Littelfuse", "0451003.MRL", 3m, 125m, 50m, "Hızlı (Fast-Acting)", "Nano2 SMD 8.7 x 4.2 mm", MontajTipi.Smt),
            ("Littelfuse", "0451005.MRL", 5m, 125m, 50m, "Hızlı (Fast-Acting)", "Nano2 SMD 8.7 x 4.2 mm", MontajTipi.Smt),
            ("Littelfuse", "0154001.DR", 1m, 125m, 50m, "Gecikmeli (Slow-Blow)", "Nano2 SMD 8.7 x 4.2 mm", MontajTipi.Smt),
            ("Littelfuse", "0154002.DR", 2m, 125m, 50m, "Gecikmeli (Slow-Blow)", "Nano2 SMD 8.7 x 4.2 mm", MontajTipi.Smt),
            ("Littelfuse", "0154004.DR", 4m, 125m, 50m, "Gecikmeli (Slow-Blow)", "Nano2 SMD 8.7 x 4.2 mm", MontajTipi.Smt),
            ("Littelfuse", "0466.500NR", 0.5m, 63m, 50m, "Hızlı (Fast-Acting)", "SMD 1206", MontajTipi.Smt),
            ("Littelfuse", "0466001.NR", 1m, 63m, 50m, "Hızlı (Fast-Acting)", "SMD 1206", MontajTipi.Smt),
            ("Littelfuse", "0466002.NR", 2m, 63m, 50m, "Hızlı (Fast-Acting)", "SMD 1206", MontajTipi.Smt),
            ("Littelfuse", "0217001.MXP", 1m, 250m, 1_500m, "Gecikmeli (Slow-Blow)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Littelfuse", "0217002.MXP", 2m, 250m, 1_500m, "Gecikmeli (Slow-Blow)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Littelfuse", "0217005.MXP", 5m, 250m, 1_500m, "Gecikmeli (Slow-Blow)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Littelfuse", "0235001.MXP", 1m, 250m, 1_500m, "Hızlı (Fast-Acting)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Littelfuse", "0235002.MXP", 2m, 250m, 1_500m, "Hızlı (Fast-Acting)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Littelfuse", "0287010.PXCN", 10m, 32m, 1_000m, "Hızlı (Fast-Acting)", "ATO Bıçak Tipi", MontajTipi.Yok),
            ("Littelfuse", "64900001039", 0m, 250m, 0m, "—", "5 x 20 mm Sigorta Yuvası (PCB)", MontajTipi.Tht),

            ("Bel Fuse", "5ST 1-R", 1m, 250m, 100m, "Gecikmeli (Slow-Blow)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Bel Fuse", "5ST 2-R", 2m, 250m, 100m, "Gecikmeli (Slow-Blow)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Bel Fuse", "5MF 1-R", 1m, 250m, 35m, "Hızlı (Fast-Acting)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Bel Fuse", "C1F 3.15A", 3.15m, 250m, 1_500m, "Hızlı (Fast-Acting)", "Seramik 5 x 20 mm", MontajTipi.Yok),
            ("Bel Fuse", "SSQ 5-R", 5m, 125m, 50m, "Gecikmeli (Slow-Blow)", "SMD 1206", MontajTipi.Smt),
            ("Bel Fuse", "0685P1000-01", 1m, 125m, 50m, "Hızlı (Fast-Acting)", "SMD 1206", MontajTipi.Smt),

            ("Schurter", "0034.6620", 2m, 250m, 1_500m, "Gecikmeli (Slow-Blow)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Schurter", "0034.6618", 1.6m, 250m, 1_500m, "Gecikmeli (Slow-Blow)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Schurter", "0031.8201", 1m, 250m, 35m, "Hızlı (Fast-Acting)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Schurter", "3101.0083", 0m, 250m, 0m, "—", "5 x 20 mm Sigorta Yuvası (Panel)", MontajTipi.Yok),
            ("Schurter", "0031.8341", 6.3m, 250m, 35m, "Hızlı (Fast-Acting)", "Cam 5 x 20 mm", MontajTipi.Yok),
            ("Eaton", "SMDC110F-2", 1.1m, 60m, 100m, "Gecikmeli (Slow-Blow)", "SMD 1812", MontajTipi.Smt),
            ("Keystone Electronics", "3557-2", 0m, 250m, 0m, "—", "5 x 20 mm Sigorta Klipsi", MontajTipi.Tht)
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Volt, 4)} V", x.Volt),
                new("tepki_suresi", x.Tepki),
                new("boyutlar", x.Boyut),
                new("montaj_sekli", x.Montaj switch
                {
                    MontajTipi.Smt => "Yüzey Montaj",
                    MontajTipi.Tht => "Delikli Montaj",
                    _ => "Yuvaya Takmalı"
                })
            };

            // Sigorta yuvaları ve klipslerin anma akımı yoktur; onlarda bu alan atlanır.
            if (x.Akim > 0m)
                ozellikler.Insert(0, new ParcaOzelligi("akim_derecesi", $"{ParcaKodlama.AnlamliBasamak(x.Akim, 4)} A", x.Akim));

            if (x.Kesme > 0m)
                ozellikler.Insert(ozellikler.Count - 2, new ParcaOzelligi("kesme_akimi", $"{ParcaKodlama.AnlamliBasamak(x.Kesme, 5)} A", x.Kesme));

            yield return new HamParca(
                "sigortalar", x.Uretici, x.Mpn,
                x.Akim > 0m
                    ? $"SIGORTA {ParcaKodlama.AnlamliBasamak(x.Akim, 4)}A {ParcaKodlama.AnlamliBasamak(x.Volt, 4)}V {x.Tepki} {x.Boyut}"
                    : $"SIGORTA AKSESUARI {x.Boyut}",
                x.Montaj, ozellikler);
        }
    }

    // -----------------------------------------------------------------------
    // PTC (kendinden kurmalı) sigortalar
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> PtcSigortalar()
    {
        // Bourns MF-MSMF serisi — kod, tutma akımının 10 mA'lik katları cinsinden yazımıdır.
        (string Kod, decimal Akim)[] bournsSmd =
        [
            ("010", 0.10m), ("020", 0.20m), ("035", 0.35m), ("050", 0.50m), ("075", 0.75m),
            ("110", 1.10m), ("150", 1.50m), ("200", 2.00m), ("260", 2.60m)
        ];

        foreach (var (kod, akim) in bournsSmd)
        {
            yield return Ptc("Bourns", $"MF-MSMF{kod}-2", akim, 6m, "1812", MontajTipi.Smt);
            yield return Ptc("Bourns", $"MF-USMF{kod}-2", akim, 6m, "1206", MontajTipi.Smt);
            yield return Ptc("Bourns", $"MF-R{kod}", akim, 60m, "Radyal Disk", MontajTipi.Tht);
        }

        // Littelfuse PolySwitch benzeri seri — kılıf ölçüsü kodun başındadır.
        (string Kilif, decimal Volt)[] littelKiliflar = [("0805", 6m), ("1206", 6m), ("1812", 16m)];

        foreach (var (kilif, volt) in littelKiliflar)
        foreach (var (kod, akim) in bournsSmd)
        {
            yield return Ptc("Littelfuse", $"{kilif}L{kod}YR", akim, volt, kilif, MontajTipi.Smt);
        }

        (string Uretici, string Mpn, decimal Akim, decimal Volt, string Kilif, MontajTipi Montaj)[] ekler =
        [
            ("Littelfuse", "60R110XU", 1.10m, 60m, "Radyal Disk", MontajTipi.Tht),
            ("Littelfuse", "60R250XU", 2.50m, 60m, "Radyal Disk", MontajTipi.Tht),
            ("Littelfuse", "30R050UF", 0.50m, 30m, "Radyal Disk", MontajTipi.Tht),
            ("Bel Fuse", "0ZCJ0050FF2G", 0.50m, 60m, "Radyal Disk", MontajTipi.Tht),
            ("Bel Fuse", "0ZCJ0110FF2G", 1.10m, 60m, "Radyal Disk", MontajTipi.Tht),
            ("Eaton", "PTS120616V050", 0.50m, 6m, "0603", MontajTipi.Smt),
            ("Eaton", "PTS181616V110", 1.10m, 16m, "1812", MontajTipi.Smt),
            ("TDK", "PTGL07AR100M3B51B0", 10m, 265m, "Radyal Disk", MontajTipi.Tht)
        ];

        foreach (var e in ekler)
            yield return Ptc(e.Uretici, e.Mpn, e.Akim, e.Volt, e.Kilif, e.Montaj);
    }

    private static HamParca Ptc(
        string uretici, string mpn, decimal akim, decimal volt, string kilif, MontajTipi montaj)
    {
        var ozellikler = new List<ParcaOzelligi>
        {
            new("akim_derecesi", $"{ParcaKodlama.AnlamliBasamak(akim, 3)} A (tutma)", akim),
            new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(volt, 4)} V", volt),
            new("montaj_sekli", montaj == MontajTipi.Smt ? "Yüzey Montaj" : "Delikli Montaj")
        };

        if (kilif.Length == 4 && kilif.All(char.IsDigit))
            ozellikler.Insert(2, new ParcaOzelligi("boyut_kodu", kilif));

        return new HamParca(
            "ptc-sigortalar", uretici, mpn,
            $"PTC SIGORTA {ParcaKodlama.AnlamliBasamak(akim, 3)}A {ParcaKodlama.AnlamliBasamak(volt, 4)}V {kilif}",
            montaj, ozellikler);
    }

    // -----------------------------------------------------------------------
    // Varistörler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Varistorler()
    {
        // Bourns MOV serisi: MOV-<disk çapı>D<varistör gerilimi>K
        (string Disk, decimal Kesme)[] diskler = [("07", 1_750m), ("10", 2_500m), ("14", 6_000m), ("20", 10_000m)];

        (string Kod, decimal Varistor, decimal Sebeke, decimal Kenetleme)[] gerilimler =
        [
            ("101", 100m, 60m, 165m),
            ("151", 150m, 95m, 250m),
            ("201", 200m, 130m, 340m),
            ("271", 270m, 175m, 455m),
            ("391", 390m, 250m, 650m),
            ("431", 430m, 275m, 710m),
            ("471", 470m, 300m, 775m),
            ("561", 560m, 350m, 930m),
            ("681", 680m, 420m, 1_120m),
            ("821", 820m, 510m, 1_355m)
        ];

        foreach (var (disk, kesme) in diskler)
        foreach (var (kod, varistor, sebeke, kenetleme) in gerilimler)
        {
            yield return new HamParca(
                "varistorler", "Bourns", $"MOV-{disk}D{kod}K",
                $"VARISTÖR {ParcaKodlama.AnlamliBasamak(varistor, 4)}V {ParcaKodlama.AnlamliBasamak(sebeke, 4)}VAC {disk} mm DISK",
                MontajTipi.Tht,
                [
                    new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(sebeke, 4)} VAC", sebeke),
                    new("clamping_voltaji", $"{ParcaKodlama.AnlamliBasamak(kenetleme, 5)} V", kenetleme),
                    new("kesme_akimi", $"{ParcaKodlama.AnlamliBasamak(kesme, 6)} A (8/20 µs)", kesme),
                    new("boyutlar", $"Disk Ø{disk} mm"),
                    new("montaj_sekli", "Radyal / Delikli")
                ]);
        }

        (string Uretici, string Mpn, decimal Sebeke, decimal Kenetleme, decimal Kesme, string Boyut, MontajTipi Montaj)[] ekler =
        [
            ("Littelfuse", "V150LA10AP", 150m, 395m, 4_500m, "Disk Ø14 mm", MontajTipi.Tht),
            ("Littelfuse", "V275LA20AP", 275m, 710m, 6_500m, "Disk Ø14 mm", MontajTipi.Tht),
            ("Littelfuse", "V385LA20AP", 385m, 970m, 6_500m, "Disk Ø14 mm", MontajTipi.Tht),
            ("Littelfuse", "V07E150P", 150m, 395m, 1_200m, "Disk Ø7 mm", MontajTipi.Tht),
            ("Littelfuse", "V14E275P", 275m, 710m, 6_000m, "Disk Ø14 mm", MontajTipi.Tht),
            ("Littelfuse", "V20E320P", 320m, 840m, 10_000m, "Disk Ø20 mm", MontajTipi.Tht),
            ("Littelfuse", "V5.5MLA1206NH", 5.5m, 17m, 100m, "1206", MontajTipi.Smt),
            ("Littelfuse", "V18MLA1206H", 18m, 43m, 100m, "1206", MontajTipi.Smt),
            ("EPCOS", "B72220S0271K101", 175m, 455m, 6_500m, "Disk Ø14 mm", MontajTipi.Tht),
            ("EPCOS", "B72214S0271K101", 175m, 455m, 4_500m, "Disk Ø10 mm", MontajTipi.Tht),
            ("EPCOS", "B72207S0250K101", 150m, 395m, 1_200m, "Disk Ø7 mm", MontajTipi.Tht),
            ("EPCOS", "B72580T0250K062", 25m, 60m, 500m, "0805", MontajTipi.Smt),
            ("TDK", "B72520T0250K062", 25m, 60m, 800m, "1206", MontajTipi.Smt),
            ("Panasonic", "ERZ-V14D431", 275m, 710m, 6_000m, "Disk Ø14 mm", MontajTipi.Tht),
            ("Panasonic", "ERZ-V10D471", 300m, 775m, 3_500m, "Disk Ø10 mm", MontajTipi.Tht)
        ];

        foreach (var e in ekler)
        {
            yield return new HamParca(
                "varistorler", e.Uretici, e.Mpn,
                $"VARISTÖR {ParcaKodlama.AnlamliBasamak(e.Sebeke, 4)}VAC {ParcaKodlama.AnlamliBasamak(e.Kenetleme, 5)}V KENETLEME {e.Boyut}",
                e.Montaj,
                [
                    new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(e.Sebeke, 4)} VAC", e.Sebeke),
                    new("clamping_voltaji", $"{ParcaKodlama.AnlamliBasamak(e.Kenetleme, 5)} V", e.Kenetleme),
                    new("kesme_akimi", $"{ParcaKodlama.AnlamliBasamak(e.Kesme, 6)} A (8/20 µs)", e.Kesme),
                    new("boyutlar", e.Boyut),
                    new("montaj_sekli", e.Montaj == MontajTipi.Smt ? "Yüzey Montaj" : "Radyal / Delikli")
                ]);
        }
    }

    // -----------------------------------------------------------------------
    // TVS ve ESD koruma
    // -----------------------------------------------------------------------

    /// <summary>SMAJ / SMBJ / SMCJ serilerinin standart tepe ters çalışma gerilimleri.</summary>
    private static readonly (string Kod, decimal Volt)[] TvsGerilimleri =
    [
        ("5.0", 5.0m), ("6.0", 6.0m), ("6.5", 6.5m), ("7.0", 7.0m), ("7.5", 7.5m),
        ("8.0", 8.0m), ("8.5", 8.5m), ("9.0", 9.0m), ("10", 10m), ("11", 11m),
        ("12", 12m), ("13", 13m), ("14", 14m), ("15", 15m), ("16", 16m), ("18", 18m),
        ("20", 20m), ("22", 22m), ("24", 24m), ("26", 26m), ("28", 28m), ("30", 30m),
        ("33", 33m), ("36", 36m), ("40", 40m), ("43", 43m), ("48", 48m), ("51", 51m),
        ("58", 58m), ("60", 60m), ("70", 70m), ("78", 78m), ("85", 85m), ("100", 100m)
    ];

    private static IEnumerable<HamParca> TvsEsd()
    {
        (string Seri, string Guc, string Kilif)[] seriler =
        [
            ("SMAJ", "400 W", "SMA (DO-214AC)"),
            ("SMBJ", "600 W", "SMB (DO-214AA)"),
            ("SMCJ", "1500 W", "SMC (DO-214AB)")
        ];

        foreach (var (seri, guc, kilif) in seriler)
        foreach (var (kod, volt) in TvsGerilimleri)
        {
            yield return new HamParca(
                "tvs-esd-koruma", "Littelfuse", $"{seri}{kod}A",
                $"TVS DIYOT {ParcaKodlama.AnlamliBasamak(volt, 4)}V TEK YÖNLÜ {guc} {kilif}",
                MontajTipi.Smt,
                [
                    new("koruma_tipi", $"TVS Diyot — Tek Yönlü ({guc})"),
                    new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(volt, 4)} V", volt),
                    new("kanal_sayisi", "1", 1m),
                    new("kilif", kilif),
                    new("calisma_sicakligi", "-55 ~ +150 °C")
                ]);

            yield return new HamParca(
                "tvs-esd-koruma", "Littelfuse", $"{seri}{kod}CA",
                $"TVS DIYOT {ParcaKodlama.AnlamliBasamak(volt, 4)}V ÇIFT YÖNLÜ {guc} {kilif}",
                MontajTipi.Smt,
                [
                    new("koruma_tipi", $"TVS Diyot — Çift Yönlü ({guc})"),
                    new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(volt, 4)} V", volt),
                    new("kanal_sayisi", "1", 1m),
                    new("kilif", kilif),
                    new("calisma_sicakligi", "-55 ~ +150 °C")
                ]);
        }

        (string Uretici, string Mpn, string Tip, decimal Volt, decimal Kenetleme, int Kanal, string Kilif)[] esd =
        [
            ("Nexperia", "PESD5V0S1BA,115", "ESD Koruma Diyotu", 5.0m, 12m, 1, "SOD-323"),
            ("Nexperia", "PESD3V3L1BA,115", "ESD Koruma Diyotu", 3.3m, 9m, 1, "SOD-323"),
            ("Nexperia", "PESD5V0S2BT,215", "ESD Koruma Diyotu (Çift)", 5.0m, 12m, 2, "SOT-23"),
            ("Nexperia", "PRTR5V0U2X,215", "USB Hat Koruma Dizisi", 5.0m, 11m, 2, "SOT-143B"),
            ("Nexperia", "IP4220CZ6,125", "USB / Yüksek Hız Hat Koruma", 5.0m, 10m, 4, "SOT-457"),
            ("Nexperia", "PESD1CAN,215", "CAN Hat Koruma Dizisi", 24m, 40m, 2, "SOT-23"),

            ("STMicroelectronics", "USBLC6-2SC6", "USB 2.0 Hat Koruma Dizisi", 5.0m, 17m, 2, "SOT-23-6"),
            ("STMicroelectronics", "ESDA6V1-5W6", "5 Hatlı ESD Koruma Dizisi", 6.1m, 12m, 5, "SOT-23-6"),
            ("STMicroelectronics", "ESDA25P35-1U1M", "Tek Hat ESD Koruma", 25m, 40m, 1, "0201"),
            ("STMicroelectronics", "SMF05CT1G", "5 Hatlı ESD Koruma Dizisi", 5.0m, 15m, 5, "SOT-23-6"),

            ("onsemi", "ESD9B5.0ST5G", "ESD Koruma Diyotu", 5.0m, 11m, 1, "SOD-923"),
            ("onsemi", "ESD9B3.3ST5G", "ESD Koruma Diyotu", 3.3m, 9m, 1, "SOD-923"),
            ("onsemi", "NUP2105LT1G", "CAN Hat Koruma Dizisi", 24m, 40m, 2, "SOT-23"),
            ("onsemi", "NUP4114UPXV6T1G", "4 Hatlı ESD Koruma Dizisi", 5.0m, 14m, 4, "SOT-563"),

            ("Texas Instruments", "TPD2E001DRLR", "2 Hatlı ESD Koruma", 5.5m, 12m, 2, "SOT-553"),
            ("Texas Instruments", "TPD4E1U06DBVR", "4 Hatlı ESD Koruma", 5.5m, 12m, 4, "SOT-23-6"),
            ("Texas Instruments", "TPD1E10B06DPYR", "Tek Hat ESD Koruma", 6.0m, 13m, 1, "X1SON-2"),
            ("Texas Instruments", "TPD8S300RUKR", "USB Type-C Kısa Devre ve ESD Koruma", 22m, 30m, 8, "WQFN-20"),

            ("Littelfuse", "SP0503BAHTG", "3 Hatlı ESD Koruma Dizisi", 5.0m, 15m, 3, "SOT-143"),
            ("Littelfuse", "PGB1010603MR", "PulseGuard ESD Bastırıcı", 24m, 0m, 1, "0603"),
            ("Vishay", "VBUS054BD-HD1-GS08", "4 Hatlı ESD Koruma Dizisi", 5.4m, 12m, 4, "SOT-23-6"),
            ("Vishay", "VESD05A1-02V-G-08", "Tek Hat ESD Koruma", 5.0m, 12m, 1, "SOD-882"),
            ("Semtech", "RCLAMP0524P.TCT", "4 Hatlı ESD Koruma Dizisi", 5.0m, 9m, 4, "SLP2510P6"),
            ("Semtech", "µCLAMP3311P.TCT", "Tek Hat ESD Koruma", 3.3m, 6m, 1, "SLP1006P2")
        ];

        foreach (var e in esd)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("koruma_tipi", e.Tip),
                new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(e.Volt, 4)} V", e.Volt),
                new("kanal_sayisi", e.Kanal.ToString(), e.Kanal),
                new("kilif", e.Kilif),
                new("calisma_sicakligi", "-55 ~ +150 °C")
            };

            if (e.Kenetleme > 0m)
                ozellikler.Insert(2, new ParcaOzelligi("clamping_voltaji", $"{ParcaKodlama.AnlamliBasamak(e.Kenetleme, 4)} V", e.Kenetleme));

            yield return new HamParca(
                "tvs-esd-koruma", e.Uretici, e.Mpn,
                $"{e.Tip} {ParcaKodlama.AnlamliBasamak(e.Volt, 4)}V {e.Kanal}CH {e.Kilif}",
                MontajTipi.Smt, ozellikler);
        }
    }
}
