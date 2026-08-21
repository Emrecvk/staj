namespace Cevik.Uygulama.Kimlik.Dto;

public class AdresEkleDto
{
    public required string Baslik { get; set; }
    public required string Sehir { get; set; } // Il
    public required string Ilce { get; set; }
    public required string PostaKodu { get; set; }
    public required string AcikAdres { get; set; }
    public bool FaturaAdresiMi { get; set; } // Tip = AdresTipi.Fatura
}

public class AdresDto : AdresEkleDto
{
    public long Id { get; set; }
}

public class FavoriEkleDto
{
    public long UrunId { get; set; }
}

public class FavoriDto
{
    public long UrunId { get; set; }
    public required string UrunKodu { get; set; }
    public required string KisaAciklama { get; set; }
    public decimal? Fiyat { get; set; }
}

/// <summary>
/// Kullanıcının bağlı olduğu firmanın özeti.
/// Kredi limiti ve ödeme vadesi ticari bilgidir; kullanıcı kendi firması
/// için görebilir.
/// </summary>
public class FirmaBilgiDto
{
    public int Id { get; set; }
    public required string Unvan { get; set; }
    public required string VergiDairesi { get; set; }
    public required string VergiNo { get; set; }
    public string? KepAdresi { get; set; }
    public short OnayDurumu { get; set; }
    public decimal KrediLimiti { get; set; }
    public int OdemeVadesiGun { get; set; }
    public string? MusteriGrubu { get; set; }
    /// <summary>Kullanıcı bu firmanın yetkilisi mi.</summary>
    public bool YetkiliMi { get; set; }
}
