using System.Collections.Generic;

namespace Cevik.Uygulama.Katalog.Dto;

public class UrunOzetDto
{
    public long Id { get; set; }
    public int KategoriId { get; set; }
    public int UreticiId { get; set; }
    public required string UreticiUrunKodu { get; set; }
    public required string UreticiAd { get; set; }
    public required string KisaAciklama { get; set; }
    public string? AnaGorselUrl { get; set; }
    public bool GorselTemsiliMi { get; set; }
    public int ToplamStok { get; set; }
    public decimal BaslangicFiyati { get; set; }
    public string ParaBirimi { get; set; } = "USD";
    public bool KampanyaliMi { get; set; }
    public string? UrunDurumu { get; set; }
    public string? RohsDurumu { get; set; }
    public string? Kilif { get; set; }
    public List<DokumanListeDto> Dokumanlar { get; set; } = new();
    public List<AmbalajListeDto> AmbalajlarVeFiyatlar { get; set; } = new();
}

public class DokumanListeDto
{
    public short Tip { get; set; }
    public required string Url { get; set; }
    public required string Baslik { get; set; }
    public int? DosyaBoyutuKb { get; set; }
    public string? Dil { get; set; }
}

public class AmbalajListeDto
{
    public long AmbalajId { get; set; }
    public required string Ad { get; set; }
    public short AmbalajTipi { get; set; }
    public int Mpq { get; set; }
    public int Moq { get; set; }
    public int KatlamaMiktari { get; set; }
    public int StokMiktari { get; set; }
    public List<FiyatKademesiDto> Fiyatlar { get; set; } = new();
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
