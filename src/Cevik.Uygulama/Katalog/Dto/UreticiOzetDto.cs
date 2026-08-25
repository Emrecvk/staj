namespace Cevik.Uygulama.Katalog.Dto;

/// <summary>
/// Anasayfa marka vitrini ve üretici filtresi için hafif üretici özeti.
/// UrunSayisi gerçek sayımdır (soft-delete filtresi uygulanmış); uydurma
/// sayı göstermek yerine yalnızca ürünü olan üreticiler döndürülür.
/// </summary>
public class UreticiOzetDto
{
    public int Id { get; set; }
    public required string Ad { get; set; }
    public required string Slug { get; set; }
    public string? LogoUrl { get; set; }
    public string? WebSitesi { get; set; }
    public bool YetkiliDistributorMu { get; set; }
    public int UrunSayisi { get; set; }
}
