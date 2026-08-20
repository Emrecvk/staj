using Cevik.Alan.Ortak;
using System;

namespace Cevik.Alan.Kimlik;

public class Kullanici : VarlikTabaniUzun
{
    public required string Ad { get; set; }
    public required string Soyad { get; set; }
    public required string Eposta { get; set; }
    public string? Telefon { get; set; }

    public int? FirmaId { get; set; }
    public Firma? Firma { get; set; }

    public string SifreHash { get; set; } = string.Empty;
    public bool FirmaYetkilisiMi { get; set; }

    /// <summary>
    /// Yetkilendirmenin TEK kaynağı. JWT rol talebi buradan üretilir.
    /// Kayıt akışı bu alanı asla Admin yapamaz; yükseltme yalnızca
    /// mevcut bir Admin tarafından veya seed ile yapılır.
    /// </summary>
    public KullaniciRolu Rol { get; set; } = KullaniciRolu.Musteri;

    public string VarsayilanParaBirimi { get; set; } = "TRY";
    public string TercihEdilenDil { get; set; } = "tr-TR";

    public bool EpostaDogrulandiMi { get; set; }
    public DateTimeOffset? SonGirisTarihi { get; set; }

    // Gelişmiş Kimlik Doğrulama Alanları
    public string? SifreSifirlamaTokenHash { get; set; }
    public DateTimeOffset? SifreSifirlamaGecerlilikSuresi { get; set; }
    
    public string? EpostaDogrulamaTokenHash { get; set; }
    public DateTimeOffset? EpostaDogrulamaGecerlilikSuresi { get; set; }
    
    public ICollection<KullaniciRefreshToken> RefreshTokens { get; set; } = new List<KullaniciRefreshToken>();
}
