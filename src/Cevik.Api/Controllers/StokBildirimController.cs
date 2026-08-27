using System.Security.Claims;
using Cevik.Uygulama.Katalog.Arayuzler;
using Cevik.Uygulama.Katalog.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/katalog")]
public class StokBildirimController : ControllerBase
{
    private readonly IStokBildirimServisi _servis;
    public StokBildirimController(IStokBildirimServisi servis) => _servis = servis;

    /// <summary>
    /// Uç bilerek anonime açıktır (ziyaretçi haber almak için üye olmak
    /// zorunda değil), ama bu yüzden ORAN SINIRI şart: sınırsız hâliyle
    /// üçüncü kişilerin adresleri sınırsızca kaydedilebiliyor, arka plan
    /// işleyicisi de stok gelince onlara site adına posta atıyordu —
    /// istenmeyen posta rölesi. Adres biçimi
    /// <c>StokBildirimTalebiDtoValidator</c> ile doğrulanır.
    /// </summary>
    [HttpPost("urunler/ambalajlar/{ambalajId:long}/stok-bildirimi")]
    [EnableRateLimiting("Auth")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> StokBildirimiOlustur(long ambalajId, StokBildirimTalebiDto dto)
    {
        var kullaniciId = long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id)
            ? id
            : (long?)null;
        await _servis.OlusturAsync(ambalajId, kullaniciId, dto);
        return NoContent();
    }
}
