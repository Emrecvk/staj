using Cevik.Alan.Ortak;
using System;

namespace Cevik.Alan.Kimlik;

public class KullaniciRefreshToken : VarlikTabaniUzun
{
    public long KullaniciId { get; set; }
    public Kullanici Kullanici { get; set; } = null!;
    
    public required string TokenHash { get; set; }
    public DateTimeOffset SonaErmeTarihi { get; set; }
    public bool IptalEdildiMi { get; set; }
    public string? IptalNedeni { get; set; }
    
    // Rotation tracking
    public string? YerineGecenTokenHash { get; set; }
    
    public bool KullanildiMi => !string.IsNullOrEmpty(YerineGecenTokenHash);
    public bool GecerliMi => !IptalEdildiMi && !KullanildiMi && SonaErmeTarihi > DateTimeOffset.UtcNow;
}
