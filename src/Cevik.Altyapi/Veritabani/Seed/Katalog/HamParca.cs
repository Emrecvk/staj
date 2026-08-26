using System.Globalization;
using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog;

/// <summary>
/// Seed katalogunun atomik birimi: TEK bir gerçek üretici parça numarası (MPN)
/// ve o parçanın teknik parametreleri.
///
/// Önceki seed, MPN'i rastgele üretiyordu ("STM32F" + rastgele rakam/harf), bu yüzden
/// katalogdaki hiçbir kod gerçekte var olan bir parçaya karşılık gelmiyordu; üstelik
/// parametreler koddan bağımsız seçildiği için kod ile teknik değerler birbirini tutmuyordu.
///
/// Artık iki kaynak var, ikisi de gerçek:
///  1. <b>Şemadan türetilenler</b> — pasif komponentlerin parça numarası, üreticinin
///     yayımladığı kodlama şemasının birebir uygulanmasıyla üretilir. Örn. Yageo:
///     RC | 0603 | F(±%1) | R-07 | 10K | L  =>  RC0603FR-0710KL. Bu kombinasyonlar
///     üreticinin katalogunda zaten böyle listelenir; değer serileri (E24/E96/E12)
///     ve kılıf-değer sınırları gerçek fiziksel sınırlardan alınmıştır.
///  2. <b>Küratörlü olanlar</b> — yarı iletkenler ve modüller kombinatoryal değildir
///     (STM32F103C8T6 gerçek, STM32F847K3T6 değil), bu yüzden elle yazılmış gerçek
///     parça listelerinden gelir.
///
/// Her iki durumda da <see cref="Ozellikler"/> MPN'den TÜRETİLİR, ayrıca rastgele
/// seçilmez. "10K" kodlu direncin direnç değeri 10 kΩ'dur.
/// </summary>
/// <param name="KategoriSlug">Bağlanacağı yaprak kategorinin slug'ı (KatalogSablonlari.Agac).</param>
/// <param name="UreticiAd">UreticiKatalogu içindeki marka adı — birebir eşleşmeli.</param>
/// <param name="Mpn">Üretici parça numarası.</param>
/// <param name="Aciklama">"RES SMD 10K OHM ±%1 1/10W 0603" tarzı teknik kısa açıklama.</param>
/// <param name="Montaj">SMT / THT / Yok.</param>
/// <param name="Ozellikler">Parametre listesi.</param>
public sealed record HamParca(
    string KategoriSlug,
    string UreticiAd,
    string Mpn,
    string Aciklama,
    MontajTipi Montaj,
    IReadOnlyList<ParcaOzelligi> Ozellikler);

/// <summary>
/// Tek bir parametre değeri.
///
/// <paramref name="Sayi"/> ayrı tutulur çünkü gösterilen metinden sayı çıkarmak
/// ölçek bilgisini kaybettiriyor: "100 nF" ve "100 pF" metinden okunduğunda ikisi de
/// 100 olur ve aralık filtresi 100 pF'yi 100 nF ile aynı yere koyar. Bu yüzden sayısal
/// parametrelerde değer, <see cref="KatalogSablonlari.Ozellikler"/> içinde o parametre
/// için ilan edilen TABAN BİRİM cinsinden ayrıca verilir (kapasitans → µF,
/// endüktans → µH, direnç → Ω).
/// </summary>
/// <param name="Kod">KatalogSablonlari.Ozellikler içindeki parametre kodu.</param>
/// <param name="Deger">Kullanıcıya gösterilen metin: "100 nF", "±%1", "LQFP48".</param>
/// <param name="Sayi">Filtre ve sıralama için taban birimdeki sayısal karşılık.</param>
public sealed record ParcaOzelligi(string Kod, string Deger, decimal? Sayi = null);

/// <summary>
/// Üreticilerin parça numarası kodlama şemalarında kullanılan ortak dönüşümler.
///
/// Bu sınıf "gerçeğe benzeyen" değil, gerçek kodları üretir: E-serileri EIA'nın
/// standart mantis dizileridir, direnç/kapasitans kodlamaları da üretici
/// datasheet'lerindeki sipariş kodu tablolarının uygulanmasıdır.
/// </summary>
public static class ParcaKodlama
{
    // ---------------------------------------------------------------------
    // EIA standart değer serileri (IEC 60063)
    // ---------------------------------------------------------------------

    /// <summary>±%20 serisi.</summary>
    public static readonly decimal[] E6 = [1.0m, 1.5m, 2.2m, 3.3m, 4.7m, 6.8m];

    /// <summary>±%10 serisi.</summary>
    public static readonly decimal[] E12 =
        [1.0m, 1.2m, 1.5m, 1.8m, 2.2m, 2.7m, 3.3m, 3.9m, 4.7m, 5.6m, 6.8m, 8.2m];

