using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Güç yönetimi entegreleri — regülatörler, referanslar, motor ve gate sürücüler,
/// pil şarj devreleri.
///
/// 78xx/79xx ailesi kombinatoryal üretilir çünkü sipariş kodu doğrudan çıkış
/// voltajını taşır ve tüm kademeler üreticinin katalogunda vardır
/// (L7805CV, L7812CV, L78L05ACZ...). Geri kalanı küratörlüdür.
/// </summary>
public static class GucYonetimiKaynagi
{
    private const string Sicaklik = "-40 ~ +125 °C";

    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in SabitRegulatorAilesi()) yield return p;
        foreach (var p in LineerRegulatorler()) yield return p;
        foreach (var p in AnahtarlamaliRegulatorler()) yield return p;
        foreach (var p in GerilimReferanslari()) yield return p;
        foreach (var p in MotorSuruculer()) yield return p;
        foreach (var p in GateSuruculer()) yield return p;
        foreach (var p in PilSarjEntegreleri()) yield return p;
    }

    // -----------------------------------------------------------------------
    // 78xx / 79xx ailesi
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> SabitRegulatorAilesi()
    {
        (string Kod, decimal Volt)[] pozitif =
            [("05", 5m), ("06", 6m), ("08", 8m), ("09", 9m), ("12", 12m), ("15", 15m), ("18", 18m), ("24", 24m)];

        (string Kod, decimal Volt)[] negatif =
            [("05", -5m), ("08", -8m), ("12", -12m), ("15", -15m), ("24", -24m)];

        // ST'nin sipariş kodu: L78 + [M|L] + voltaj + kılıf soneki.
        // M = 500 mA, L = 100 mA, sonek yok = 1.5 A.
        foreach (var (kod, volt) in pozitif)
        {
            yield return Ldo("STMicroelectronics", $"L78{kod}CV", volt, 1.5m, 35m, 2_000m, "TO-220", MontajTipi.Tht);
            yield return Ldo("STMicroelectronics", $"L78M{kod}CV", volt, 0.5m, 35m, 2_000m, "TO-220", MontajTipi.Tht);
            yield return Ldo("STMicroelectronics", $"L78L{kod}ACZ", volt, 0.1m, 30m, 1_700m, "TO-92", MontajTipi.Tht);
            yield return Ldo("STMicroelectronics", $"L78{kod}CDT-TR", volt, 1.5m, 35m, 2_000m, "DPAK", MontajTipi.Smt);
        }

        foreach (var (kod, volt) in negatif)
        {
            yield return Ldo("STMicroelectronics", $"L79{kod}CV", volt, 1.5m, -35m, 2_000m, "TO-220", MontajTipi.Tht);
            yield return Ldo("STMicroelectronics", $"L79L{kod}ACZ", volt, 0.1m, -30m, 1_700m, "TO-92", MontajTipi.Tht);
        }

        // onsemi'nin MC78xx karşılıkları.
        foreach (var (kod, volt) in pozitif)
        {
            yield return Ldo("onsemi", $"MC78{kod}CTG", volt, 1m, 35m, 2_000m, "TO-220", MontajTipi.Tht);
            yield return Ldo("onsemi", $"MC78M{kod}CDTG", volt, 0.5m, 35m, 2_000m, "DPAK", MontajTipi.Smt);
        }
    }

    private static HamParca Ldo(
        string uretici, string mpn, decimal cikisVolt, decimal akim, decimal girisMax, decimal dropout,
        string kilif, MontajTipi montaj) =>
        new(
            "lineer-regulatorler", uretici, mpn,
            $"IC REG LINEER {ParcaKodlama.AnlamliBasamak(Math.Abs(cikisVolt), 4)}V {ParcaKodlama.AnlamliBasamak(akim, 3)}A {kilif}",
            montaj,
            [
                new("cikis_voltaji", $"{ParcaKodlama.AnlamliBasamak(cikisVolt, 4)} V", cikisVolt),
                new("cikis_akimi", $"{ParcaKodlama.AnlamliBasamak(akim, 3)} A", akim),
                new("giris_voltaji_max", $"{ParcaKodlama.AnlamliBasamak(girisMax, 4)} V", girisMax),
                new("dropout_voltaji", $"{ParcaKodlama.AnlamliBasamak(dropout, 5)} mV", dropout),
                new("kilif", kilif),
                new("calisma_sicakligi", Sicaklik)
            ]);

    // -----------------------------------------------------------------------
    // Düşük dropout regülatörler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> LineerRegulatorler()
    {
        (string Uretici, string Mpn, decimal Volt, decimal Akim, decimal GirisMax, decimal Dropout, string Kilif, MontajTipi Montaj)[] liste =
        [
            ("STMicroelectronics", "LD1117S33TR",   3.3m, 0.8m, 15m, 1_100m, "SOT-223", MontajTipi.Smt),
            ("STMicroelectronics", "LD1117S50TR",   5.0m, 0.8m, 15m, 1_100m, "SOT-223", MontajTipi.Smt),
            ("STMicroelectronics", "LD1117S18TR",   1.8m, 0.8m, 15m, 1_100m, "SOT-223", MontajTipi.Smt),
            ("STMicroelectronics", "LD1117S25TR",   2.5m, 0.8m, 15m, 1_100m, "SOT-223", MontajTipi.Smt),
            ("STMicroelectronics", "LD1117V33",     3.3m, 0.8m, 15m, 1_100m, "TO-220", MontajTipi.Tht),
            ("STMicroelectronics", "LD39050PU33R",  3.3m, 0.5m, 5.5m, 200m, "DFN-6", MontajTipi.Smt),
            ("STMicroelectronics", "LDL1117S33R",   3.3m, 1.2m, 18m, 350m, "SOT-223", MontajTipi.Smt),
            ("STMicroelectronics", "LF33ABV",       3.3m, 0.5m, 20m, 450m, "TO-220", MontajTipi.Tht),

            ("Texas Instruments", "LM1117MPX-3.3/NOPB", 3.3m, 0.8m, 15m, 1_200m, "SOT-223", MontajTipi.Smt),
            ("Texas Instruments", "LM1117MPX-5.0/NOPB", 5.0m, 0.8m, 15m, 1_200m, "SOT-223", MontajTipi.Smt),
            ("Texas Instruments", "LM1117T-3.3/NOPB",   3.3m, 0.8m, 15m, 1_200m, "TO-220", MontajTipi.Tht),
            ("Texas Instruments", "LM317T",             1.25m, 1.5m, 40m, 2_000m, "TO-220", MontajTipi.Tht),
            ("Texas Instruments", "LM317MBSTT3G",       1.25m, 0.5m, 40m, 2_000m, "SOT-223", MontajTipi.Smt),
            ("Texas Instruments", "TLV1117LV33DCYR",    3.3m, 1m, 5.5m, 1_000m, "SOT-223", MontajTipi.Smt),
            ("Texas Instruments", "TLV70033DDCR",       3.3m, 0.2m, 5.5m, 180m, "SOT-23-5", MontajTipi.Smt),
            ("Texas Instruments", "TLV70018DDCR",       1.8m, 0.2m, 5.5m, 180m, "SOT-23-5", MontajTipi.Smt),
            ("Texas Instruments", "TPS7A4901DGNR",      1.194m, 0.15m, 36m, 260m, "MSOP-8", MontajTipi.Smt),
            ("Texas Instruments", "TPS73633DBVR",       3.3m, 0.4m, 5.5m, 75m, "SOT-23-5", MontajTipi.Smt),
            ("Texas Instruments", "TPS79533DCQR",       3.3m, 0.5m, 5.5m, 100m, "SOT-223-5", MontajTipi.Smt),
            ("Texas Instruments", "LP2985A-33DBVR",     3.3m, 0.15m, 16m, 280m, "SOT-23-5", MontajTipi.Smt),
            ("Texas Instruments", "UA78M33CDCYR",       3.3m, 0.5m, 30m, 1_000m, "SOT-223", MontajTipi.Smt),

            ("Diodes Incorporated", "AP2112K-3.3TRG1", 3.3m, 0.6m, 6m, 250m, "SOT-25", MontajTipi.Smt),
            ("Diodes Incorporated", "AP2112K-1.8TRG1", 1.8m, 0.6m, 6m, 250m, "SOT-25", MontajTipi.Smt),
            ("Diodes Incorporated", "AP2112K-2.5TRG1", 2.5m, 0.6m, 6m, 250m, "SOT-25", MontajTipi.Smt),
            ("Diodes Incorporated", "AP2112K-5.0TRG1", 5.0m, 0.6m, 6m, 250m, "SOT-25", MontajTipi.Smt),
            ("Diodes Incorporated", "AP7361C-33E-13",  3.3m, 1m, 6m, 200m, "DFN-6", MontajTipi.Smt),
            ("Diodes Incorporated", "AZ1117CH-3.3TRG1",3.3m, 1m, 18m, 1_100m, "SOT-223", MontajTipi.Smt),

            ("Microchip Technology", "MCP1700-3302E/TO", 3.3m, 0.25m, 6m, 178m, "TO-92", MontajTipi.Tht),
            ("Microchip Technology", "MCP1700T-3302E/TT",3.3m, 0.25m, 6m, 178m, "SOT-23-3", MontajTipi.Smt),
            ("Microchip Technology", "MCP1700T-5002E/TT",5.0m, 0.25m, 6m, 178m, "SOT-23-3", MontajTipi.Smt),
            ("Microchip Technology", "MCP1703A-3302E/DB",3.3m, 0.25m, 16m, 625m, "SOT-223", MontajTipi.Smt),
            ("Microchip Technology", "MCP1826S-3302E/DB",3.3m, 1m, 6m, 250m, "SOT-223", MontajTipi.Smt),
            ("Microchip Technology", "MIC5219-3.3YM5-TR",3.3m, 0.5m, 12m, 350m, "SOT-23-5", MontajTipi.Smt),

            ("onsemi", "NCP1117ST33T3G",  3.3m, 1m, 20m, 1_200m, "SOT-223", MontajTipi.Smt),
            ("onsemi", "NCP1117ST50T3G",  5.0m, 1m, 20m, 1_200m, "SOT-223", MontajTipi.Smt),
            ("onsemi", "NCP1117ST12T3G",  1.2m, 1m, 20m, 1_200m, "SOT-223", MontajTipi.Smt),
            ("onsemi", "NCP551SN33T1G",   3.3m, 0.15m, 12m, 300m, "TSOP-5", MontajTipi.Smt),
            ("onsemi", "NCV8664ST50T3G",  5.0m, 0.15m, 40m, 500m, "SOT-223", MontajTipi.Smt),

            ("Holtek", "HT7333-A", 3.3m, 0.25m, 12m, 100m, "SOT-89", MontajTipi.Smt),
            ("Holtek", "HT7350-A", 5.0m, 0.25m, 12m, 100m, "SOT-89", MontajTipi.Smt),
            ("Holtek", "HT7530-1", 3.0m, 0.1m, 12m, 100m, "SOT-89", MontajTipi.Smt),

            ("ROHM Semiconductor", "BD00IC0WEFJ-E2", 3.3m, 1m, 26m, 500m, "HTSOP-J8", MontajTipi.Smt),
            ("ROHM Semiconductor", "BU33SD5WG-TR",   3.3m, 0.2m, 5.5m, 130m, "SSOP-5", MontajTipi.Smt),

            ("Analog Devices", "LT1763CS8-3.3#PBF", 3.3m, 0.5m, 20m, 300m, "SOIC-8", MontajTipi.Smt),
            ("Analog Devices", "LT3080EST#PBF",     1.2m, 1.1m, 36m, 350m, "SOT-223", MontajTipi.Smt),
            ("Analog Devices", "ADP7142ARDZ-3.3-R7",3.3m, 0.2m, 40m, 350m, "SOIC-8", MontajTipi.Smt),

            ("Infineon Technologies", "TLE4275GV50", 5.0m, 0.45m, 45m, 500m, "TO-252", MontajTipi.Smt),
            ("Infineon Technologies", "TLS205B0EJV50", 5.0m, 0.5m, 40m, 300m, "PG-DSO-8", MontajTipi.Smt)
        ];

        return liste.Select(x => Ldo(x.Uretici, x.Mpn, x.Volt, x.Akim, x.GirisMax, x.Dropout, x.Kilif, x.Montaj));
    }

    // -----------------------------------------------------------------------
    // Anahtarlamalı regülatörler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> AnahtarlamaliRegulatorler()
    {
        (string Uretici, string Mpn, string Topoloji, decimal Volt, decimal Akim, decimal GirisMax, decimal FreqKhz, decimal Verim, string Kilif, MontajTipi Montaj)[] liste =
        [
            ("Texas Instruments", "LM2596S-5.0/NOPB",  "Buck (Düşürücü)", 5.0m, 3m, 40m, 150m, 80m, "TO-263-5", MontajTipi.Smt),
            ("Texas Instruments", "LM2596S-3.3/NOPB",  "Buck (Düşürücü)", 3.3m, 3m, 40m, 150m, 78m, "TO-263-5", MontajTipi.Smt),
            ("Texas Instruments", "LM2596S-12/NOPB",   "Buck (Düşürücü)", 12m, 3m, 40m, 150m, 90m, "TO-263-5", MontajTipi.Smt),
            ("Texas Instruments", "LM2596S-ADJ/NOPB",  "Buck (Düşürücü)", 1.23m, 3m, 40m, 150m, 80m, "TO-263-5", MontajTipi.Smt),
            ("Texas Instruments", "LM2576T-5.0/NOPB",  "Buck (Düşürücü)", 5.0m, 3m, 40m, 52m, 77m, "TO-220-5", MontajTipi.Tht),
            ("Texas Instruments", "LM2577S-ADJ/NOPB",  "Boost (Yükseltici)", 1.23m, 3m, 40m, 52m, 80m, "TO-263-5", MontajTipi.Smt),
            ("Texas Instruments", "TPS5430DDAR",       "Buck (Düşürücü)", 1.221m, 3m, 36m, 500m, 90m, "SO-8 PowerPAD", MontajTipi.Smt),
            ("Texas Instruments", "TPS54331DR",        "Buck (Düşürücü)", 0.8m, 3m, 28m, 570m, 90m, "SOIC-8", MontajTipi.Smt),
            ("Texas Instruments", "TPS62130RGTR",      "Buck (Düşürücü)", 0.8m, 3m, 17m, 2_500m, 95m, "VQFN-16", MontajTipi.Smt),
            ("Texas Instruments", "TPS62143RGTR",      "Buck (Düşürücü)", 0.8m, 2m, 17m, 2_500m, 95m, "VQFN-16", MontajTipi.Smt),
            ("Texas Instruments", "TPS61088RHLR",      "Boost (Yükseltici)", 2.5m, 10m, 12m, 1_000m, 92m, "VQFN-20", MontajTipi.Smt),
            ("Texas Instruments", "TPS63020DSJR",      "Buck-Boost", 1.2m, 4m, 12m, 2_400m, 96m, "SON-12", MontajTipi.Smt),
            ("Texas Instruments", "LMR14020SDDAR",     "Buck (Düşürücü)", 0.765m, 2m, 40m, 700m, 92m, "SO-8 PowerPAD", MontajTipi.Smt),
            ("Texas Instruments", "TPS54202DDCR",      "Buck (Düşürücü)", 0.6m, 2m, 28m, 500m, 91m, "SOT-23-6", MontajTipi.Smt),

            ("Monolithic Power Systems", "MP1584EN-LF-Z", "Buck (Düşürücü)", 0.8m, 3m, 28m, 1_500m, 92m, "SOIC-8 EP", MontajTipi.Smt),
            ("Monolithic Power Systems", "MP2307DN-LF-Z", "Buck (Düşürücü)", 0.925m, 3m, 23m, 340m, 95m, "SOIC-8 EP", MontajTipi.Smt),
            ("Monolithic Power Systems", "MP1470GJ-Z",    "Buck (Düşürücü)", 0.8m, 2m, 16m, 500m, 95m, "TSOT-23-8", MontajTipi.Smt),
            ("Monolithic Power Systems", "MP2315GJ-Z",    "Buck (Düşürücü)", 0.8m, 3m, 24m, 500m, 95m, "TSOT-23-8", MontajTipi.Smt),
            ("Monolithic Power Systems", "MP2451DT-LF-Z", "Buck (Düşürücü)", 0.6m, 0.6m, 36m, 1_400m, 90m, "TSOT-23-6", MontajTipi.Smt),

            ("Richtek", "RT8279GSP",   "Buck (Düşürücü)", 0.8m, 3m, 24m, 500m, 93m, "SOP-8 EP", MontajTipi.Smt),
            ("Richtek", "RT8059GJ5",   "Buck (Düşürücü)", 0.6m, 1m, 5.5m, 1_500m, 95m, "SOT-23-5", MontajTipi.Smt),
            ("Richtek", "RT9013-33GB", "LDO Destekli Buck", 3.3m, 0.5m, 5.5m, 0m, 90m, "SOT-23-5", MontajTipi.Smt),

            ("Diodes Incorporated", "AP63203WU-7",  "Buck (Düşürücü)", 0.8m, 2m, 32m, 500m, 93m, "TSOT-25", MontajTipi.Smt),
            ("Diodes Incorporated", "AP63205WU-7",  "Buck (Düşürücü)", 0.8m, 2m, 32m, 500m, 93m, "TSOT-25", MontajTipi.Smt),
            ("Diodes Incorporated", "AP3012KTR-G1", "Boost (Yükseltici)", 1.25m, 0.35m, 30m, 1_200m, 85m, "TSOT-25", MontajTipi.Smt),

            ("onsemi", "MC34063ADR2G",   "Buck / Boost / İnvert", 1.25m, 1.5m, 40m, 100m, 85m, "SOIC-8", MontajTipi.Smt),
            ("onsemi", "MC34063AP1G",    "Buck / Boost / İnvert", 1.25m, 1.5m, 40m, 100m, 85m, "PDIP-8", MontajTipi.Tht),
            ("onsemi", "NCP3170ADR2G",   "Buck (Düşürücü)", 0.8m, 3m, 18m, 500m, 93m, "SOIC-8", MontajTipi.Smt),
            ("onsemi", "NCP1529ASNT1G",  "Buck (Düşürücü)", 0.9m, 1m, 5.5m, 1_700m, 94m, "TSOP-5", MontajTipi.Smt),

            ("STMicroelectronics", "L5973D013TR",  "Buck (Düşürücü)", 1.235m, 2m, 36m, 250m, 90m, "SO-8", MontajTipi.Smt),
            ("STMicroelectronics", "L7987TR",      "Buck (Düşürücü)", 0.8m, 3m, 61m, 1_000m, 92m, "HTSSOP-16", MontajTipi.Smt),
            ("STMicroelectronics", "ST1S10PHR",    "Buck (Düşürücü)", 0.8m, 3m, 18m, 900m, 95m, "DFN-8", MontajTipi.Smt),
            ("STMicroelectronics", "LM2596S-ADJ",  "Buck (Düşürücü)", 1.23m, 3m, 40m, 150m, 80m, "TO-263-5", MontajTipi.Smt),

            ("Infineon Technologies", "IRS2153DSPBF", "Yarı Köprü Sürücü", 0m, 0m, 600m, 100m, 0m, "SOIC-8", MontajTipi.Smt),
            ("Analog Devices", "LT8610AEMSE#PBF",  "Buck (Düşürücü)", 0.97m, 2.5m, 42m, 2_200m, 93m, "MSOP-16", MontajTipi.Smt),
            ("Analog Devices", "LTC3105EMS#PBF",   "Boost (Yükseltici)", 1.5m, 0.4m, 5.5m, 1_000m, 87m, "MSOP-12", MontajTipi.Smt)
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("topoloji", x.Topoloji),
                new("cikis_voltaji", x.Volt > 0m ? $"{ParcaKodlama.AnlamliBasamak(x.Volt, 4)} V (ayarlanabilir taban)" : "—", x.Volt > 0m ? x.Volt : null),
                new("giris_voltaji_max", $"{ParcaKodlama.AnlamliBasamak(x.GirisMax, 4)} V", x.GirisMax),
                new("kilif", x.Kilif)
            };

            if (x.Akim > 0m)
                ozellikler.Insert(2, new ParcaOzelligi("cikis_akimi", $"{ParcaKodlama.AnlamliBasamak(x.Akim, 3)} A", x.Akim));

            if (x.FreqKhz > 0m)
                ozellikler.Add(new ParcaOzelligi("frekans", $"{ParcaKodlama.AnlamliBasamak(x.FreqKhz / 1000m, 4)} MHz", x.FreqKhz / 1000m));

            if (x.Verim > 0m)
                ozellikler.Add(new ParcaOzelligi("verim", $"%{ParcaKodlama.AnlamliBasamak(x.Verim, 3)}", x.Verim));

            yield return new HamParca(
                "anahtarlamali-regulatorler", x.Uretici, x.Mpn,
                $"IC REG {x.Topoloji} {ParcaKodlama.AnlamliBasamak(x.Akim, 3)}A {ParcaKodlama.AnlamliBasamak(x.GirisMax, 4)}V {x.Kilif}",
                x.Montaj, ozellikler);
        }
    }

    // -----------------------------------------------------------------------
    // Gerilim referansları
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> GerilimReferanslari()
    {
        (string Uretici, string Mpn, decimal Volt, string Dogruluk, decimal Tempco, string Kilif, MontajTipi Montaj)[] liste =
        [
            ("Texas Instruments", "TL431ACLPR",   2.495m, "±%0.5", 50m, "TO-92", MontajTipi.Tht),
            ("Texas Instruments", "TL431AIDBZR",  2.495m, "±%0.5", 50m, "SOT-23-3", MontajTipi.Smt),
            ("Texas Instruments", "TL431BIDBZR",  2.495m, "±%0.4", 50m, "SOT-23-3", MontajTipi.Smt),
            ("Texas Instruments", "TL431IDR",     2.495m, "±%2", 50m, "SOIC-8", MontajTipi.Smt),
            ("Texas Instruments", "TL432AIDBZR",  2.495m, "±%0.5", 50m, "SOT-23-3", MontajTipi.Smt),
            ("Texas Instruments", "LM4040A25IDBZR", 2.5m, "±%0.1", 15m, "SOT-23-3", MontajTipi.Smt),
            ("Texas Instruments", "LM4040D30IDBZR", 3.0m, "±%1", 100m, "SOT-23-3", MontajTipi.Smt),
            ("Texas Instruments", "LM4040C41IDBZR", 4.096m, "±%0.5", 100m, "SOT-23-3", MontajTipi.Smt),
            ("Texas Instruments", "LM4041CILPR",  1.225m, "±%0.5", 100m, "TO-92", MontajTipi.Tht),
            ("Texas Instruments", "REF3025AIDBZR", 2.5m, "±%0.2", 30m, "SOT-23-3", MontajTipi.Smt),
            ("Texas Instruments", "REF3033AIDBZR", 3.3m, "±%0.2", 30m, "SOT-23-3", MontajTipi.Smt),
            ("Texas Instruments", "REF5025AIDR",  2.5m, "±%0.05", 8m, "SOIC-8", MontajTipi.Smt),
            ("Texas Instruments", "LM336Z-2.5/NOPB", 2.49m, "±%2", 80m, "TO-92", MontajTipi.Tht),
            ("Texas Instruments", "LM385BLP-1-2/NOPB", 1.235m, "±%1", 20m, "TO-92", MontajTipi.Tht),

            ("Analog Devices", "ADR4525BRZ",   2.5m, "±%0.02", 2m, "SOIC-8", MontajTipi.Smt),
            ("Analog Devices", "ADR4533BRZ",   3.3m, "±%0.02", 2m, "SOIC-8", MontajTipi.Smt),
            ("Analog Devices", "ADR5041BRTZ-R7", 2.5m, "±%0.1", 50m, "SOT-23-3", MontajTipi.Smt),
            ("Analog Devices", "LT1461ACS8-2.5#PBF", 2.5m, "±%0.04", 3m, "SOIC-8", MontajTipi.Smt),
            ("Analog Devices", "REF192GSZ",    2.5m, "±%0.4", 5m, "SOIC-8", MontajTipi.Smt),

            ("STMicroelectronics", "TL431ACZ",  2.495m, "±%0.5", 50m, "TO-92", MontajTipi.Tht),
            ("STMicroelectronics", "TS431AILT", 2.495m, "±%0.5", 50m, "SOT-23-3", MontajTipi.Smt),
            ("onsemi", "TL431ACLPG",  2.495m, "±%0.5", 50m, "TO-92", MontajTipi.Tht),
            ("onsemi", "NCP431ACSNT1G", 2.495m, "±%0.5", 50m, "TSOP-5", MontajTipi.Smt),
            ("Microchip Technology", "MCP1541-I/TO", 4.096m, "±%1", 50m, "TO-92", MontajTipi.Tht),
            ("Microchip Technology", "MCP1501-25E/CHY", 2.5m, "±%0.1", 10m, "SOT-23-6", MontajTipi.Smt),
            ("Diodes Incorporated", "AZ431AN-ATRE1", 2.495m, "±%0.5", 50m, "SOT-23-3", MontajTipi.Smt)
        ];

        return liste.Select(x => new HamParca(
            "gerilim-referanslari", x.Uretici, x.Mpn,
            $"IC REFERANS {ParcaKodlama.AnlamliBasamak(x.Volt, 5)}V {x.Dogruluk} {x.Kilif}",
            x.Montaj,
            [
                new("cikis_voltaji", $"{ParcaKodlama.AnlamliBasamak(x.Volt, 5)} V", x.Volt),
                new("dogruluk", x.Dogruluk),
                new("sicaklik_katsayisi", $"{ParcaKodlama.AnlamliBasamak(x.Tempco, 3)} ppm/°C", x.Tempco),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", Sicaklik)
            ]));
    }

    // -----------------------------------------------------------------------
    // Motor sürücüler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> MotorSuruculer()
    {
        (string Uretici, string Mpn, string Tip, decimal Akim, decimal GirisMax, int Kanal, string Arayuz, string Kilif, MontajTipi Montaj)[] liste =
        [
            ("STMicroelectronics", "L293D",       "DC Motor / H-Köprü", 0.6m, 36m, 2, "Paralel", "PDIP-16", MontajTipi.Tht),
            ("STMicroelectronics", "L293DD013TR", "DC Motor / H-Köprü", 0.6m, 36m, 2, "Paralel", "SOIC-20", MontajTipi.Smt),
            ("STMicroelectronics", "L298N",       "DC / Step Motor", 2m, 46m, 2, "Paralel", "Multiwatt-15", MontajTipi.Tht),
            ("STMicroelectronics", "L6203",       "DC Motor / H-Köprü", 5m, 48m, 1, "Paralel", "Multiwatt-11", MontajTipi.Tht),
            ("STMicroelectronics", "L6234PD013TR","BLDC Motor", 5m, 52m, 3, "Paralel", "PowerSO-20", MontajTipi.Smt),
            ("STMicroelectronics", "L6470H",      "Step Motor", 3m, 45m, 1, "SPI", "HTSSOP-28", MontajTipi.Smt),
            ("STMicroelectronics", "L6474PD",     "Step Motor", 3m, 45m, 1, "SPI", "PowerSO-36", MontajTipi.Smt),

            ("Texas Instruments", "DRV8825PWPR",  "Step Motor", 2.5m, 45m, 1, "Adım / Yön", "HTSSOP-28", MontajTipi.Smt),
            ("Texas Instruments", "DRV8824PWPR",  "Step Motor", 1.6m, 45m, 1, "Adım / Yön", "HTSSOP-28", MontajTipi.Smt),
            ("Texas Instruments", "DRV8833PWPR",  "DC Motor / H-Köprü", 1.5m, 10.8m, 2, "PWM", "HTSSOP-16", MontajTipi.Smt),
            ("Texas Instruments", "DRV8871DDAR",  "DC Motor / H-Köprü", 3.6m, 45m, 1, "PWM", "SO-8 PowerPAD", MontajTipi.Smt),
            ("Texas Instruments", "DRV8874PWPR",  "DC Motor / H-Köprü", 6m, 37m, 1, "PWM", "HTSSOP-16", MontajTipi.Smt),
            ("Texas Instruments", "DRV8301DCAR",  "BLDC Ön Sürücü", 1.7m, 60m, 3, "SPI", "HTSSOP-56", MontajTipi.Smt),
            ("Texas Instruments", "DRV8302DCAR",  "BLDC Ön Sürücü", 1.7m, 60m, 3, "Paralel", "HTSSOP-56", MontajTipi.Smt),
            ("Texas Instruments", "DRV8313PWPR",  "BLDC Motor", 2.5m, 60m, 3, "PWM", "HTSSOP-28", MontajTipi.Smt),
            ("Texas Instruments", "DRV8434SRGER", "Step Motor", 2.5m, 48m, 1, "SPI", "VQFN-24", MontajTipi.Smt),

            ("Allegro MicroSystems", "A4988SETTR-T", "Step Motor", 2m, 35m, 1, "Adım / Yön", "TSSOP-28 EP", MontajTipi.Smt),
            ("Allegro MicroSystems", "A4988SETTR",   "Step Motor", 2m, 35m, 1, "Adım / Yön", "TSSOP-28 EP", MontajTipi.Smt),
            ("Allegro MicroSystems", "A4950ELJTR-T", "DC Motor / H-Köprü", 3.5m, 40m, 1, "PWM", "SOIC-8 EP", MontajTipi.Smt),

            ("Toshiba", "TB6612FNG,C,8,EL", "DC Motor / H-Köprü", 1.2m, 13.5m, 2, "PWM", "SSOP-24", MontajTipi.Smt),
            ("Toshiba", "TB67S109AFTG,EL",  "Step Motor", 4m, 47m, 1, "Adım / Yön", "HTSSOP-48", MontajTipi.Smt),
            ("Toshiba", "TB6600HG",         "Step Motor", 5m, 50m, 1, "Adım / Yön", "HZIP-25", MontajTipi.Tht),

            ("Monolithic Power Systems", "MP6500GU-Z", "Step Motor", 2.5m, 35m, 1, "Adım / Yön", "QFN-24", MontajTipi.Smt),
            ("Monolithic Power Systems", "MP6515GG-Z", "DC Motor / H-Köprü", 1.5m, 35m, 1, "PWM", "TSSOP-16", MontajTipi.Smt),
            ("onsemi", "NCV7708BDWR2G", "Çoklu H-Köprü", 0.9m, 40m, 6, "SPI", "SOIC-24", MontajTipi.Smt),
            ("Infineon Technologies", "BTN8982TAAUMA1", "DC Motor / Yarı Köprü", 55m, 40m, 1, "PWM", "TO-263-7", MontajTipi.Smt)
        ];

        return liste.Select(x => new HamParca(
            "motor-suruculer", x.Uretici, x.Mpn,
            $"IC MOTOR SÜRÜCÜ {x.Tip} {ParcaKodlama.AnlamliBasamak(x.Akim, 3)}A {ParcaKodlama.AnlamliBasamak(x.GirisMax, 4)}V {x.Kilif}",
            x.Montaj,
            [
                new("sensor_tipi", x.Tip),
                new("cikis_akimi", $"{ParcaKodlama.AnlamliBasamak(x.Akim, 3)} A", x.Akim),
                new("giris_voltaji_max", $"{ParcaKodlama.AnlamliBasamak(x.GirisMax, 4)} V", x.GirisMax),
                new("kanal_sayisi", x.Kanal.ToString(), x.Kanal),
                new("arayuz", x.Arayuz),
                new("kilif", x.Kilif)
            ]));
    }

    // -----------------------------------------------------------------------
    // Gate sürücüler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> GateSuruculer()
    {
        (string Uretici, string Mpn, int Kanal, decimal Akim, decimal GirisMax, string Izolasyon, string Kilif, MontajTipi Montaj)[] liste =
        [
            ("Infineon Technologies", "IR2110PBF",     2, 2m, 500m, "İzolesiz (Bootstrap)", "PDIP-14", MontajTipi.Tht),
            ("Infineon Technologies", "IR2110STRPBF",  2, 2m, 500m, "İzolesiz (Bootstrap)", "SOIC-16", MontajTipi.Smt),
            ("Infineon Technologies", "IR2104STRPBF",  2, 0.13m, 600m, "İzolesiz (Bootstrap)", "SOIC-8", MontajTipi.Smt),
            ("Infineon Technologies", "IR2184STRPBF",  2, 1.4m, 600m, "İzolesiz (Bootstrap)", "SOIC-8", MontajTipi.Smt),
            ("Infineon Technologies", "IRS2186STRPBF", 2, 4m, 600m, "İzolesiz (Bootstrap)", "SOIC-8", MontajTipi.Smt),
            ("Infineon Technologies", "IR2117STRPBF",  1, 0.29m, 600m, "İzolesiz (Bootstrap)", "SOIC-8", MontajTipi.Smt),
            ("Infineon Technologies", "1EDN8511BXTSA1",1, 5m, 20m, "İzolesiz", "SOT-23-6", MontajTipi.Smt),

            ("Texas Instruments", "UCC27524DR",   2, 5m, 18m, "İzolesiz", "SOIC-8", MontajTipi.Smt),
            ("Texas Instruments", "UCC27517DBVR", 1, 4m, 18m, "İzolesiz", "SOT-23-5", MontajTipi.Smt),
            ("Texas Instruments", "UCC21520DW",   2, 4m, 25m, "5700 Vrms Galvanik", "SOIC-16", MontajTipi.Smt),
            ("Texas Instruments", "UCC23513DWY",  1, 4.5m, 33m, "3535 Vrms Optik", "SOIC-6", MontajTipi.Smt),
            ("Texas Instruments", "LM5109BMA/NOPB",2, 1m, 100m, "İzolesiz (Bootstrap)", "SOIC-8", MontajTipi.Smt),
            ("Texas Instruments", "TC4427ACOA",   2, 1.5m, 18m, "İzolesiz", "SOIC-8", MontajTipi.Smt),
            ("Texas Instruments", "TC4420CPA",    1, 6m, 18m, "İzolesiz", "PDIP-8", MontajTipi.Tht),

            ("Microchip Technology", "MCP1407-E/SN", 1, 6m, 18m, "İzolesiz", "SOIC-8", MontajTipi.Smt),
            ("Microchip Technology", "TC4427AEOA",   2, 1.5m, 18m, "İzolesiz", "SOIC-8", MontajTipi.Smt),
            ("Microchip Technology", "MIC4451YN",    1, 12m, 18m, "İzolesiz", "PDIP-8", MontajTipi.Tht),

            ("onsemi", "NCP81074BDR2G",   1, 10m, 20m, "İzolesiz", "SOIC-8", MontajTipi.Smt),
            ("onsemi", "FAN7392MX",       2, 4.5m, 600m, "İzolesiz (Bootstrap)", "SOIC-16", MontajTipi.Smt),
            ("Analog Devices", "ADUM4121ARIZ", 1, 2m, 35m, "5000 Vrms Galvanik", "SOIC-16", MontajTipi.Smt),
            ("Analog Devices", "LTC4440ES6#TRMPBF", 1, 1.5m, 80m, "İzolesiz (Bootstrap)", "SOT-23-6", MontajTipi.Smt),
            ("Silicon Labs", "SI8271GB-IS", 1, 4m, 30m, "2500 Vrms Galvanik", "SOIC-8", MontajTipi.Smt),
            ("STMicroelectronics", "L6387ED013TR", 2, 0.65m, 600m, "İzolesiz (Bootstrap)", "SOIC-8", MontajTipi.Smt)
        ];

        return liste.Select(x => new HamParca(
            "gate-suruculer", x.Uretici, x.Mpn,
            $"IC GATE SÜRÜCÜ {x.Kanal}CH {ParcaKodlama.AnlamliBasamak(x.Akim, 3)}A {ParcaKodlama.AnlamliBasamak(x.GirisMax, 4)}V {x.Kilif}",
            x.Montaj,
            [
                new("kanal_sayisi", x.Kanal.ToString(), x.Kanal),
                new("cikis_akimi", $"{ParcaKodlama.AnlamliBasamak(x.Akim, 3)} A", x.Akim),
                new("giris_voltaji_max", $"{ParcaKodlama.AnlamliBasamak(x.GirisMax, 4)} V", x.GirisMax),
                new("izolasyon", x.Izolasyon),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", Sicaklik)
            ]));
    }

    // -----------------------------------------------------------------------
    // Pil şarj entegreleri
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> PilSarjEntegreleri()
    {
        (string Uretici, string Mpn, string Kimya, decimal Akim, decimal GirisMax, string Arayuz, string Kilif)[] liste =
        [
            ("Microchip Technology", "MCP73831T-2ACI/OT", "Li-Ion / Li-Po", 0.5m, 6m, "Direnç ile ayarlı", "SOT-23-5"),
            ("Microchip Technology", "MCP73831T-2ATI/OT", "Li-Ion / Li-Po", 0.5m, 6m, "Direnç ile ayarlı", "SOT-23-5"),
            ("Microchip Technology", "MCP73832T-2ACI/OT", "Li-Ion / Li-Po", 0.5m, 6m, "Direnç ile ayarlı", "SOT-23-5"),
            ("Microchip Technology", "MCP73833-AMI/UN",   "Li-Ion / Li-Po", 1m, 6m, "Direnç ile ayarlı", "MSOP-10"),
            ("Microchip Technology", "MCP73871-2CCI/ML",  "Li-Ion / Li-Po", 1m, 6m, "Güç yolu yönetimli", "QFN-20"),

            ("Texas Instruments", "BQ24074RGTR",   "Li-Ion / Li-Po", 1.5m, 28m, "Direnç ile ayarlı", "VQFN-16"),
            ("Texas Instruments", "BQ24295RGER",   "Li-Ion / Li-Po", 3m, 17m, "I2C", "VQFN-24"),
            ("Texas Instruments", "BQ25896RTWR",   "Li-Ion / Li-Po", 3.25m, 14m, "I2C", "VQFN-24"),
            ("Texas Instruments", "BQ21040DBVR",   "Li-Ion / Li-Po", 0.8m, 28m, "Direnç ile ayarlı", "SOT-23-6"),
            ("Texas Instruments", "BQ25570RGRR",   "Enerji Hasadı", 0.11m, 5.5m, "Direnç ile ayarlı", "VQFN-20"),
            ("Texas Instruments", "BQ27441DRZR-G1A","Li-Ion Yakıt Ölçer", 0m, 4.5m, "I2C", "SON-12"),

            ("Analog Devices", "LTC4054ES5-4.2#TRMPBF", "Li-Ion / Li-Po", 0.8m, 6.5m, "Direnç ile ayarlı", "TSOT-23-5"),
            ("Analog Devices", "LTC4162IUFD-LADM#PBF",  "Li-Ion / Li-Po", 3.2m, 35m, "I2C", "QFN-28"),
            ("Analog Devices", "MAX1555EZK+T",          "Li-Ion / Li-Po", 0.28m, 7m, "Otomatik", "SOT-23-5"),
            ("Analog Devices", "MAX17048G+T10",         "Li-Ion Yakıt Ölçer", 0m, 4.5m, "I2C", "TDFN-8"),

            ("Monolithic Power Systems", "MP2636GR-Z", "Li-Ion / Li-Po", 2m, 6m, "I2C", "QFN-24"),
            ("Monolithic Power Systems", "MP26123DR-LF-Z", "Li-Ion / Li-Po", 2m, 28m, "Direnç ile ayarlı", "SOIC-16"),
            ("STMicroelectronics", "STBC08PMR",  "Li-Ion / Li-Po", 0.8m, 6.5m, "Direnç ile ayarlı", "DFN-6"),
            ("STMicroelectronics", "STNS01PUR",  "Li-Ion / Li-Po", 0.5m, 6m, "Entegre LDO'lu", "QFN-16"),
            ("Richtek", "RT9525GJ5",  "Li-Ion / Li-Po", 0.8m, 6.5m, "Direnç ile ayarlı", "SOT-23-5"),
            ("onsemi", "NCP1854FCCT1G", "Li-Ion / Li-Po", 1.5m, 6.5m, "I2C", "WLCSP-25")
        ];

        return liste.Select(x => new HamParca(
            "pil-sarj-entegreleri", x.Uretici, x.Mpn,
            $"IC PIL ŞARJ {x.Kimya} {ParcaKodlama.AnlamliBasamak(x.Akim, 3)}A {x.Kilif}",
            MontajTipi.Smt,
            [
                new("pil_kimyasi", x.Kimya),
                new("cikis_akimi", $"{ParcaKodlama.AnlamliBasamak(x.Akim, 3)} A", x.Akim),
                new("giris_voltaji_max", $"{ParcaKodlama.AnlamliBasamak(x.GirisMax, 4)} V", x.GirisMax),
                new("arayuz", x.Arayuz),
                new("kilif", x.Kilif)
            ]));
    }
}
