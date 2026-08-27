using Cevik.Uygulama.Katalog.Arayuzler;
using Cevik.Uygulama.Yonetim.Arayuzler;
using Cevik.Uygulama.Yonetim.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/yonetim/urun")]
[Authorize(Policy = "YonetimErisimi")]
public class UrunYonetimController : ControllerBase
{
    private readonly IKatalogYonetimServisi _servis;
    private readonly IKatalogServisi _katalogServisi;

    public UrunYonetimController(IKatalogYonetimServisi servis, IKatalogServisi katalogServisi)
    {
        _servis = servis;
        _katalogServisi = katalogServisi;
    }

    [HttpGet]
    [ProducesResponseType(typeof(UrunYonetimSayfasiDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UrunYonetimSayfasiDto>> Listele(
        [FromQuery] string? arama,
        [FromQuery] int? kategoriId,
        [FromQuery] bool silinmisleriGoster = false,
        [FromQuery] int sayfaNo = 1,
        [FromQuery] int sayfaBoyutu = 50) =>
        Ok(await _servis.UrunleriListeleAsync(arama, kategoriId, silinmisleriGoster, sayfaNo, sayfaBoyutu));

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(UrunYonetimDetayDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UrunYonetimDetayDto>> Getir(long id)
    {
        var urun = await _servis.UrunGetirAsync(id);
        return urun is null ? NotFound() : Ok(urun);
    }

    [HttpPost]
    [ProducesResponseType(typeof(KimlikDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<KimlikDto>> Ekle(UrunEkleDto dto)
    {
        var sonuc = await _servis.UrunEkleAsync(dto);
        return CreatedAtAction(nameof(Getir), new { id = sonuc.Id }, sonuc);
    }

    [HttpPut("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Guncelle(long id, UrunGuncelleDto dto)
    {
        await _servis.UrunGuncelleAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Sil(long id)
    {
        await _servis.UrunSilAsync(id);
        return NoContent();
    }

    [HttpPost("{id:long}/geri-al")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> GeriAl(long id)
    {
        await _servis.UrunGeriAlAsync(id);
        return NoContent();
    }

    [HttpPut("stok")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> StokGuncelle(StokGuncelleDto dto)
    {
        await _servis.StokGuncelleAsync(dto);
        return NoContent();
    }

    [HttpPut("fiyat")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> FiyatGuncelle(AmbalajFiyatGuncelleDto dto)
    {
        await _servis.FiyatGuncelleAsync(dto);
        return NoContent();
    }

    [HttpPost("{id:long}/iliskili")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> IliskiliUrunEkle(long id, IliskiliUrunEkleDto dto)
    {
        await _katalogServisi.IliskiliUrunEkleAsync(id, dto.IliskiliUrunId, dto.Tip, dto.Sira);
        return NoContent();
    }

    [HttpDelete("{id:long}/iliskili/{iliskiliId:long}/{tip}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> IliskiliUrunSil(long id, long iliskiliId, short tip)
    {
        await _katalogServisi.IliskiliUrunSilAsync(id, iliskiliId, tip);
        return NoContent();
    }
}
