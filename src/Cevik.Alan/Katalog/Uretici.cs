using Cevik.Alan.Ortak;

namespace Cevik.Alan.Katalog;

public class Uretici : VarlikTabaniInt
{
    public required string Ad { get; set; }
    public required string Slug { get; set; }
    public string? LogoUrl { get; set; }
    public string? WebSitesi { get; set; }
    public string? Aciklama { get; set; }

    /// <summary>Yetkili distribütörlük rozeti ürün kartında gösterilir.</summary>
    public bool YetkiliDistributorMu { get; set; }

    public bool Aktif { get; set; } = true;

    public ICollection<Urun> Urunler { get; set; } = [];
}