    /// <summary>±%5 serisi.</summary>
    public static readonly decimal[] E24 =
    [
        1.0m, 1.1m, 1.2m, 1.3m, 1.5m, 1.6m, 1.8m, 2.0m, 2.2m, 2.4m, 2.7m, 3.0m,
        3.3m, 3.6m, 3.9m, 4.3m, 4.7m, 5.1m, 5.6m, 6.2m, 6.8m, 7.5m, 8.2m, 9.1m
    ];

    /// <summary>±%1 serisi — 96 mantis.</summary>
    public static readonly decimal[] E96 =
    [
        1.00m, 1.02m, 1.05m, 1.07m, 1.10m, 1.13m, 1.15m, 1.18m, 1.21m, 1.24m, 1.27m, 1.30m,
        1.33m, 1.37m, 1.40m, 1.43m, 1.47m, 1.50m, 1.54m, 1.58m, 1.62m, 1.65m, 1.69m, 1.74m,
        1.78m, 1.82m, 1.87m, 1.91m, 1.96m, 2.00m, 2.05m, 2.10m, 2.15m, 2.21m, 2.26m, 2.32m,
        2.37m, 2.43m, 2.49m, 2.55m, 2.61m, 2.67m, 2.74m, 2.80m, 2.87m, 2.94m, 3.01m, 3.09m,
        3.16m, 3.24m, 3.32m, 3.40m, 3.48m, 3.57m, 3.65m, 3.74m, 3.83m, 3.92m, 4.02m, 4.12m,
        4.22m, 4.32m, 4.42m, 4.53m, 4.64m, 4.75m, 4.87m, 4.99m, 5.11m, 5.23m, 5.36m, 5.49m,
        5.62m, 5.76m, 5.90m, 6.04m, 6.19m, 6.34m, 6.49m, 6.65m, 6.81m, 6.98m, 7.15m, 7.32m,
        7.50m, 7.68m, 7.87m, 8.06m, 8.25m, 8.45m, 8.66m, 8.87m, 9.09m, 9.31m, 9.53m, 9.76m
    ];

    /// <summary>
    /// Bir mantis dizisini verilen ondalık aralığa yayar.
    /// <c>Yay(E24, 0, 6)</c> => 1 Ω … 9.1 MΩ arası tüm E24 değerleri.
    /// </summary>
    public static IEnumerable<decimal> Yay(decimal[] mantisler, int enKucukUs, int enBuyukUs)
    {
        for (var us = enKucukUs; us <= enBuyukUs; us++)
        {
            var carpan = (decimal)Math.Pow(10, us);
            foreach (var m in mantisler)
                yield return m * carpan;
        }
    }

    // ---------------------------------------------------------------------
    // Sayı biçimleme
    // ---------------------------------------------------------------------

    /// <summary>
    /// Değeri verilen anlamlı basamak sayısına yuvarlar ve gereksiz sıfırları atar.
    /// 4.7 / 2 => "4.7", 100 / 2 => "100", 4.75 / 3 => "4.75".
    /// </summary>
    public static string AnlamliBasamak(decimal deger, int basamak)
    {
        if (deger == 0m) return "0";

        var buyukluk = (int)Math.Floor(Math.Log10((double)deger));
        var ondalik = Math.Clamp(basamak - 1 - buyukluk, 0, 20);
        var yuvarlanmis = Math.Round(deger, ondalik, MidpointRounding.AwayFromZero);

        return yuvarlanmis.ToString("0.####################", CultureInfo.InvariantCulture);
    }

    /// <summary>
    /// Çarpan harfinin ondalık ayracın yerine geçtiği gösterim.
    /// Yageo, Bourns ve Vishay'in direnç değeri kodlaması budur:
    /// 4700 Ω => "4K7", 10000 Ω => "10K", 100 Ω => "100R", 1 MΩ => "1M".
    /// </summary>
    public static string HarfliDirencKodu(decimal ohm, int basamak)
    {
        if (ohm == 0m) return "0R";

        var (bolen, harf) = ohm switch
        {
            >= 1_000_000m => (1_000_000m, 'M'),
            >= 1_000m => (1_000m, 'K'),
            _ => (1m, 'R')
        };

        var metin = AnlamliBasamak(ohm / bolen, basamak);
        var nokta = metin.IndexOf('.');

        return nokta < 0
            ? metin + harf
            : string.Concat(metin.AsSpan(0, nokta), harf.ToString(), metin.AsSpan(nokta + 1));
    }

    /// <summary>
    /// Vishay CRCW serisinin sabit 4 karakterli değer kodu:
    /// 10 kΩ => "10K0", 4.7 kΩ => "4K70", 100 Ω => "100R", 1 MΩ => "1M00", 0 Ω => "0000".
    /// </summary>
    public static string VishayDirencKodu(decimal ohm)
    {
        if (ohm == 0m) return "0000";

        var temel = HarfliDirencKodu(ohm, 3);
        return temel.Length >= 4 ? temel : temel.PadRight(4, '0');
    }

