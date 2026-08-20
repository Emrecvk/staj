namespace Cevik.Alan.Katalog;

/// <summary>
/// Hangi kategoride hangi filtrelerin görüneceği.
/// Bir kategori sayfasının facet listesi DOĞRUDAN bu tablodan üretilir.
/// Bileşik anahtar: (KategoriId, OzellikTanimId).
/// </summary>
public class KategoriOzelligi
{
    public int KategoriId { get; set; }
    public Kategori Kategori { get; set; } = null!;

    public int OzellikTanimId { get; set; }
    public OzellikTanimi OzellikTanim { get; set; } = null!;

    /// <summary>Filtre panelindeki sıra.</summary>
    public int Sira { get; set; }

    /// <summary>Bu kategoride ürün eklenirken bu özellik zorunlu mu?</summary>
    public bool ZorunluMu { get; set; }
}
