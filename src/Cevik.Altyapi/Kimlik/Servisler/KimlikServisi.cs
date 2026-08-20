using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Kimlik.Arayuzler;
using Cevik.Uygulama.Kimlik.Dto;
using Cevik.Uygulama.Ortak;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Cevik.Altyapi.Kimlik.Servisler;

public class KimlikServisi : IKimlikServisi
{
    private readonly CevikDbContext _context;
    private readonly JwtAyarlari _jwt;
    private readonly PasswordHasher<Kullanici> _parolaHesaplayici = new();
    private readonly Cevik.Uygulama.Ortak.Arayuzler.IEpostaServisi _epostaServisi;

    public KimlikServisi(CevikDbContext context, IOptions<JwtAyarlari> jwt, Cevik.Uygulama.Ortak.Arayuzler.IEpostaServisi epostaServisi)
    {
        _context = context;
        _jwt = jwt.Value;
        _epostaServisi = epostaServisi;
    }

    public async Task<TokenDto?> GirisYapAsync(KullaniciGirisDto dto)
    {
        var kullanici = await _context.Kullanicilar
            .FirstOrDefaultAsync(x => x.Eposta == dto.Eposta);

        if (kullanici is null)
        {
            _parolaHesaplayici.VerifyHashedPassword(null!, SahteHash, dto.Sifre);
            return null;
        }

        var sonuc = _parolaHesaplayici.VerifyHashedPassword(null!, kullanici.SifreHash, dto.Sifre);
        if (sonuc == PasswordVerificationResult.Failed)
            return null;

        if (sonuc == PasswordVerificationResult.SuccessRehashNeeded)
        {
            kullanici.SifreHash = _parolaHesaplayici.HashPassword(null!, dto.Sifre);
        }

        kullanici.SonGirisTarihi = DateTimeOffset.UtcNow;
        
        var tokenDto = TokenUret(kullanici);
        
        // Refresh token oluştur
        var refreshToken = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64));
        var refreshTokenHash = HashYarat(refreshToken);
        
        var yeniRefreshToken = new KullaniciRefreshToken
        {
            KullaniciId = kullanici.Id,
            TokenHash = refreshTokenHash,
            SonaErmeTarihi = DateTimeOffset.UtcNow.AddDays(7)
        };
        _context.KullaniciRefreshTokens.Add(yeniRefreshToken);
        
        await _context.SaveChangesAsync();
        
        tokenDto.RefreshToken = refreshToken;
        return tokenDto;
    }

    public async Task<TokenDto?> TokenYenileAsync(TokenYenileDto dto)
    {
        var tokenHash = HashYarat(dto.RefreshToken);
        var mevcutToken = await _context.KullaniciRefreshTokens
            .Include(x => x.Kullanici)
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

        if (mevcutToken == null)
            return null;

        if (mevcutToken.IptalEdildiMi || mevcutToken.KullanildiMi)
        {
            // Token çalınmış olabilir - ailedeki tüm tokenları iptal et
            var aileTokens = await _context.KullaniciRefreshTokens
                .Where(x => x.KullaniciId == mevcutToken.KullaniciId && !x.IptalEdildiMi)
                .ToListAsync();
                
            foreach (var t in aileTokens)
            {
                t.IptalEdildiMi = true;
                t.IptalNedeni = "Şüpheli token yeniden kullanımı";
            }
            await _context.SaveChangesAsync();
            return null;
        }

        if (mevcutToken.SonaErmeTarihi <= DateTimeOffset.UtcNow)
            return null;

        var yeniRefreshToken = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64));
        var yeniRefreshTokenHash = HashYarat(yeniRefreshToken);

        mevcutToken.YerineGecenTokenHash = yeniRefreshTokenHash;
        
        var yeniTokenEntity = new KullaniciRefreshToken
        {
            KullaniciId = mevcutToken.KullaniciId,
            TokenHash = yeniRefreshTokenHash,
            SonaErmeTarihi = DateTimeOffset.UtcNow.AddDays(7)
        };
        
        _context.KullaniciRefreshTokens.Add(yeniTokenEntity);
        await _context.SaveChangesAsync();

        var tokenDto = TokenUret(mevcutToken.Kullanici);
        tokenDto.RefreshToken = yeniRefreshToken;
        return tokenDto;
    }

    public async Task<bool> CikisYapAsync(string refreshToken)
    {
        var tokenHash = HashYarat(refreshToken);
        var mevcutToken = await _context.KullaniciRefreshTokens
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

        if (mevcutToken == null || mevcutToken.IptalEdildiMi || mevcutToken.KullanildiMi)
            return false;

        mevcutToken.IptalEdildiMi = true;
        mevcutToken.IptalNedeni = "Kullanıcı çıkışı";
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SifreSifirlamaTalebiOlusturAsync(SifreSifirlamaTalebiDto dto)
    {
        var kullanici = await _context.Kullanicilar.FirstOrDefaultAsync(x => x.Eposta == dto.Eposta);
        if (kullanici == null) return true; // Enumeration engelleme

        var token = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        kullanici.SifreSifirlamaTokenHash = HashYarat(token);
        kullanici.SifreSifirlamaGecerlilikSuresi = DateTimeOffset.UtcNow.AddHours(24);
        
        await _context.SaveChangesAsync();
        await _epostaServisi.EpostaGonderAsync(kullanici.Eposta, "Şifre Sıfırlama Talebi", $"Şifre sıfırlama kodunuz: {token}");
        return true;
    }

    public async Task<bool> SifreSifirlaAsync(SifreSifirlaDto dto)
    {
        var kullanici = await _context.Kullanicilar.FirstOrDefaultAsync(x => x.Eposta == dto.Eposta);
        if (kullanici == null || string.IsNullOrEmpty(kullanici.SifreSifirlamaTokenHash)) return false;

        if (kullanici.SifreSifirlamaGecerlilikSuresi <= DateTimeOffset.UtcNow) return false;

        var tokenHash = HashYarat(dto.Token);
        if (kullanici.SifreSifirlamaTokenHash != tokenHash) return false;

        kullanici.SifreHash = _parolaHesaplayici.HashPassword(null!, dto.YeniSifre);
        kullanici.SifreSifirlamaTokenHash = null;
        kullanici.SifreSifirlamaGecerlilikSuresi = null;
        
        // Şifre sıfırlandığı için tüm mevcut oturumları (refresh tokenları) iptal edelim
        var aktifTokens = await _context.KullaniciRefreshTokens
            .Where(x => x.KullaniciId == kullanici.Id && !x.IptalEdildiMi && string.IsNullOrEmpty(x.YerineGecenTokenHash))
            .ToListAsync();
            
        foreach(var t in aktifTokens)
        {
            t.IptalEdildiMi = true;
            t.IptalNedeni = "Şifre sıfırlama";
        }
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> EpostaDogrulamaTalebiOlusturAsync(long kullaniciId)
    {
        var kullanici = await _context.Kullanicilar.FindAsync(kullaniciId);
        if (kullanici == null || kullanici.EpostaDogrulandiMi) return false;

        var token = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        kullanici.EpostaDogrulamaTokenHash = HashYarat(token);
        kullanici.EpostaDogrulamaGecerlilikSuresi = DateTimeOffset.UtcNow.AddHours(24);
        
        await _context.SaveChangesAsync();
        await _epostaServisi.EpostaGonderAsync(kullanici.Eposta, "E-Posta Doğrulama", $"E-posta doğrulama kodunuz: {token}");
        return true;
    }

    public async Task<bool> EpostaDogrulaAsync(EpostaDogrulaDto dto)
    {
        var kullanici = await _context.Kullanicilar.FirstOrDefaultAsync(x => x.Eposta == dto.Eposta);
        if (kullanici == null || string.IsNullOrEmpty(kullanici.EpostaDogrulamaTokenHash)) return false;

        if (kullanici.EpostaDogrulamaGecerlilikSuresi <= DateTimeOffset.UtcNow) return false;

        var tokenHash = HashYarat(dto.Token);
        if (kullanici.EpostaDogrulamaTokenHash != tokenHash) return false;

        kullanici.EpostaDogrulandiMi = true;
        kullanici.EpostaDogrulamaTokenHash = null;
        kullanici.EpostaDogrulamaGecerlilikSuresi = null;
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> KayitOlAsync(KullaniciKayitDto dto)
    {
        var eposta = dto.Eposta.Trim().ToLowerInvariant();

        if (await _context.Kullanicilar.AnyAsync(x => x.Eposta == eposta))
            return false;

        var yeniKullanici = new Kullanici
        {
            Ad = dto.Ad,
            Soyad = dto.Soyad,
            Eposta = eposta,
            Telefon = dto.Telefon,
            SifreHash = _parolaHesaplayici.HashPassword(null!, dto.Sifre),
            Rol = KullaniciRolu.Musteri
        };

        _context.Kullanicilar.Add(yeniKullanici);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> FirmaBasvurusuYapAsync(long kullaniciId, FirmaBasvuruDto dto)
    {
        var kullanici = await _context.Kullanicilar.FindAsync(kullaniciId);
        if (kullanici is null) return false;

        if (kullanici.FirmaId is not null) return false;

        var firma = new Firma
        {
            Unvan = dto.FirmaAdi,
            VergiDairesi = dto.VergiDairesi,
            VergiNo = dto.VergiNo,
            KepAdresi = dto.KepAdresi,
            OnayDurumu = FirmaOnayDurumu.Beklemede
        };

        _context.Firmalar.Add(firma);
        await _context.SaveChangesAsync();

        kullanici.FirmaId = firma.Id;
        kullanici.FirmaYetkilisiMi = false;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task IptalEdilmisVeSuresiDolanTokenlariTemizleAsync()
    {
        var simdikiZaman = DateTimeOffset.UtcNow;
        var silinecekler = await _context.KullaniciRefreshTokens
            .Where(t => t.IptalEdildiMi || t.SonaErmeTarihi < simdikiZaman)
            .ToListAsync();

        if (silinecekler.Any())
        {
            _context.KullaniciRefreshTokens.RemoveRange(silinecekler);
            await _context.SaveChangesAsync();
        }
    }

    private TokenDto TokenUret(Kullanici kullanici)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, kullanici.Id.ToString()),
            new(ClaimTypes.Email, kullanici.Eposta),
            new(ClaimTypes.Name, $"{kullanici.Ad} {kullanici.Soyad}"),
            new(ClaimTypes.Role, kullanici.Rol.ToString()),
            new("FirmaYetkilisi", kullanici.FirmaYetkilisiMi ? "true" : "false")
        };

        if (kullanici.FirmaId is not null)
            claims.Add(new Claim("FirmaId", kullanici.FirmaId.Value.ToString()));

        var anahtar = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwt.GecerlilikDakika),
            Issuer = _jwt.Issuer,
            Audience = _jwt.Audience,
            SigningCredentials = new SigningCredentials(anahtar, SecurityAlgorithms.HmacSha256)
        });

        return new TokenDto
        {
            AccessToken = tokenHandler.WriteToken(token),
            RefreshToken = "", // Bu değer GirisYapAsync/TokenYenileAsync içinde atanacak
            KullaniciAdi = $"{kullanici.Ad} {kullanici.Soyad}",
            FirmaMi = kullanici.FirmaId.HasValue,
            FirmaId = kullanici.FirmaId
        };
    }

    private static string HashYarat(string token)
    {
        using var sha = System.Security.Cryptography.SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    private static readonly string SahteHash =
        new PasswordHasher<Kullanici>().HashPassword(null!, "eslesmeyen-sabit-parola");
}
