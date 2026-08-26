using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Güç kaynağı ürünleri — AC-DC kaynaklar, DIN ray kaynakları, DC-DC modüller,
/// piller ve pil tutucular.
///
/// MEAN WELL sipariş kodu doğrudan (seri, güç, çıkış voltajı) üçlüsüdür — LRS-350-24 =
/// LRS serisi, 350 W, 24 V — ve üretici bu kademeleri seri seri listeler. Ancak her
/// güç her voltajda üretilmez (LRS-350'nin 3.3 V sürümü yoktur), bu yüzden voltaj
/// listesi güç bazında ayrı yazılır; tek bir çapraz çarpım var olmayan model üretirdi.
/// </summary>
public static class GucUrunleriKaynagi
{
    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in AcDcKaynaklar()) yield return p;
        foreach (var p in DinRayKaynaklar()) yield return p;
        foreach (var p in DcDcModuller()) yield return p;
        foreach (var p in PillerVeTutucular()) yield return p;
    }

    // -----------------------------------------------------------------------
    // AC-DC güç kaynakları
    // -----------------------------------------------------------------------

    /// <summary>Bir MEAN WELL serisinin güç kademesi ve o kademede üretilen çıkış voltajları.</summary>
    private sealed record MeanWellKademe(decimal Watt, decimal[] Voltajlar);

    private static IEnumerable<HamParca> AcDcKaynaklar()
    {
        // RS serisi — kapalı kasa, tek çıkış.
        MeanWellKademe[] rs =
        [
            new(15m, [3.3m, 5m, 12m, 15m, 24m, 48m]),
            new(25m, [3.3m, 5m, 12m, 15m, 24m, 48m]),
            new(35m, [3.3m, 5m, 12m, 15m, 24m, 48m]),
            new(50m, [3.3m, 5m, 12m, 15m, 24m, 48m]),
            new(75m, [5m, 12m, 15m, 24m, 48m]),
            new(100m, [5m, 12m, 15m, 24m, 48m]),
            new(150m, [5m, 12m, 15m, 24m, 48m])
        ];

        foreach (var p in MeanWell("RS", rs, "Kapalı Kasa AC-DC", "IP20", "99 x 82 x 30 mm")) yield return p;

        // LRS serisi — ince kasa, yüksek verim.
        MeanWellKademe[] lrs =
        [
            new(35m, [3.3m, 5m, 12m, 15m, 24m, 36m, 48m]),
            new(50m, [3.3m, 5m, 12m, 15m, 24m, 36m, 48m]),
            new(75m, [5m, 12m, 15m, 24m, 36m, 48m]),
            new(100m, [5m, 12m, 15m, 24m, 36m, 48m]),
            new(150m, [5m, 12m, 15m, 24m, 36m, 48m]),
            new(200m, [5m, 12m, 15m, 24m, 36m, 48m]),
            new(350m, [5m, 12m, 15m, 24m, 36m, 48m])
        ];

        foreach (var p in MeanWell("LRS", lrs, "İnce Kasa AC-DC", "IP20", "215 x 115 x 30 mm")) yield return p;

        // NES serisi — ekonomik kapalı kasa.
        MeanWellKademe[] nes =
        [
            new(15m, [5m, 12m, 15m, 24m]),
            new(25m, [5m, 12m, 15m, 24m]),
            new(35m, [5m, 12m, 15m, 24m, 48m]),
            new(50m, [5m, 12m, 15m, 24m, 48m]),
            new(75m, [5m, 12m, 15m, 24m, 48m]),
            new(100m, [5m, 12m, 15m, 24m, 48m]),
            new(150m, [5m, 12m, 15m, 24m, 48m]),
            new(350m, [5m, 12m, 15m, 24m, 48m])
        ];

        foreach (var p in MeanWell("NES", nes, "Kapalı Kasa AC-DC", "IP20", "199 x 98 x 38 mm")) yield return p;

        // IRM serisi — kart üstü (PCB) AC-DC modül.
        MeanWellKademe[] irm =
        [
            new(5m, [3.3m, 5m, 12m, 15m, 24m]),
            new(10m, [3.3m, 5m, 12m, 15m, 24m]),
            new(20m, [5m, 12m, 15m, 24m]),
            new(60m, [12m, 15m, 24m, 48m])
        ];

        foreach (var kademe in irm)
        foreach (var volt in kademe.Voltajlar)
        {
            yield return AcDc("MEAN WELL", $"IRM-{kademe.Watt:00}-{VoltKodu(volt)}",
                "Kart Üstü (PCB) AC-DC Modül", kademe.Watt, volt, 82m, "IP20", "Kart Üstü Modül");
        }
    }

    private static IEnumerable<HamParca> MeanWell(
        string seri, MeanWellKademe[] kademeler, string tip, string ip, string boyut)
    {
        foreach (var kademe in kademeler)
        foreach (var volt in kademe.Voltajlar)
        {
            // Verim güç ve voltajla artar; küçük/düşük voltajlı modellerde daha düşüktür.
            var verim = (kademe.Watt, volt) switch
            {
                ( < 50m, < 12m) => 78m,
                ( < 50m, _) => 84m,
                ( < 150m, < 12m) => 82m,
                ( < 150m, _) => 88m,
                (_, < 12m) => 85m,
                _ => 90m
            };

            yield return AcDc("MEAN WELL", $"{seri}-{kademe.Watt:0}-{VoltKodu(volt)}",
                tip, kademe.Watt, volt, verim, ip, boyut);
        }
    }

    /// <summary>MEAN WELL çıkış voltajı soneki: 3.3 V -> "3.3", 24 V -> "24".</summary>
    private static string VoltKodu(decimal volt) => ParcaKodlama.AnlamliBasamak(volt, 3);

    private static HamParca AcDc(
        string uretici, string mpn, string tip, decimal watt, decimal volt,
        decimal verim, string ip, string boyut)
    {
        var akim = Math.Round(watt / volt, 2);

        return new HamParca(
            tip.Contains("DIN", StringComparison.Ordinal) ? "din-ray-guc-kaynaklari" : "ac-dc-guc-kaynaklari",
            uretici, mpn,
            $"GÜÇ KAYNAĞI {ParcaKodlama.AnlamliBasamak(watt, 4)}W {ParcaKodlama.AnlamliBasamak(volt, 3)}V {ParcaKodlama.AnlamliBasamak(akim, 4)}A {tip}",
            MontajTipi.Yok,
            [
                new("cikis_gucu_w", $"{ParcaKodlama.AnlamliBasamak(watt, 4)} W", watt),
                new("cikis_voltaji", $"{ParcaKodlama.AnlamliBasamak(volt, 3)} V", volt),
                new("cikis_akimi", $"{ParcaKodlama.AnlamliBasamak(akim, 4)} A", akim),
                new("giris_voltaji", "85 - 264 VAC / 120 - 370 VDC"),
                new("verim", $"%{ParcaKodlama.AnlamliBasamak(verim, 3)}", verim),
                new("ip_sinifi", ip),
                new("boyutlar", boyut)
            ]);
    }

    // -----------------------------------------------------------------------
    // DIN ray güç kaynakları
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> DinRayKaynaklar()
    {
        MeanWellKademe[] dr =
        [
            new(15m, [5m, 12m, 15m, 24m]),
            new(30m, [5m, 12m, 15m, 24m]),
            new(45m, [12m, 15m, 24m]),
            new(60m, [12m, 15m, 24m]),
            new(75m, [12m, 15m, 24m, 48m]),
            new(120m, [12m, 24m, 48m])
        ];

        foreach (var kademe in dr)
        foreach (var volt in kademe.Voltajlar)
        {
            yield return DinRay("MEAN WELL", $"DR-{kademe.Watt:0}-{VoltKodu(volt)}",
                kademe.Watt, volt, kademe.Watt < 60m ? 84m : 88m, "DIN Ray TS-35 / 78 mm genişlik");
        }

        MeanWellKademe[] hdr =
        [
            new(15m, [5m, 12m, 15m, 24m]),
            new(30m, [5m, 12m, 15m, 24m, 48m]),
            new(60m, [12m, 15m, 24m, 48m]),
            new(100m, [12m, 15m, 24m, 48m]),
            new(150m, [12m, 24m, 48m])
        ];

        foreach (var kademe in hdr)
        foreach (var volt in kademe.Voltajlar)
        {
            yield return DinRay("MEAN WELL", $"HDR-{kademe.Watt:0}-{VoltKodu(volt)}",
                kademe.Watt, volt, kademe.Watt < 60m ? 87m : 90m, "DIN Ray TS-35 / Ultra İnce");
        }

        (string Uretici, string Mpn, decimal Watt, decimal Volt, decimal Verim, string Boyut)[] ekler =
        [
            ("Phoenix Contact", "2904375", 60m, 24m, 91m, "DIN Ray TS-35 / 45 mm genişlik"),
            ("Phoenix Contact", "2904376", 100m, 24m, 92m, "DIN Ray TS-35 / 55 mm genişlik"),
            ("Phoenix Contact", "2903153", 120m, 24m, 93m, "DIN Ray TS-35 / 60 mm genişlik"),
            ("Weidmüller", "1469480000", 60m, 24m, 90m, "DIN Ray TS-35 / 40 mm genişlik"),
            ("Weidmüller", "1469490000", 120m, 24m, 92m, "DIN Ray TS-35 / 55 mm genişlik"),
            ("Traco Power", "TBL 060-124", 60m, 24m, 89m, "DIN Ray TS-35 / 55 mm genişlik"),
            ("Traco Power", "TBL 090-124", 90m, 24m, 90m, "DIN Ray TS-35 / 65 mm genişlik"),
            ("Delta Electronics", "DRP-024V060W1AA", 60m, 24m, 90m, "DIN Ray TS-35 / 40 mm genişlik"),
            ("Delta Electronics", "DRP024V120W1BA", 120m, 24m, 92m, "DIN Ray TS-35 / 60 mm genişlik"),
            ("XP Power", "DNR60US24", 60m, 24m, 89m, "DIN Ray TS-35 / 55 mm genişlik")
        ];

        foreach (var e in ekler)
            yield return DinRay(e.Uretici, e.Mpn, e.Watt, e.Volt, e.Verim, e.Boyut);
    }

    private static HamParca DinRay(
        string uretici, string mpn, decimal watt, decimal volt, decimal verim, string boyut)
    {
        var akim = Math.Round(watt / volt, 2);

        return new HamParca(
            "din-ray-guc-kaynaklari", uretici, mpn,
            $"DIN RAY GÜÇ KAYNAĞI {ParcaKodlama.AnlamliBasamak(watt, 4)}W {ParcaKodlama.AnlamliBasamak(volt, 3)}V {ParcaKodlama.AnlamliBasamak(akim, 4)}A",
            MontajTipi.Yok,
            [
                new("cikis_gucu_w", $"{ParcaKodlama.AnlamliBasamak(watt, 4)} W", watt),
                new("cikis_voltaji", $"{ParcaKodlama.AnlamliBasamak(volt, 3)} V", volt),
                new("cikis_akimi", $"{ParcaKodlama.AnlamliBasamak(akim, 4)} A", akim),
                new("giris_voltaji", "85 - 264 VAC / 120 - 370 VDC"),
                new("verim", $"%{ParcaKodlama.AnlamliBasamak(verim, 3)}", verim),
                new("boyutlar", boyut)
            ]);
    }

    // -----------------------------------------------------------------------
    // DC-DC konvertör modülleri
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> DcDcModuller()
    {
        // RECOM R-78E — izolesiz anahtarlamalı regülatör, 7805 pin uyumlu.
        (string Kod, decimal Volt)[] r78e = [("3.3", 3.3m), ("5.0", 5.0m), ("6.5", 6.5m), ("9.0", 9.0m), ("12", 12m), ("15", 15m)];

        foreach (var (kod, volt) in r78e)
        {
            yield return DcDc("RECOM Power", $"R-78E{kod}-0.5", "Buck (İzolesiz)",
                Math.Round(volt * 0.5m, 2), volt, 0.5m, "7 - 28 VDC", "İzolesiz", 92m);

            yield return DcDc("RECOM Power", $"R-78B{kod}-1.0", "Buck (İzolesiz)",
                Math.Round(volt * 1.0m, 2), volt, 1.0m, "9 - 32 VDC", "İzolesiz", 93m);
        }

        // Traco TSR 1 — 24 V girişli izolesiz seri; sonek çıkış voltajını kodlar.
        (string Kod, decimal Volt)[] tsr = [("18", 1.8m), ("25", 2.5m), ("33", 3.3m), ("50", 5.0m), ("12", 12m), ("15", 15m)];

        foreach (var (kod, volt) in tsr)
        {
            yield return DcDc("Traco Power", $"TSR 1-24{kod}", "Buck (İzolesiz)",
                Math.Round(volt * 1.0m, 2), volt, 1.0m, "4.75 - 36 VDC", "İzolesiz", 94m);
        }

        (string Uretici, string Mpn, string Topoloji, decimal Watt, decimal Volt, decimal Akim, string Giris, string Izolasyon, decimal Verim)[] liste =
        [
            ("RECOM Power", "RAC05-05SK", "AC-DC Modül", 5m, 5m, 1.0m, "85 - 264 VAC", "3000 VAC İzoleli", 78m),
            ("RECOM Power", "RAC10-12SK", "AC-DC Modül", 10m, 12m, 0.83m, "85 - 264 VAC", "3000 VAC İzoleli", 82m),
            ("RECOM Power", "RAC20-24SK", "AC-DC Modül", 20m, 24m, 0.83m, "85 - 264 VAC", "3000 VAC İzoleli", 85m),
            ("RECOM Power", "RB-0505S", "İzoleli DC-DC", 1m, 5m, 0.2m, "4.5 - 5.5 VDC", "1000 VDC İzoleli", 78m),
            ("RECOM Power", "RKZ-0505S", "İzoleli DC-DC", 2m, 5m, 0.4m, "4.5 - 5.5 VDC", "3000 VDC İzoleli", 80m),
            ("RECOM Power", "RS3-2405S", "İzoleli DC-DC", 3m, 5m, 0.6m, "18 - 36 VDC", "1600 VDC İzoleli", 81m),
            ("RECOM Power", "REC5-2412SRWZ/H", "İzoleli DC-DC", 5m, 12m, 0.42m, "9 - 36 VDC", "1600 VDC İzoleli", 84m),
            ("RECOM Power", "RP15-2412SFW", "İzoleli DC-DC", 15m, 12m, 1.25m, "9 - 36 VDC", "1600 VDC İzoleli", 87m),

            ("Traco Power", "TMR 3-2411", "İzoleli DC-DC", 3m, 5m, 0.6m, "18 - 36 VDC", "1500 VDC İzoleli", 82m),
            ("Traco Power", "TMR 3-2412", "İzoleli DC-DC", 3m, 12m, 0.25m, "18 - 36 VDC", "1500 VDC İzoleli", 84m),
            ("Traco Power", "TMR 6-2411", "İzoleli DC-DC", 6m, 5m, 1.2m, "18 - 36 VDC", "1500 VDC İzoleli", 85m),
            ("Traco Power", "TEN 5-2411", "İzoleli DC-DC", 5m, 5m, 1.0m, "18 - 36 VDC", "1500 VDC İzoleli", 84m),
            ("Traco Power", "THN 15-2411WIR", "İzoleli DC-DC", 15m, 5m, 3.0m, "9 - 36 VDC", "1500 VDC İzoleli", 88m),
            ("Traco Power", "TDR 3-2411WI", "İzoleli DC-DC", 3m, 5m, 0.6m, "9 - 36 VDC", "1500 VDC İzoleli", 83m),
            ("Traco Power", "TSR 2-2450", "Buck (İzolesiz)", 10m, 5m, 2.0m, "6.5 - 36 VDC", "İzolesiz", 95m),

            ("XP Power", "IA0505S", "İzoleli DC-DC", 1m, 5m, 0.2m, "4.5 - 5.5 VDC", "1000 VDC İzoleli", 77m),
            ("XP Power", "IH0505S", "İzoleli DC-DC", 2m, 5m, 0.4m, "4.5 - 5.5 VDC", "3000 VDC İzoleli", 80m),
            ("XP Power", "JCA0624S03", "İzoleli DC-DC", 6m, 3.3m, 1.8m, "9 - 36 VDC", "1500 VDC İzoleli", 84m),
            ("XP Power", "ITQ2424S15", "İzoleli DC-DC", 15m, 24m, 0.63m, "9 - 36 VDC", "1500 VDC İzoleli", 87m),

            ("CUI Inc", "PDQE15-Q24-S12-D", "İzoleli DC-DC", 15m, 12m, 1.25m, "9 - 36 VDC", "1500 VDC İzoleli", 88m),
            ("CUI Inc", "PQMC10-D24-S5-M", "İzoleli DC-DC", 10m, 5m, 2.0m, "9 - 36 VDC", "1500 VDC İzoleli", 86m),
            ("Delta Electronics", "E48SC12020NRFA", "İzoleli DC-DC", 24m, 12m, 2.0m, "36 - 75 VDC", "1500 VDC İzoleli", 90m),
            ("Murata", "OKI-78SR-5/1.5-W36-C", "Buck (İzolesiz)", 7.5m, 5m, 1.5m, "7 - 36 VDC", "İzolesiz", 94m),
            ("Murata", "OKI-78SR-3.3/1.5-W36-C", "Buck (İzolesiz)", 5m, 3.3m, 1.5m, "7 - 36 VDC", "İzolesiz", 93m),
            ("Bel Fuse", "0RCD-025A-4L", "Buck (İzolesiz)", 25m, 5m, 5.0m, "8 - 42 VDC", "İzolesiz", 95m)
        ];

        foreach (var x in liste)
            yield return DcDc(x.Uretici, x.Mpn, x.Topoloji, x.Watt, x.Volt, x.Akim, x.Giris, x.Izolasyon, x.Verim);
    }

    private static HamParca DcDc(
        string uretici, string mpn, string topoloji, decimal watt, decimal volt,
        decimal akim, string giris, string izolasyon, decimal verim) =>
        new(
            "dc-dc-konvertor-modulleri", uretici, mpn,
            $"DC-DC MODÜL {ParcaKodlama.AnlamliBasamak(watt, 4)}W {ParcaKodlama.AnlamliBasamak(volt, 3)}V {ParcaKodlama.AnlamliBasamak(akim, 3)}A {topoloji}",
            MontajTipi.Tht,
            [
                new("topoloji", topoloji),
                new("cikis_gucu_w", $"{ParcaKodlama.AnlamliBasamak(watt, 4)} W", watt),
                new("cikis_voltaji", $"{ParcaKodlama.AnlamliBasamak(volt, 3)} V", volt),
                new("cikis_akimi", $"{ParcaKodlama.AnlamliBasamak(akim, 3)} A", akim),
                new("giris_voltaji", giris),
                new("izolasyon", izolasyon),
                new("verim", $"%{ParcaKodlama.AnlamliBasamak(verim, 3)}", verim)
            ]);

    // -----------------------------------------------------------------------
    // Piller ve tutucular
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> PillerVeTutucular()
    {
        (string Uretici, string Mpn, string Kimya, string Boyut, decimal Volt, decimal Mah, string Montaj)[] piller =
        [
            ("Panasonic", "CR2032", "Lityum Manganez Dioksit", "CR2032 (20 mm düğme)", 3m, 225m, "Tutucuya Takmalı"),
            ("Panasonic", "CR2025", "Lityum Manganez Dioksit", "CR2025 (20 mm düğme)", 3m, 165m, "Tutucuya Takmalı"),
            ("Panasonic", "CR2016", "Lityum Manganez Dioksit", "CR2016 (20 mm düğme)", 3m, 90m, "Tutucuya Takmalı"),
            ("Panasonic", "CR1220", "Lityum Manganez Dioksit", "CR1220 (12 mm düğme)", 3m, 35m, "Tutucuya Takmalı"),
            ("Panasonic", "CR1632", "Lityum Manganez Dioksit", "CR1632 (16 mm düğme)", 3m, 140m, "Tutucuya Takmalı"),
            ("Panasonic", "BR2032", "Lityum Karbon Monoflorür", "BR2032 (20 mm düğme)", 3m, 190m, "Tutucuya Takmalı"),
            ("Panasonic", "CR-2/3AZ", "Lityum Manganez Dioksit", "2/3A Silindirik", 3m, 1_450m, "Tutucuya Takmalı"),
            ("Panasonic", "CR123A", "Lityum Manganez Dioksit", "CR123A Silindirik", 3m, 1_550m, "Tutucuya Takmalı"),
            ("Panasonic", "CR2032/VCN", "Lityum (Lehimlenebilir Bacaklı)", "CR2032 (20 mm düğme)", 3m, 225m, "Delikli Montaj"),

            ("Varta", "CR2032", "Lityum Manganez Dioksit", "CR2032 (20 mm düğme)", 3m, 230m, "Tutucuya Takmalı"),
            ("Varta", "CR1632", "Lityum Manganez Dioksit", "CR1632 (16 mm düğme)", 3m, 135m, "Tutucuya Takmalı"),
            ("Varta", "6F22", "Çinko Karbon", "9 V Blok", 9m, 400m, "Klipsli"),
            ("Varta", "CR2450", "Lityum Manganez Dioksit", "CR2450 (24 mm düğme)", 3m, 620m, "Tutucuya Takmalı"),

            ("EVE Energy", "ER14505", "Lityum Tiyonil Klorür", "AA Silindirik", 3.6m, 2_700m, "Tutucuya Takmalı"),
            ("EVE Energy", "ER14250", "Lityum Tiyonil Klorür", "1/2 AA Silindirik", 3.6m, 1_200m, "Tutucuya Takmalı"),
            ("EVE Energy", "ER34615", "Lityum Tiyonil Klorür", "D Silindirik", 3.6m, 19_000m, "Tutucuya Takmalı"),
            ("EVE Energy", "ER18505", "Lityum Tiyonil Klorür", "A Silindirik", 3.6m, 4_000m, "Tutucuya Takmalı")
        ];

        foreach (var p in piller)
        {
            yield return new HamParca(
                "piller-tutucular", p.Uretici, p.Mpn,
                $"PIL {p.Kimya} {p.Boyut} {ParcaKodlama.AnlamliBasamak(p.Volt, 3)}V {p.Mah:N0}mAh",
                p.Montaj == "Delikli Montaj" ? MontajTipi.Tht : MontajTipi.Yok,
                [
                    new("pil_kimyasi", p.Kimya),
                    new("pil_boyutu", p.Boyut),
                    new("voltaj_derecesi", $"{ParcaKodlama.AnlamliBasamak(p.Volt, 3)} V", p.Volt),
                    new("kapasite_mah", $"{p.Mah:N0} mAh", p.Mah),
                    new("montaj_sekli", p.Montaj)
                ]);
        }

        (string Uretici, string Mpn, string Boyut, string Montaj)[] tutucular =
        [
            ("Keystone Electronics", "3000", "CR2032 / 20 mm düğme", "Yüzey Montaj"),
            ("Keystone Electronics", "3002", "CR2032 / 20 mm düğme", "Delikli Montaj"),
            ("Keystone Electronics", "1058", "AA Silindirik", "Delikli Montaj"),
            ("Keystone Electronics", "1042", "AAA Silindirik", "Delikli Montaj"),
            ("Keystone Electronics", "2460", "9 V Blok (Klips)", "Kablolu"),
            ("Keystone Electronics", "3034", "CR2450 / 24 mm düğme", "Yüzey Montaj"),
            ("Keystone Electronics", "2996", "CR1220 / 12 mm düğme", "Yüzey Montaj"),
            ("Keystone Electronics", "1024", "AA Silindirik (2'li)", "Delikli Montaj"),
            ("Würth Elektronik", "7770045", "CR2032 / 20 mm düğme", "Yüzey Montaj"),
            ("Würth Elektronik", "7770004", "CR2032 / 20 mm düğme", "Delikli Montaj"),
            ("Molex", "0510500900", "CR2032 / 20 mm düğme", "Yüzey Montaj"),
            ("TE Connectivity", "1932401-1", "CR2032 / 20 mm düğme", "Yüzey Montaj")
        ];

        foreach (var t in tutucular)
        {
            yield return new HamParca(
                "piller-tutucular", t.Uretici, t.Mpn,
                $"PIL TUTUCU {t.Boyut} {t.Montaj}",
                t.Montaj == "Yüzey Montaj" ? MontajTipi.Smt
                    : t.Montaj == "Delikli Montaj" ? MontajTipi.Tht
                    : MontajTipi.Yok,
                [
                    new("pil_kimyasi", "Tutucu (pil dahil değil)"),
                    new("pil_boyutu", t.Boyut),
                    new("montaj_sekli", t.Montaj)
                ]);
        }
    }
}
