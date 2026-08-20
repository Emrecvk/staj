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
    public async Task<IActionResult> SiparisleriGetir()
    {
        var siparisler = await _siparisServisi.SiparisleriGetirAsync(GetUserId());
        return Ok(siparisler);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> SiparisDetayGetir(long id)
    {
        var siparis = await _siparisServisi.SiparisDetayGetirAsync(GetUserId(), id);
        if (siparis == null) return NotFound();
        return Ok(siparis);
    }

    [HttpPost]
    public async Task<IActionResult> SiparisOlustur(SiparisOlusturDto dto)
    {
        var sonuc = await _siparisServisi.SiparisOlusturAsync(GetUserId(), GetSessionKey(), dto);
        if (sonuc == null) return BadRequest("Sipariş oluşturulamadı. Adreslerinizi ve sepetinizi kontrol edin.");
        return Ok(sonuc);
    }
}
