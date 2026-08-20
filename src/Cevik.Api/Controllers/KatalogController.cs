using System.Threading.Tasks;
using Cevik.Uygulama.Katalog.Arayuzler;
using Cevik.Uygulama.Katalog.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KatalogController : ControllerBase
{
    private readonly IKatalogServisi _katalogServisi;

    public KatalogController(IKatalogServisi katalogServisi)
    {
        _katalogServisi = katalogServisi;
    }

    [HttpGet("kategoriler/agac")]
    public async Task<IActionResult> KategoriAgaciniGetir()
    {
        var sonuc = await _katalogServisi.KategoriAgaciniGetirAsync();
        return Ok(sonuc);
    }

    [HttpGet("kategoriler/{slug}")]
    public async Task<IActionResult> KategoriDetay(string slug)
    {
        var sonuc = await _katalogServisi.KategoriDetayGetirAsync(slug);
        if (sonuc == null) return NotFound();
        return Ok(sonuc);
    }

    [HttpGet("urunler")]
    public async Task<IActionResult> UrunleriListele([FromQuery] UrunAramaFiltreDto filtre)
    {
        var sonuc = await _katalogServisi.UrunleriListeleAsync(filtre);
        return Ok(sonuc);
    }

    [HttpGet("urunler/{id}")]
    public async Task<IActionResult> UrunDetay(long id)
    {
        var sonuc = await _katalogServisi.UrunDetayGetirAsync(id);
        if (sonuc == null) return NotFound();
        return Ok(sonuc);
    }
}
