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
    public required string RefreshToken { get; set; }
    public required string KullaniciAdi { get; set; }
    public bool FirmaMi { get; set; }
    public long? FirmaId { get; set; }
}

public class TokenYenileDto
{
    public required string RefreshToken { get; set; }
}

public class SifreSifirlamaTalebiDto
{
    public required string Eposta { get; set; }
}

public class SifreSifirlaDto
{
    public required string Eposta { get; set; }
    public required string Token { get; set; }
    public required string YeniSifre { get; set; }
}

public class EpostaDogrulaDto
{
    public required string Eposta { get; set; }
    public required string Token { get; set; }
}
