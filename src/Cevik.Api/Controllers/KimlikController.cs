using System.Security.Claims;
using System.Threading.Tasks;
using Cevik.Uygulama.Kimlik.Arayuzler;
using Cevik.Uygulama.Kimlik.Dto;
using Cevik.Uygulama.Ortak;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

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

    [EnableRateLimiting("Auth")]
    [HttpPost("giris")]
    [ProducesResponseType(typeof(TokenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Giris(KullaniciGirisDto dto)
    {
        var token = await _kimlikServisi.GirisYapAsync(dto);
        if (token == null)
            return Unauthorized(new { Mesaj = "E-posta veya şifre hatalı!" });

        return Ok(token);
    }

    [EnableRateLimiting("Auth")]
    [HttpPost("kayit")]
    [ProducesResponseType(typeof(MesajDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Kayit(KullaniciKayitDto dto)
    {
        var sonuc = await _kimlikServisi.KayitOlAsync(dto);
        if (!sonuc)
            return BadRequest(new { Mesaj = "Bu e-posta adresi zaten kullanılıyor." });

        return Ok(new { Mesaj = "Kayıt başarılı." });
    }

    [Authorize]
    [HttpPost("firma-basvurusu")]
    [ProducesResponseType(typeof(MesajDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
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

    [EnableRateLimiting("Auth")]
    [HttpPost("yenile")]
    [ProducesResponseType(typeof(TokenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Yenile(TokenYenileDto dto)
    {
        var token = await _kimlikServisi.TokenYenileAsync(dto);
        if (token == null)
            return Unauthorized(new { Mesaj = "Geçersiz veya süresi dolmuş refresh token." });

        return Ok(token);
    }

    [HttpPost("cikis")]
    [ProducesResponseType(typeof(MesajDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Cikis(TokenYenileDto dto)
    {
        var sonuc = await _kimlikServisi.CikisYapAsync(dto.RefreshToken);
        if (!sonuc)
            return BadRequest(new { Mesaj = "Çıkış işlemi başarısız." });
            
        return Ok(new { Mesaj = "Başarıyla çıkış yapıldı." });
    }

    [EnableRateLimiting("Auth")]
    [HttpPost("sifre-sifirlama-talebi")]
    [ProducesResponseType(typeof(MesajDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SifreSifirlamaTalebi(SifreSifirlamaTalebiDto dto)
    {
        await _kimlikServisi.SifreSifirlamaTalebiOlusturAsync(dto);
        return Ok(new { Mesaj = "Şifre sıfırlama e-postası gönderildi." });
    }

    [EnableRateLimiting("Auth")]
    [HttpPost("sifre-sifirla")]
    [ProducesResponseType(typeof(MesajDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SifreSifirla(SifreSifirlaDto dto)
    {
        var sonuc = await _kimlikServisi.SifreSifirlaAsync(dto);
        if (!sonuc)
            return BadRequest(new { Mesaj = "Geçersiz veya süresi dolmuş token." });
            
        return Ok(new { Mesaj = "Şifreniz başarıyla güncellendi." });
    }

    [Authorize]
    [HttpPost("eposta-dogrulama-talebi")]
    [ProducesResponseType(typeof(MesajDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> EpostaDogrulamaTalebi()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (idClaim == null || !long.TryParse(idClaim.Value, out long userId))
            return Unauthorized();
            
        var sonuc = await _kimlikServisi.EpostaDogrulamaTalebiOlusturAsync(userId);
        
        if (sonuc)
            return Ok(new { Mesaj = "Doğrulama e-postası gönderildi." });
            
        return BadRequest(new { Mesaj = "Zaten doğrulanmış veya hata oluştu." });
    }

    [HttpPost("eposta-dogrula")]
    [ProducesResponseType(typeof(MesajDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> EpostaDogrula(EpostaDogrulaDto dto)
    {
        var sonuc = await _kimlikServisi.EpostaDogrulaAsync(dto);
        if (!sonuc)
            return BadRequest(new { Mesaj = "Geçersiz veya süresi dolmuş token." });
            
        return Ok(new { Mesaj = "E-posta adresiniz başarıyla doğrulandı." });
    }
}

