using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Katalog;

/// <summary>
/// Katalogun ana tablosu. Fiyat ve stok burada DEĞİL — onlar
/// <see cref="UrunAmbalajlari"/> altındadır, çünkü aynı ürünün
/// Tape&amp;Reel / Tube / Tray varyantları farklı fiyat ve stoğa sahiptir.
/// </summary>
public class Urun : VarlikTabaniUzun
{
    public int UreticiId { get; set; }
    public Uretici Uretici { get; set; } = null!;

    /// <summary>Her zaman yaprak kategori.</summary>
    public int KategoriId { get; set; }
    public Kategori Kategori { get; set; } = null!;

    /// <summary>MPN — üretici ürün kodu. Örn: STM32F103C8T6</summary>
    public required string UreticiUrunKodu { get; set; }

    /// <summary>
    /// Aramada kullanılan hâli: boşluk/tire/nokta temizlenmiş, büyük harf.
    /// "STM32F1" araması bunun üzerinden trigram ile çalışır.
    /// </summary>
    public required string NormalizeKod { get; set; }

    /// <summary>"IC-32F103C MCU 32BIT 64KB FLASH 48LQFP"</summary>
    public required string KisaAciklama { get; set; }

    public string? DetayliAciklamaTr { get; set; }
    public string? DetayliAciklamaEn { get; set; }

    public string? AnaGorselUrl { get; set; }

    /// <summary>Sitedeki "*Bu ürün görseli temsilidir" uyarısı.</summary>
    public bool GorselTemsiliMi { get; set; }

    public UrunDurumu UrunDurumu { get; set; } = UrunDurumu.Aktif;
    public RohsDurumu RohsDurumu { get; set; } = RohsDurumu.Bilinmiyor;
    public MontajTipi MontajTipi { get; set; } = MontajTipi.Yok;

    /// <summary>"5-6 Hafta" → 5</summary>
    public short? UreticiTeslimSuresiHaftaMin { get; set; }
    /// <summary>"5-6 Hafta" → 6</summary>
    public short? UreticiTeslimSuresiHaftaMax { get; set; }

    /// <summary>Filtre hızı için denormalize edilmiş bayrak.</summary>
    public bool KampanyaliMi { get; set; }

    /// <summary>
    /// Parametrik değerlerin JSONB okuma kopyası:
    /// {"bit_sayisi": "32 Bit", "frekans": 72, "kilif": "LQFP48 (7x7mm)"}
    /// Ürün detay sayfası bunu tek satırda okur, JOIN atmaz.
    /// Filtreleme ise <see cref="OzellikDegerleri"/> üzerinden yapılır.
    /// </summary>
    public string OzelliklerJson { get; set; } = "{}";

    public int GoruntulenmeSayisi { get; set; }
    public bool Aktif { get; set; } = true;

    public ICollection<UrunAmbalaji> UrunAmbalajlari { get; set; } = [];
    public ICollection<UrunOzellikDegeri> OzellikDegerleri { get; set; } = [];
    public ICollection<UrunGorseli> Gorseller { get; set; } = [];
    public ICollection<UrunDokumani> Dokumanlar { get; set; } = [];
    
    public ICollection<IliskiliUrun> IliskiliUrunler { get; set; } = [];
}
