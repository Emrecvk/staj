using System;
using System.Collections.Generic;
using Cevik.Alan.Ortak;

namespace Cevik.Uygulama.Teklif.Dto;

public class TeklifOlusturDto
{
    public string? MusteriNotu { get; set; }
}

public class TeklifListelemeDto
{
    public long Id { get; set; }
    public required string TalepNo { get; set; }
    public TeklifDurumu Durum { get; set; }
    public DateTimeOffset? GecerlilikTarihi { get; set; }
}

public class TeklifDetayDto : TeklifListelemeDto
{
    public string? MusteriNotu { get; set; }
    public string? TemsilciNotu { get; set; }
    public List<TeklifKalemiDto> Kalemler { get; set; } = new();
}

public class TeklifKalemiDto
{
    public long Id { get; set; }
    public long? UrunId { get; set; }
    public string? SerbestUrunKodu { get; set; }
    public int Miktar { get; set; }
    public int? TeklifEdilenMiktar { get; set; }
    public decimal? HedefBirimFiyat { get; set; }
    public decimal? TeklifEdilenBirimFiyat { get; set; }
    public string? ParaBirimi { get; set; }
    public int? TeklifEdilenTeslimSuresiGun { get; set; }
    public string? SatisTemsilcisiNotu { get; set; }
}

public class TeklifKalemiGuncelleDto
{
    public int? TeklifEdilenMiktar { get; set; }
    public decimal? TeklifEdilenBirimFiyat { get; set; }
    public string? ParaBirimi { get; set; }
    public int? TeklifEdilenTeslimSuresiGun { get; set; }
    public string? SatisTemsilcisiNotu { get; set; }
}

public class TeklifFiyatlandirDto
{
    public DateTimeOffset GecerlilikTarihi { get; set; }
    public string? TemsilciNotu { get; set; }
    public Dictionary<long, TeklifKalemiGuncelleDto> Kalemler { get; set; } = new();
}
