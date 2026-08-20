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

    public KimlikServisi(CevikDbContext context, IOptions<JwtAyarlari> jwt)
    {
        _context = context;
        _jwt = jwt.Value;
    }

    public async Task<TokenDto?> GirisYapAsync(KullaniciGirisDto dto)
    {
        var kullanici = await _context.Kullanicilar
            .FirstOrDefaultAsync(x => x.Eposta == dto.Eposta);

        if (kullanici is null)
        {
            // Kullanıcı yoksa da hash doğrulaması yapıyoruz: aksi hâlde yanıt süresi
            // "bu e-posta kayıtlı mı" sorusunu ele verir (kullanıcı sayımı saldırısı).
            _parolaHesaplayici.VerifyHashedPassword(null!, SahteHash, dto.Sifre);
            return null;
        }

        var sonuc = _parolaHesaplayici.VerifyHashedPassword(null!, kullanici.SifreHash, dto.Sifre);
        if (sonuc == PasswordVerificationResult.Failed)
            return null;

        // Hash algoritması güncellendiyse parolayı sessizce yeni formata taşı.
        if (sonuc == PasswordVerificationResult.SuccessRehashNeeded)
        {
            kullanici.SifreHash = _parolaHesaplayici.HashPassword(null!, dto.Sifre);
        }

        kullanici.SonGirisTarihi = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();

        return TokenUret(kullanici);
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
            // Kayıt akışı HER ZAMAN en düşük yetkiyi verir. Yükseltme ayrı bir
            // admin işlemidir; e-posta adresine bakarak rol atanmaz.
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

        // Aynı kullanıcı ikinci kez başvuramaz.
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
        // Yetki, admin firmayı ONAYLAYINCA verilir — başvuru anında değil.
        kullanici.FirmaYetkilisiMi = false;
        await _context.SaveChangesAsync();

        return true;
    }

    private TokenDto TokenUret(Kullanici kullanici)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, kullanici.Id.ToString()),
            new(ClaimTypes.Email, kullanici.Eposta),
            new(ClaimTypes.Name, $"{kullanici.Ad} {kullanici.Soyad}"),
            // Rol talebi veritabanındaki alandan gelir.
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
            KullaniciAdi = $"{kullanici.Ad} {kullanici.Soyad}",
            FirmaMi = kullanici.FirmaId.HasValue,
            FirmaId = kullanici.FirmaId
        };
    }

    /// <summary>Zamanlama saldırısına karşı kullanılan, hiçbir parolayla eşleşmeyen sabit hash.</summary>
    private static readonly string SahteHash =
        new PasswordHasher<Kullanici>().HashPassword(null!, "eslesmeyen-sabit-parola");
}
