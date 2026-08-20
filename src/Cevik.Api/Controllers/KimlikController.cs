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
}