    /// <summary>
    /// EIA 4 haneli direnç kodu (±%1 serileri — Panasonic ERJ, KOA RK73H):
    /// 3 anlamlı basamak + çarpan üssü. 10 kΩ => "1002", 4.75 kΩ => "4751".
    /// 100 Ω altındaki değerlerde ondalık ayraç olarak "R" kullanılır: 10 Ω => "10R0".
    /// </summary>
    public static string EiaDortHane(decimal ohm)
    {
        if (ohm == 0m) return "0000";
        if (ohm < 100m) return HarfliDirencKodu(ohm, 3).PadRight(4, '0');

        var us = 0;
        var deger = ohm;
        while (deger >= 1000m) { deger /= 10m; us++; }

        return Math.Round(deger, MidpointRounding.AwayFromZero).ToString("000", CultureInfo.InvariantCulture) + us;
    }

    /// <summary>
    /// EIA 3 haneli direnç kodu (±%5 serileri): 2 anlamlı basamak + çarpan üssü.
    /// 10 kΩ => "103", 4.7 kΩ => "472", 10 Ω => "100", 4.7 Ω => "4R7".
    /// </summary>
    public static string EiaUcHane(decimal ohm)
    {
        if (ohm == 0m) return "000";
        if (ohm < 10m) return HarfliDirencKodu(ohm, 2).PadRight(3, '0');

        var us = 0;
        var deger = ohm;
        while (deger >= 100m) { deger /= 10m; us++; }

        return Math.Round(deger, MidpointRounding.AwayFromZero).ToString("00", CultureInfo.InvariantCulture) + us;
    }

    /// <summary>
    /// Kondansatör değer kodu — pikofarad tabanlı 3 hane (EIA):
    /// 100 nF => "104", 10 µF => "106", 22 pF => "220", 2.2 pF => "2R2".
    /// </summary>
    public static string KapasitansKodu(decimal pikofarad)
    {
        if (pikofarad < 10m)
        {
            var m = AnlamliBasamak(pikofarad, 2);
            var n = m.IndexOf('.');
            var harfli = n < 0 ? m + "R" : string.Concat(m.AsSpan(0, n), "R", m.AsSpan(n + 1));
            return harfli.PadRight(3, '0');
        }

        var us = 0;
        var deger = pikofarad;
        while (deger >= 100m) { deger /= 10m; us++; }

        return Math.Round(deger, MidpointRounding.AwayFromZero).ToString("00", CultureInfo.InvariantCulture) + us;
    }

    // ---------------------------------------------------------------------
    // İnsan tarafından okunan birimler (açıklama ve parametre değerleri için)
    // ---------------------------------------------------------------------

    /// <summary>10000 Ω => "10 kΩ", 4700000 => "4.7 MΩ", 0.22 => "0.22 Ω".</summary>
    public static string DirencYazisi(decimal ohm) => ohm switch
    {
        0m => "0 Ω (Jumper)",
        >= 1_000_000m => $"{AnlamliBasamak(ohm / 1_000_000m, 4)} MΩ",
        >= 1_000m => $"{AnlamliBasamak(ohm / 1_000m, 4)} kΩ",
        _ => $"{AnlamliBasamak(ohm, 4)} Ω"
    };

    /// <summary>100000 pF => "100 nF", 10000000 => "10 µF", 22 => "22 pF".</summary>
    public static string KapasitansYazisi(decimal pikofarad) => pikofarad switch
    {
        >= 1_000_000m => $"{AnlamliBasamak(pikofarad / 1_000_000m, 4)} µF",
        >= 1_000m => $"{AnlamliBasamak(pikofarad / 1_000m, 4)} nF",
        _ => $"{AnlamliBasamak(pikofarad, 4)} pF"
    };

    /// <summary>0.0000001 H yerine nH/µH/mH yazımı. Giriş nanohenry.</summary>
    public static string EnduktansYazisi(decimal nanohenry) => nanohenry switch
    {
        >= 1_000_000m => $"{AnlamliBasamak(nanohenry / 1_000_000m, 4)} mH",
        >= 1_000m => $"{AnlamliBasamak(nanohenry / 1_000m, 4)} µH",
        _ => $"{AnlamliBasamak(nanohenry, 4)} nH"
    };

    /// <summary>Açıklamada kullanılan kısa direnç yazımı: "10K", "4.7M", "220R".</summary>
    public static string DirencKisa(decimal ohm) => ohm switch
    {
        0m => "0R",
        >= 1_000_000m => $"{AnlamliBasamak(ohm / 1_000_000m, 4)}M",
        >= 1_000m => $"{AnlamliBasamak(ohm / 1_000m, 4)}K",
        _ => $"{AnlamliBasamak(ohm, 4)}R"
    };
}
