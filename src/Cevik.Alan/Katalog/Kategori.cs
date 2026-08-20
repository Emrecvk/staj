using Cevik.Alan.Ortak;

namespace Cevik.Alan.Katalog;

/// <summary>
/// Kendine referans veren çok seviyeli kategori ağacı.
/// <see cref="Yol"/> alanı PostgreSQL <c>ltree</c> tipindedir: "1.9.52.218" gibi.
/// Alt ağaç sorgusu recursive CTE yerine tek GiST index taramasıyla çözülür.
/// </summary>
public class Kategori : VarlikTabaniInt
{
    public int? UstKategoriId { get; set; }
    public Kategori? UstKategori { get; set; }
    public ICollection<Kategori> AltKategoriler { get; set; } = [];

    public required string AdTr { get; set; }
    public required string AdEn { get; set; }

    /// <summary>URL: /c/elektronik-komponentler-1</summary>
    public required string SlugTr { get; set; }
    public required string SlugEn { get; set; }

    /// <summary>ltree yolu — "1.9.52.218". Kök kategoride kendi id'si.</summary>
    public required string Yol { get; set; }

    /// <summary>0 = kök.</summary>
    public short Seviye { get; set; }

    /// <summary>Menüde gösterim sırası.</summary>
    public int Sira { get; set; }

    public string? IkonUrl { get; set; }
    public string? GorselUrl { get; set; }

    /// <summary>Yaprak kategorilerde parametrik filtre paneli açılır.</summary>
    public bool YaprakMi { get; set; }

    public string? SeoBaslik { get; set; }
    public string? SeoAciklama { get; set; }

    /// <summary>Kategori altındaki uzun anlatım metni (CMS'ten yönetilir).</summary>
    public string? SeoIcerikHtml { get; set; }

    public bool Aktif { get; set; } = true;

    public ICollection<KategoriOzelligi> KategoriOzellikleri { get; set; } = [];
    public ICollection<Urun> Urunler { get; set; } = [];
}
