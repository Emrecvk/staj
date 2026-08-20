using System.Security.Claims;
using System.Threading.Tasks;
using Cevik.Uygulama.Kimlik.Arayuzler;
using Cevik.Uygulama.Kimlik.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KimlikController : ControllerBase
{
    private readonly IKimlikServisi _kimlikServisi;

    public KimlikController(IKimlikServisi kimlikServisi)
    {
        _kimlikServisi = kimlikServisi;
    }

    [HttpPost("giris")]
    public async Task<IActionResult> Giris(KullaniciGirisDto dto)
    {
        var token = await _kimlikServisi.GirisYapAsync(dto);
        if (token == null)
            return Unauthorized(new { Mesaj = "E-posta veya şifre hatalı!" });

        return Ok(token);
    }

    [HttpPost("kayit")]
    public async Task<IActionResult> Kayit(KullaniciKayitDto dto)
    {
        var sonuc = await _kimlikServisi.KayitOlAsync(dto);
        if (!sonuc)
            return BadRequest(new { Mesaj = "Bu e-posta adresi zaten kullanılıyor." });

        return Ok(new { Mesaj = "Kayıt başarılı." });
    }

    [Authorize]
    [HttpPost("firma-basvurusu")]
    public async Task<IActionResult> FirmaBasvurusu(FirmaBasvuruDto dto)
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (idClaim == null || !long.TryParse(idClaim.Value, out long userId))
            return Unauthorized();

        var sonuc = await _kimlikServisi.FirmaBasvurusuYapAsync(userId, dto);
        if (!sonuc)
            return BadRequest(new { Mesaj = "Firma başvurusu yapılamadı." });

        return Ok(new { Mesaj = "Firma başvurunuz başarıyla alındı." });
    }

    [HttpPost("yenile")]
    public async Task<IActionResult> Yenile(TokenYenileDto dto)
    {
        var token = await _kimlikServisi.TokenYenileAsync(dto);
        if (token == null)
            return Unauthorized(new { Mesaj = "Geçersiz veya süresi dolmuş refresh token." });

        return Ok(token);
    }

    [HttpPost("cikis")]
    public async Task<IActionResult> Cikis(TokenYenileDto dto)
    {
        var sonuc = await _kimlikServisi.CikisYapAsync(dto.RefreshToken);
        if (!sonuc)
            return BadRequest(new { Mesaj = "Çıkış işlemi başarısız." });
            
        return Ok(new { Mesaj = "Başarıyla çıkış yapıldı." });
    }

    [HttpPost("sifre-sifirlama-talebi")]
    public async Task<IActionResult> SifreSifirlamaTalebi(SifreSifirlamaTalebiDto dto)
    {
        var token = await _kimlikServisi.SifreSifirlamaTalebiOlusturAsync(dto);
        
        // Gerçekte e-posta gönderilir, güvenlik gereği kullanıcıya var olup olmadığı söylenmez.
        if (token != null)
        {
            // Dev ortamı için token'ı header'da veya response'da dönebiliriz. (Staj projesi için)
            return Ok(new { Mesaj = "Şifre sıfırlama e-postası gönderildi.", DevToken = token });
        }
        
        return Ok(new { Mesaj = "Şifre sıfırlama e-postası gönderildi." });
    }

    [HttpPost("sifre-sifirla")]
    public async Task<IActionResult> SifreSifirla(SifreSifirlaDto dto)
    {
        var sonuc = await _kimlikServisi.SifreSifirlaAsync(dto);
        if (!sonuc)
            return BadRequest(new { Mesaj = "Geçersiz veya süresi dolmuş token." });
            
        return Ok(new { Mesaj = "Şifreniz başarıyla güncellendi." });
    }

    [Authorize]
    [HttpPost("eposta-dogrulama-talebi")]
    public async Task<IActionResult> EpostaDogrulamaTalebi()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (idClaim == null || !long.TryParse(idClaim.Value, out long userId))
            return Unauthorized();
            
        var token = await _kimlikServisi.EpostaDogrulamaTalebiOlusturAsync(userId);
        
        if (token != null)
            return Ok(new { Mesaj = "Doğrulama e-postası gönderildi.", DevToken = token });
            
        return BadRequest(new { Mesaj = "Zaten doğrulanmış veya hata oluştu." });
    }

    [HttpPost("eposta-dogrula")]
    public async Task<IActionResult> EpostaDogrula(EpostaDogrulaDto dto)
    {
        var sonuc = await _kimlikServisi.EpostaDogrulaAsync(dto);
        if (!sonuc)
            return BadRequest(new { Mesaj = "Geçersiz veya süresi dolmuş token." });
            
        return Ok(new { Mesaj = "E-posta adresiniz başarıyla doğrulandı." });
    }
}
