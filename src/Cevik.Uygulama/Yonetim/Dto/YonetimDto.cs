using System;
using Cevik.Alan.Ortak;

namespace Cevik.Uygulama.Yonetim.Dto;

public class FirmaOnayDto
{
    public long FirmaId { get; set; }
    public FirmaOnayDurumu Durum { get; set; }
}

public class SiparisDurumGuncelleDto
{
    public long SiparisId { get; set; }
    public SiparisDurumu YeniDurum { get; set; }
}

public class BlogYazisiEkleDto
{
    public required string Baslik { get; set; }
    public required string Slug { get; set; }
    public required string Ozet { get; set; }
    public required string IcerikHtml { get; set; }
    public string? KapakGorselUrl { get; set; }
    public string? Kategori { get; set; }
}

public class BlogYazisiDto : BlogYazisiEkleDto
{
    public int Id { get; set; }
    public DateTimeOffset? YayinTarihi { get; set; }
}

public class FirmaBasvuruOzetDto
{
    public int Id { get; set; }
    public required string Unvan { get; set; }
    public required string VergiDairesi { get; set; }
    public required string VergiNo { get; set; }
    public string? KepAdresi { get; set; }
    public FirmaOnayDurumu OnayDurumu { get; set; }
    public DateTimeOffset BasvuruTarihi { get; set; }
    public int KullaniciSayisi { get; set; }
}

public class SiparisYonetimOzetDto
{
    public long Id { get; set; }
    public required string SiparisNo { get; set; }
    public SiparisDurumu Durum { get; set; }
    public decimal GenelToplam { get; set; }
    public required string ParaBirimi { get; set; }
    public DateTimeOffset Tarih { get; set; }
    public string? MusteriAdi { get; set; }
    public string? FirmaUnvani { get; set; }
    public int KalemSayisi { get; set; }
    /// <summary>Bu siparişin şu an geçebileceği durumlar — panelde buton üretmek için.</summary>
    public List<SiparisDurumu> IzinliGecisler { get; set; } = [];
}
