namespace Cevik.Uygulama.Yonetim.Dto;

/// <summary>
/// Yönetim uçlarının giriş modelleri.
///
/// Neden DTO: controller'lar doğrudan <c>Urun</c> / <c>Kategori</c> entity'sini
/// bağlıyordu. Bu, istemcinin <c>SilindiMi</c>, <c>Id</c>, <c>GoruntulenmeSayisi</c>
/// hatta ilişkili koleksiyonları POST gövdesinden set edebilmesi demekti
/// (over-posting). DTO ile yalnızca düzenlenmesine izin verilen alanlar açılır.
/// </summary>
public class UrunEkleDto
{
    public int KategoriId { get; set; }
    public int UreticiId { get; set; }
    public required string UreticiUrunKodu { get; set; }
    public required string KisaAciklama { get; set; }
    public string? DetayliAciklamaTr { get; set; }
    public string? AnaGorselUrl { get; set; }
    public short UrunDurumu { get; set; } = 1;
    public short RohsDurumu { get; set; }
    public short MontajTipi { get; set; }
    public bool Aktif { get; set; } = true;
}

public class UrunGuncelleDto
{
    public required string KisaAciklama { get; set; }
    public string? DetayliAciklamaTr { get; set; }
    public string? AnaGorselUrl { get; set; }
    public short UrunDurumu { get; set; }
    public short RohsDurumu { get; set; }
    public short MontajTipi { get; set; }
    public bool KampanyaliMi { get; set; }
    public bool Aktif { get; set; }
}

public class StokGuncelleDto
{
    public long UrunAmbalajId { get; set; }
    public int StokMiktari { get; set; }
    public int GelecekStokMiktari { get; set; }
    public DateTime? GelecekStokTarihi { get; set; }
}

public class FiyatKademesiYazDto
{
    public int MinMiktar { get; set; }
    public int? MaxMiktar { get; set; }
    public decimal BirimFiyat { get; set; }
    public string ParaBirimi { get; set; } = "USD";
    public int? MusteriGrubuId { get; set; }
}

public class AmbalajFiyatGuncelleDto
{
    public long UrunAmbalajId { get; set; }
    public List<FiyatKademesiYazDto> Kademeler { get; set; } = [];
}

public class KategoriYazDto
{
    public int? UstKategoriId { get; set; }
    public required string AdTr { get; set; }
    public required string AdEn { get; set; }
    public required string SlugTr { get; set; }
    public required string SlugEn { get; set; }
    public int Sira { get; set; }
    public bool YaprakMi { get; set; }
    public string? IkonUrl { get; set; }
    public string? SeoBaslik { get; set; }
    public string? SeoAciklama { get; set; }
    public string? SeoIcerikHtml { get; set; }
    public bool Aktif { get; set; } = true;
}

public class UreticiYazDto
{
    public required string Ad { get; set; }
    public required string Slug { get; set; }
    public string? LogoUrl { get; set; }
    public string? WebSitesi { get; set; }
    public string? Aciklama { get; set; }
    public bool YetkiliDistributorMu { get; set; }
    public bool Aktif { get; set; } = true;
}

public class OzellikTanimiYazDto
{
    public required string Kod { get; set; }
    public required string AdTr { get; set; }
    public required string AdEn { get; set; }
    public short VeriTipi { get; set; }
    public string? Birim { get; set; }
    public bool FiltrelenebilirMi { get; set; } = true;
    public bool SiralanabilirMi { get; set; }
    public short GosterimTipi { get; set; } = 1;
}

public class KategoriOzelligiYazDto
{
    public int KategoriId { get; set; }
    public int OzellikTanimId { get; set; }
    public int Sira { get; set; }
    public bool ZorunluMu { get; set; }
}

public class KullaniciRolGuncelleDto
{
    public long KullaniciId { get; set; }
    /// <summary>Cevik.Alan.Ortak.KullaniciRolu değeri.</summary>
    public short Rol { get; set; }
}
