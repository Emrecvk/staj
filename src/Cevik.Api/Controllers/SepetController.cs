using System.Security.Claims;
using System.Threading.Tasks;
using Cevik.Uygulama.Siparis.Arayuzler;
using Cevik.Uygulama.Siparis.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SepetController : ControllerBase
{
    private readonly ISepetServisi _sepetServisi;

    public SepetController(ISepetServisi sepetServisi)
    {
        _sepetServisi = sepetServisi;
    }

    /// <summary>
    /// Kullanıcı kimliği ve misafir oturum anahtarını BİRLİKTE döndürür.
    ///
    /// Önceki sürüm giriş yapılmışsa oturum anahtarını atıyordu (<c>(userId, null)</c>).
    /// Bu, misafirken doldurulan sepetin giriş sonrasında bulunamaması demekti:
    /// sepet birleştirme mantığı iki değere de ihtiyaç duyar.
    /// </summary>
    private (long? KullaniciId, string? OturumAnahtari) KimlikCoz()
    {
        long? kullaniciId = null;

        var idTalebi = User.FindFirst(ClaimTypes.NameIdentifier);
        if (idTalebi is not null && long.TryParse(idTalebi.Value, out var cozulen))
            kullaniciId = cozulen;

        Request.Headers.TryGetValue("X-Session-Key", out var oturumAnahtari);
        var oturum = oturumAnahtari.ToString();

        return (kullaniciId, string.IsNullOrWhiteSpace(oturum) ? null : oturum);
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var (userId, sessionKey) = KimlikCoz();
        var sepet = await _sepetServisi.SepetGetirAsync(userId, sessionKey);
        
        if (sepet != null && userId == null && string.IsNullOrEmpty(sessionKey))
        {
            // İlk kez misafir geldiğinde oluşan anahtarı header'a ekle (gerçekte cookie mantıklı)
            Response.Headers.Append("X-Session-Key", sepet.OturumAnahtari);
        }

        return Ok(sepet);
    }

    [HttpPost]
    public async Task<IActionResult> Ekle(SepeteEkleDto dto)
    {
        var (userId, sessionKey) = KimlikCoz();
        var sepet = await _sepetServisi.SepeteEkleAsync(userId, sessionKey, dto);
        
        if (userId == null && !string.IsNullOrEmpty(sepet.OturumAnahtari))
        {
            Response.Headers.Append("X-Session-Key", sepet.OturumAnahtari);
        }

        return Ok(sepet);
    }

    [HttpPut]
    public async Task<IActionResult> Guncelle(SepetGuncelleDto dto)
    {
        var (userId, sessionKey) = KimlikCoz();
        var sepet = await _sepetServisi.SepetGuncelleAsync(userId, sessionKey, dto);
        return Ok(sepet);
    }

    [HttpDelete("{kalemId}")]
    public async Task<IActionResult> Sil(long kalemId)
    {
        var (userId, sessionKey) = KimlikCoz();
        var sepet = await _sepetServisi.SepettenCikarAsync(userId, sessionKey, kalemId);
        return Ok(sepet);
    }

    [HttpDelete("bosalt")]
    public async Task<IActionResult> Bosalt()
    {
        var (userId, sessionKey) = KimlikCoz();
        await _sepetServisi.SepetiBosaltAsync(userId, sessionKey);
        return Ok();
    }
}
