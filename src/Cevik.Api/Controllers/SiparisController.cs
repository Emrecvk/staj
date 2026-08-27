using System.Security.Claims;
using System.Threading.Tasks;
using Cevik.Uygulama.Siparis.Arayuzler;
using Cevik.Uygulama.Siparis.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SiparisController : ControllerBase
{
    private readonly ISiparisServisi _siparisServisi;

    public SiparisController(ISiparisServisi siparisServisi)
    {
        _siparisServisi = siparisServisi;
    }

    private long GetUserId()
    {
        return long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }

    private string? GetSessionKey()
    {
        Request.Headers.TryGetValue("X-Session-Key", out var sessionKey);
        return sessionKey.ToString();
    }

    [HttpGet]
    [ProducesResponseType(typeof(Cevik.Uygulama.Ortak.SayfaliSonucDto<SiparisListelemeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<Cevik.Uygulama.Ortak.SayfaliSonucDto<SiparisListelemeDto>>> SiparisleriGetir(
        [FromQuery] int sayfaNo = 1,
        [FromQuery] int sayfaBoyutu = 25)
    {
        var siparisler = await _siparisServisi.SiparisleriGetirAsync(GetUserId(), sayfaNo, sayfaBoyutu);
        return Ok(siparisler);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SiparisDetayDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SiparisDetayDto>> SiparisDetayGetir(long id)
    {
        var siparis = await _siparisServisi.SiparisDetayGetirAsync(GetUserId(), id);
        if (siparis == null) return NotFound();
        return Ok(siparis);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SiparisDetayDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<SiparisDetayDto>> SiparisOlustur(SiparisOlusturDto dto)
    {
        var sonuc = await _siparisServisi.SiparisOlusturAsync(GetUserId(), GetSessionKey(), dto);
        if (sonuc == null) return BadRequest("Sipariş oluşturulamadı. Adreslerinizi ve sepetinizi kontrol edin.");
        return Ok(sonuc);
    }
}
