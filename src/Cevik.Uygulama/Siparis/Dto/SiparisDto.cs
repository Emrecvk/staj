using System;
using System.Collections.Generic;
using Cevik.Alan.Ortak;

namespace Cevik.Uygulama.Siparis.Dto;

public class SiparisOlusturDto
{
    public long FaturaAdresiId { get; set; }
    public long TeslimatAdresiId { get; set; }
    public string? MusteriNotu { get; set; }
}

public class SiparisListelemeDto
{
    public long Id { get; set; }
    public required string SiparisNo { get; set; }
    public SiparisDurumu Durum { get; set; }
    public decimal GenelToplam { get; set; }
    public required string ParaBirimi { get; set; }
    public DateTimeOffset Tarih { get; set; }
}

public class SiparisDetayDto : SiparisListelemeDto
{
    public decimal AraToplam { get; set; }
    public decimal IndirimTutari { get; set; }
    public decimal KdvTutari { get; set; }
    public decimal KargoUcreti { get; set; }
    public List<SiparisKalemDto> Kalemler { get; set; } = [];
}

public class SiparisKalemDto
{
    public long UrunId { get; set; }
    public required string UrunKodu { get; set; }
    public int Miktar { get; set; }
    public decimal BirimFiyat { get; set; }
    public decimal ToplamFiyat { get; set; }
}
