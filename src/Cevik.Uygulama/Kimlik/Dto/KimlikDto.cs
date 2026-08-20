namespace Cevik.Uygulama.Kimlik.Dto;

public class KullaniciGirisDto
{
    public required string Eposta { get; set; }
    public required string Sifre { get; set; }
}

public class KullaniciKayitDto
{
    public required string Ad { get; set; }
    public required string Soyad { get; set; }
    public required string Eposta { get; set; }
    public required string Telefon { get; set; }
    public required string Sifre { get; set; }
}

public class FirmaBasvuruDto
{
    public required string FirmaAdi { get; set; }
    public required string VergiDairesi { get; set; }
    public required string VergiNo { get; set; }
    public string? KepAdresi { get; set; }
}

public class TokenDto
{
    public required string AccessToken { get; set; }
    public required string KullaniciAdi { get; set; }
    public bool FirmaMi { get; set; }
    public long? FirmaId { get; set; }
}
