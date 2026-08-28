using System.IO.Compression;
using System.Text.Json;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog;

/// <summary>
/// Özdisan ürün listelemelerinden alınan ve sürümlenerek projeye gömülen katalog anlık görüntüsü.
/// Canlı site uygulama çalışırken taranmaz; veri yalnızca araç betiği açıkça çalıştırıldığında yenilenir.
/// </summary>
public static class OzdisanKatalogu
{
    private const string KaynakAdi =
        "Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar.ozdisan-katalogu.json.gz";

    private static readonly Lazy<OzdisanKatalogVerisi> Veri = new(Yukle);

    public static OzdisanKatalogVerisi Guncel => Veri.Value;

    private static OzdisanKatalogVerisi Yukle()
    {
        using var kaynak = typeof(OzdisanKatalogu).Assembly.GetManifestResourceStream(KaynakAdi)
            ?? throw new InvalidOperationException($"Gömülü Özdisan katalogu bulunamadı: {KaynakAdi}");
        using var gzip = new GZipStream(kaynak, CompressionMode.Decompress);

        var katalog = JsonSerializer.Deserialize<OzdisanKatalogVerisi>(gzip)
            ?? throw new InvalidOperationException("Özdisan katalog anlık görüntüsü okunamadı.");

        // Sayaç ile listenin tutarlılığı bozulmuş anlık görüntüyü yakalar.
        // Sabit 12.000 beklentisi KALDIRILDI: tools/bos-kategorileri-doldur.mjs
        // boş kategorileri doldurmak için mevcut anlık görüntüye ürün EKLİYOR,
        // eşitlik koşulu her eklemede uygulamayı açılışta düşürüyordu. Alt
        // sınır kırpılmış veya yarım inen dosyayı yine de yakalar.
        if (katalog.UrunSayisi != katalog.Urunler.Count)
            throw new InvalidOperationException(
                $"Özdisan katalog sayacı listeyle uyuşmuyor: {katalog.UrunSayisi} beyan, {katalog.Urunler.Count} kayıt.");

        if (katalog.UrunSayisi < 12_000)
            throw new InvalidOperationException(
                $"Özdisan katalogu eksik görünüyor: en az 12000 ürün beklenir, bulunan {katalog.Urunler.Count}.");

        if (katalog.UreticiSayisi < 50 || katalog.Urunler.Select(u => u.UreticiAd).Distinct().Count() < 50)
            throw new InvalidOperationException("Özdisan katalogunda en az 50 üretici bulunmalıdır.");

        return katalog;
    }
}

public sealed class OzdisanKatalogVerisi
{
    public required string Surum { get; init; }
    public required string Kaynak { get; init; }
    public DateTimeOffset OlusturmaTarihi { get; init; }
    public int UrunSayisi { get; init; }
    public int UreticiSayisi { get; init; }
    public List<OzdisanUrunKaydi> Urunler { get; init; } = [];
}

public sealed class OzdisanUrunKaydi
{
    public required string KaynakKimligi { get; init; }
    public string? KaynakUrl { get; init; }
    public required string KaynakKategori { get; init; }
    public required string KategoriSlug { get; init; }
    public required string UreticiAd { get; init; }
    public string? UreticiSlug { get; init; }
    public string? UreticiLogoUrl { get; init; }
    public required string Mpn { get; init; }
    public required string Aciklama { get; init; }
    public required string Montaj { get; init; }
    public bool Rohs { get; init; }
    public string? AnaGorselUrl { get; init; }
    public string? PdfUrl { get; init; }
    public Dictionary<string, string> Ozellikler { get; init; } = [];
    public required OzdisanAmbalajKaydi Ambalaj { get; init; }
}

public sealed class OzdisanAmbalajKaydi
{
    public required string Ad { get; init; }
    public required string Tip { get; init; }
    public int Mpq { get; init; }
    public int Moq { get; init; }
    public int KatlamaMiktari { get; init; }
    public int StokMiktari { get; init; }
    public List<OzdisanFiyatKaydi> Fiyatlar { get; init; } = [];
}

public sealed class OzdisanFiyatKaydi
{
    public int MinMiktar { get; init; }
    public int? MaxMiktar { get; init; }
    public decimal BirimFiyat { get; init; }
    public required string ParaBirimi { get; init; }
}
