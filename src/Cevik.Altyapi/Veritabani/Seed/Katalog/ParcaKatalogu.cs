using Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog;

/// <summary>
/// Tüm parça kaynaklarını tek bir listede toplar, tekilleştirir ve tutarlılığını doğrular.
///
/// Doğrulama sessizce atlamaz, hata fırlatır: bir parçanın kategorisi veya üreticisi
/// katalogda tanımlı değilse ya da bir parametre kodu sözlükte yoksa seed başlamadan
/// patlar. Önceki seed bu durumları <c>continue</c> ile geçiyordu ve sonuç, sessizce
/// eksik parametreyle kaydedilmiş ürünlerdi.
/// </summary>
public static class ParcaKatalogu
{
    public static IReadOnlyList<HamParca> Tumu { get; } = Topla();

    private static IReadOnlyList<HamParca> Topla()
    {
        IEnumerable<HamParca> hepsi =
        [
            .. DirencKaynagi.Uret(),
            .. KondansatorKaynagi.Uret(),
            .. BobinKristalKaynagi.Uret(),
            .. LojikKaynagi.Uret(),
            .. YariIletkenKaynagi.Uret(),
            .. GucYonetimiKaynagi.Uret(),
            .. AyrikKaynagi.Uret(),
            .. OptoKaynagi.Uret(),
            .. ElektromekanikKaynagi.Uret(),
            .. SensorKaynagi.Uret(),
            .. RfKaynagi.Uret(),
            .. KorumaKaynagi.Uret(),
            .. GucUrunleriKaynagi.Uret(),
            .. KartMekanikKaynagi.Uret()
        ];

        // (üretici, MPN) çifti üründe UNIQUE index'lidir; aynı çift iki kez gelirse
        // seed veritabanı hatasıyla değil burada, anlaşılır biçimde durmalı.
        var gorulen = new HashSet<(string, string)>();
        var sonuc = new List<HamParca>();

        foreach (var parca in hepsi)
        {
            if (gorulen.Add((parca.UreticiAd, parca.Mpn)))
                sonuc.Add(parca);
        }

        return sonuc;
    }

    /// <summary>
    /// Katalogun kategori ağacı, üretici listesi ve parametre sözlüğüyle uyumunu doğrular.
    /// Uyumsuzluk bulursa açıklayıcı mesajlarla döner; boş liste "her şey tutarlı" demektir.
    /// </summary>
    public static IReadOnlyList<string> Dogrula()
    {
        var hatalar = new List<string>();

        var yaprakSluglar = KatalogSablonlari.Agac
            .SelectMany(k => k.Altlar)
            .Select(a => a.Slug)
            .ToHashSet(StringComparer.Ordinal);

        var ureticiAdlari = UreticiKatalogu.Hepsi
            .Select(u => u.Ad)
            .ToHashSet(StringComparer.Ordinal);

        var ozellikKodlari = KatalogSablonlari.Ozellikler
            .Select(o => o.Kod)
            .ToHashSet(StringComparer.Ordinal);

        foreach (var parca in Tumu)
        {
            if (!yaprakSluglar.Contains(parca.KategoriSlug))
                hatalar.Add($"{parca.Mpn}: '{parca.KategoriSlug}' diye bir yaprak kategori yok.");

            if (!ureticiAdlari.Contains(parca.UreticiAd))
                hatalar.Add($"{parca.Mpn}: '{parca.UreticiAd}' üretici katalogunda yok.");

            foreach (var ozellik in parca.Ozellikler)
            {
                if (!ozellikKodlari.Contains(ozellik.Kod))
                    hatalar.Add($"{parca.Mpn}: '{ozellik.Kod}' parametre sözlüğünde yok.");
            }
        }

        // Boş kalan yaprak kategori, menüde tıklanınca boş liste gösterir — bu bir kusurdur.
        var doluSluglar = Tumu.Select(p => p.KategoriSlug).ToHashSet(StringComparer.Ordinal);
        foreach (var slug in yaprakSluglar.Where(s => !doluSluglar.Contains(s)))
            hatalar.Add($"'{slug}' yaprak kategorisinde hiç ürün yok.");

        return hatalar;
    }
}
