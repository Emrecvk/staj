using System.Security.Claims;
using Cevik.Uygulama.Yonetim.Arayuzler;
using Cevik.Uygulama.Yonetim.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "YonetimErisimi")]
public class YonetimController : ControllerBase
{
    private readonly IYonetimServisi _yonetimServisi;

    public YonetimController(IYonetimServisi yonetimServisi) => _yonetimServisi = yonetimServisi;

    private long IslemiYapanId() =>
        long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 0;

    // ----- Firma onayı -----

    [HttpGet("firmalar/bekleyen")]
    [ProducesResponseType(typeof(Cevik.Uygulama.Ortak.SayfaliSonucDto<FirmaBasvuruOzetDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> BekleyenFirmalar([FromQuery] int sayfaNo = 1, [FromQuery] int sayfaBoyutu = 50)
        => Ok(await _yonetimServisi.BekleyenFirmalariGetirAsync(sayfaNo, sayfaBoyutu));

    [HttpPut("firma-onay")]
    [ProducesResponseType(typeof(Cevik.Uygulama.Ortak.MesajDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> FirmaOnay(FirmaOnayDto dto)
    {
        var sonuc = await _yonetimServisi.FirmaOnaylaAsync(dto, IslemiYapanId());
        return sonuc ? Ok(new { mesaj = "Firma onay durumu güncellendi." }) : NotFound("Firma bulunamadı.");
    }

    // ----- Sipariş -----

    [HttpGet("siparisler")]
    [ProducesResponseType(typeof(Cevik.Uygulama.Ortak.SayfaliSonucDto<SiparisYonetimOzetDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Siparisler(
        [FromQuery] short? durum,
        [FromQuery] int sayfaNo = 1,
        [FromQuery] int sayfaBoyutu = 50)
        => Ok(await _yonetimServisi.SiparisleriGetirAsync(durum, sayfaNo, sayfaBoyutu));

    [HttpPut("siparis-durum")]
    [ProducesResponseType(typeof(Cevik.Uygulama.Ortak.MesajDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SiparisDurumGuncelle(SiparisDurumGuncelleDto dto)
    {
        // Geçersiz durum geçişi IsKuraliIhlaliException fırlatır ve
        // istek hattında 422'ye çevrilir.
        var sonuc = await _yonetimServisi.SiparisDurumGuncelleAsync(dto, IslemiYapanId());
        return sonuc ? Ok(new { mesaj = "Sipariş durumu güncellendi." }) : NotFound("Sipariş bulunamadı.");
    }

    // ----- Kullanıcı rolleri -----

    [HttpPut("kullanici-rol")]
    [ProducesResponseType(typeof(Cevik.Uygulama.Ortak.MesajDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> KullaniciRolGuncelle(KullaniciRolGuncelleDto dto)
    {
        var sonuc = await _yonetimServisi.KullaniciRolGuncelleAsync(dto);
        return sonuc ? Ok(new { mesaj = "Kullanıcı rolü güncellendi." }) : NotFound("Kullanıcı bulunamadı.");
    }

    // ----- İçerik -----

    [HttpGet("blog")]
    [Authorize(Policy = "IcerikErisimi")]
    [ProducesResponseType(typeof(Cevik.Uygulama.Ortak.SayfaliSonucDto<BlogYazisiDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> BlogGetir([FromQuery] int sayfaNo = 1, [FromQuery] int sayfaBoyutu = 50)
        => Ok(await _yonetimServisi.BlogYazilariGetirAsync(sayfaNo, sayfaBoyutu));

    [HttpPost("blog")]
    [Authorize(Policy = "IcerikErisimi")]
    [ProducesResponseType(typeof(BlogYazisiDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> BlogEkle(BlogYazisiEkleDto dto)
        => Ok(await _yonetimServisi.BlogYazisiEkleAsync(dto));
}
