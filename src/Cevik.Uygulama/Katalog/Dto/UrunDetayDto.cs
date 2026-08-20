using System.Collections.Generic;

namespace Cevik.Uygulama.Katalog.Dto;

public class UrunDetayDto
{
    public long Id { get; set; }
    public required string UreticiUrunKodu { get; set; }
    public required string UreticiAd { get; set; }
    public required string KisaAciklama { get; set; }
    public string? DetayliAciklama { get; set; }
    public List<string> GorselUrlleri { get; set; } = new();
    public bool GorselTemsiliMi { get; set; }
    
    public string? UrunDurumu { get; set; }
    public string? RohsDurumu { get; set; }
    public string? MontajTipi { get; set; }
    public string? UreticiTeslimSuresi { get; set; } // "5-6 Hafta"
    
    public List<DokumanDto> Dokumanlar { get; set; } = new();
    
    /// <summary>JsonB'den okunan property'ler dictionary'si</summary>
    public Dictionary<string, string> Ozellikler { get; set; } = new();
    
    public List<AmbalajFiyatDto> AmbalajlarVeFiyatlar { get; set; } = new();

    public List<IliskiliUrunOzetDto> Muadiller { get; set; } = new();
    public List<IliskiliUrunOzetDto> BenzerUrunler { get; set; } = new();
    public List<IliskiliUrunOzetDto> ParametrikUrunler { get; set; } = new();
    public List<IliskiliUrunOzetDto> BirlikteKullanilanlar { get; set; } = new();
}

public class DokumanDto
{
    public short Tip { get; set; } // enum
    public required string Url { get; set; }
    public required string Baslik { get; set; }
}

public class AmbalajFiyatDto
{
    public long AmbalajId { get; set; }
    public required string Ad { get; set; } // Tape&Reel vb.
    public int Mpq { get; set; }
    public int Moq { get; set; }
    public int KatlamaMiktari { get; set; }
    
    public int StokMiktari { get; set; }
    public int GelecekStokMiktari { get; set; }
    public string? GelecekStokTarihi { get; set; }
    
    public List<FiyatKademesiDto> Fiyatlar { get; set; } = new();
}

public class FiyatKademesiDto
{
    public int MinMiktar { get; set; }
    public int? MaxMiktar { get; set; }
    public decimal BirimFiyat { get; set; }
    public required string ParaBirimi { get; set; }
}

public class IliskiliUrunOzetDto
{
    public long Id { get; set; }
    public required string UreticiUrunKodu { get; set; }
    public required string KisaAciklama { get; set; }
    public string? AnaGorselUrl { get; set; }
}
