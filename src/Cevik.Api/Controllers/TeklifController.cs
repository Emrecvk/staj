using System.Security.Claims;
using System.Threading.Tasks;
using Cevik.Uygulama.Teklif.Arayuzler;
using Cevik.Uygulama.Teklif.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TeklifController : ControllerBase
{
    private readonly ITeklifServisi _teklifServisi;

    public TeklifController(ITeklifServisi teklifServisi)
    {
        _teklifServisi = teklifServisi;
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
    public async Task<IActionResult> TeklifleriGetir()
    {
        var teklifler = await _teklifServisi.TeklifleriGetirAsync(GetUserId());
        return Ok(teklifler);
    }

    [HttpPost]
    public async Task<IActionResult> TeklifOlustur(TeklifOlusturDto dto)
    {
        var isFirma = User.FindFirst("FirmaYetkilisi")?.Value;
        if (isFirma != "True") return Forbid("Sadece firmalar teklif talebinde bulunabilir.");

        var sonuc = await _teklifServisi.TeklifTalebiOlusturAsync(GetUserId(), GetSessionKey(), dto);
        if (sonuc == null) return BadRequest("Teklif oluşturulamadı. Sepetinizi kontrol edin.");
        return Ok(sonuc);
    }
}
