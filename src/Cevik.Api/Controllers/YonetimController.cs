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
    public async Task<IActionResult> BekleyenFirmalar()
        => Ok(await _yonetimServisi.BekleyenFirmalariGetirAsync());

    [HttpPut("firma-onay")]
    public async Task<IActionResult> FirmaOnay(FirmaOnayDto dto)
    {
        var sonuc = await _yonetimServisi.FirmaOnaylaAsync(dto, IslemiYapanId());
        return sonuc ? Ok(new { mesaj = "Firma onay durumu güncellendi." }) : NotFound("Firma bulunamadı.");
    }

    // ----- Sipariş -----

    [HttpGet("siparisler")]
    public async Task<IActionResult> Siparisler(
        [FromQuery] short? durum, [FromQuery] int sayfa = 1, [FromQuery] int boyut = 50)
        => Ok(await _yonetimServisi.SiparisleriGetirAsync(durum, sayfa, boyut));

    [HttpPut("siparis-durum")]
    public async Task<IActionResult> SiparisDurumGuncelle(SiparisDurumGuncelleDto dto)
    {
        // Geçersiz durum geçişi IsKuraliIhlaliException fırlatır ve
        // istek hattında 422'ye çevrilir.
        var sonuc = await _yonetimServisi.SiparisDurumGuncelleAsync(dto, IslemiYapanId());
        return sonuc ? Ok(new { mesaj = "Sipariş durumu güncellendi." }) : NotFound("Sipariş bulunamadı.");
    }

    // ----- Kullanıcı rolleri -----

    [HttpPut("kullanici-rol")]
    public async Task<IActionResult> KullaniciRolGuncelle(KullaniciRolGuncelleDto dto)
    {
        var sonuc = await _yonetimServisi.KullaniciRolGuncelleAsync(dto);
        return sonuc ? Ok(new { mesaj = "Kullanıcı rolü güncellendi." }) : NotFound("Kullanıcı bulunamadı.");
    }

    // ----- İçerik -----

    [HttpGet("blog")]
    [Authorize(Policy = "IcerikErisimi")]
    public async Task<IActionResult> BlogGetir()
        => Ok(await _yonetimServisi.BlogYazilariGetirAsync());

    [HttpPost("blog")]
    [Authorize(Policy = "IcerikErisimi")]
    public async Task<IActionResult> BlogEkle(BlogYazisiEkleDto dto)
        => Ok(await _yonetimServisi.BlogYazisiEkleAsync(dto));
}
