using Cevik.Alan.Fiyatlama;

namespace Cevik.Alan.Kurallar;

/// <summary>
/// "Çok alırsan az ödersin" kademeli fiyat seçimi.
///
/// Kademeler [MinMiktar, MaxMiktar] aralıklarıdır; MaxMiktar null ise üst sınır yoktur.
/// Doğru kademe, miktarı KAPSAYAN kademedir — "miktar >= MinMiktar olan sonuncusu" değil.
/// Aradaki fark, aralıklarda boşluk veya çakışma olduğunda ortaya çıkar.
/// </summary>
public static class FiyatKademesiSecici
{
    /// <summary>
    /// Verilen miktar ve müşteri grubu için geçerli kademeyi döndürür.
    /// Müşteri grubuna özel fiyat varsa liste fiyatının önüne geçer.
    /// </summary>
    public static FiyatKademesi? Sec(
        IEnumerable<FiyatKademesi> kademeler,
        int miktar,
        int? musteriGrubuId = null,
        DateTimeOffset? anItibariyla = null)
    {
        var an = anItibariyla ?? DateTimeOffset.UtcNow;

        var uygunlar = kademeler
            .Where(k => GecerlilikUygun(k, an))
            .Where(k => k.MusteriGrubuId == null || k.MusteriGrubuId == musteriGrubuId)
            .Where(k => miktar >= k.MinMiktar && (k.MaxMiktar == null || miktar <= k.MaxMiktar))
            .ToList();

        if (uygunlar.Count == 0)
        {
            // Miktar hiçbir aralığa girmiyorsa (ör. kademeler 1-49 / 50-249 iken miktar 500
            // ve açık uçlu kademe yoksa) en yüksek MinMiktar'lı kademeye düş.
            return kademeler
                .Where(k => GecerlilikUygun(k, an))
                .Where(k => k.MusteriGrubuId == null || k.MusteriGrubuId == musteriGrubuId)
                .Where(k => miktar >= k.MinMiktar)
                .OrderByDescending(k => k.MinMiktar)
                .FirstOrDefault();
        }

        // Müşteri grubuna özel kademe, genel liste fiyatını ezer; eşitlikte ucuz olan kazanır.
        return uygunlar
            .OrderByDescending(k => k.MusteriGrubuId.HasValue)
            .ThenBy(k => k.BirimFiyat)
            .First();
    }

    private static bool GecerlilikUygun(FiyatKademesi k, DateTimeOffset an)
        => (k.GecerlilikBaslangic is null || k.GecerlilikBaslangic <= an)
        && (k.GecerlilikBitis is null || k.GecerlilikBitis >= an);
}
