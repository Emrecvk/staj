using System.Collections.Generic;

namespace Cevik.Uygulama.Katalog.Dto;

public class KarsilastirmaSonucDto
{
    public List<KarsilastirmaUrunDto> Urunler { get; set; } = new();
    public List<KarsilastirmaOzellikDto> OrtakOzellikler { get; set; } = new();
}

public class KarsilastirmaUrunDto
{
    public long UrunId { get; set; }
    public required string UreticiUrunKodu { get; set; }
    public required string UreticiAd { get; set; }
    public string? AnaGorselUrl { get; set; }
    public decimal? EnUcuzFiyat { get; set; }
}

public class KarsilastirmaOzellikDto
{
    public required string OzellikKodu { get; set; }
    public required string OzellikAd { get; set; }
    // Key: UrunId, Value: DegerMetin
    public Dictionary<long, string> Degerler { get; set; } = new();
}
