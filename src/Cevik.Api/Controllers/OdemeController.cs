using System.Security.Claims;
using Cevik.Uygulama.Odemeler.Arayuzler;
using Cevik.Uygulama.Odemeler.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Cevik.Api.Controllers;

/// <summary>
/// Sipariş ödemesi.
///
/// Kart bilgisi bu API'ye HIC gelmez: istemci sağlayıcıdan tek kullanımlık
/// jeton alır, buraya yalnızca o jetonu gönderir. Sandbox ortamında jeton,
/// denenmek istenen senaryonun anahtarıdır.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OdemeController : ControllerBase
{
    private readonly IOdemeServisi _odemeServisi;

    public OdemeController(IOdemeServisi odemeServisi) => _odemeServisi = odemeServisi;

    private long KullaniciId() =>
        long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 0;

    /// <summary>
    /// Oran sınırlaması bilinçli: ödeme uçları kart deneme (carding)
    /// saldırılarının hedefidir.
    /// </summary>
    [EnableRateLimiting("Auth")]
    [HttpPost("{siparisId:long}")]
    public async Task<IActionResult> Ode(long siparisId, OdemeIstekDto istek)
    {
        var yanit = await _odemeServisi.OdemeYapAsync(KullaniciId(), siparisId, istek);

        // Basarisiz odeme bir SUNUCU hatasi degil; 200 ile birlikte yapisal
        // sonuc doner ki istemci "yeniden dene" akisini yonetebilsin.
        return Ok(yanit);
    }

    [HttpGet("{siparisId:long}/denemeler")]
    public async Task<IActionResult> Denemeler(long siparisId)
        => Ok(await _odemeServisi.DenemeleriGetirAsync(KullaniciId(), siparisId));
}
