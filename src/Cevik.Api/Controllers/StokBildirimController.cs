using System.Security.Claims;
using Cevik.Alan.Fiyatlama;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Katalog.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/katalog")]
public class StokBildirimController : ControllerBase
{
    private readonly CevikDbContext _context;

    public StokBildirimController(CevikDbContext context)
    {
        _context = context;
    }

    [HttpPost("urunler/ambalajlar/{ambalajId}/stok-bildirimi")]
    public async Task<IActionResult> StokBildirimiOlustur(long ambalajId, [FromBody] StokBildirimTalebiDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Eposta))
            return BadRequest("E-posta adresi zorunludur.");

        var ambalajVarMi = await _context.UrunAmbalajlari.AnyAsync(a => a.Id == ambalajId);
        if (!ambalajVarMi) return NotFound("Ambalaj bulunamadı.");

        long? kullaniciId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim != null && long.TryParse(idClaim.Value, out var id))
                kullaniciId = id;
        }

        var mevcutBildirim = await _context.StokBildirimleri
            .AnyAsync(sb => sb.UrunAmbalajId == ambalajId && sb.Eposta == dto.Eposta && !sb.BildirildiMi);

        if (mevcutBildirim)
            return Conflict("Bu ürün için zaten bekleyen bir stok bildirim talebiniz bulunmaktadır.");

        var yeniBildirim = new StokBildirimi
        {
            UrunAmbalajId = ambalajId,
            Eposta = dto.Eposta,
            KullaniciId = kullaniciId,
            IstenenMiktar = dto.IstenenMiktar,
            BildirildiMi = false
        };

        _context.StokBildirimleri.Add(yeniBildirim);
        await _context.SaveChangesAsync();

        return Ok("Stok bildirimi başarıyla oluşturuldu.");
    }
}
