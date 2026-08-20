using System.Collections.Generic;

namespace Cevik.Uygulama.Katalog.Dto;

public class UrunOzetDto
{
    public long Id { get; set; }
    public required string UreticiUrunKodu { get; set; }
    public required string UreticiAd { get; set; }
    public required string KisaAciklama { get; set; }
    public string? AnaGorselUrl { get; set; }
    public bool GorselTemsiliMi { get; set; }
    public int ToplamStok { get; set; }
    public decimal BaslangicFiyati { get; set; }
    public string ParaBirimi { get; set; } = "USD";
    public bool KampanyaliMi { get; set; }
}

public class PagedResultDto<T>
{
    public int SayfaNo { get; set; }
    public int SayfaBoyutu { get; set; }
    public int ToplamKayit { get; set; }
    public int ToplamSayfa => ToplamKayit == 0 ? 0 : (ToplamKayit + SayfaBoyutu - 1) / SayfaBoyutu;
    public List<T> Kayitlar { get; set; } = new();
}

public class UrunAramaSonucDto
{
    public PagedResultDto<UrunOzetDto> Urunler { get; set; } = new();
    public List<FacetGrupDto> Filtreler { get; set; } = new();
}
