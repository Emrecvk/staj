using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Cevik.Uygulama.Katalog.Dto;
using Cevik.Uygulama.Icerik.Dto;
using FluentAssertions;
using Xunit;
using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

namespace Cevik.EntegrasyonTestleri;

[Collection("SiralamaGerektirmeyenler")]
public class YerellestirmeVeIcerikTestleri : IClassFixture<CevikUygulamaFabrikasi>
{
    private readonly CevikUygulamaFabrikasi _fabrika;
    private readonly System.Net.Http.HttpClient _istemci;

    public YerellestirmeVeIcerikTestleri(CevikUygulamaFabrikasi fabrika)
    {
        _fabrika = fabrika;
        _istemci = fabrika.CreateClient();
    }

    [Fact]
    public async Task KategoriDetay_DilTercihineGore_Degisir()
    {
        // 1. Türkçe
        var yanitTr = await _istemci.GetFromJsonAsync<KategoriDetayDto>("/api/katalog/kategoriler/mikrodenetleyiciler?dil=tr");
        yanitTr.Should().NotBeNull();
        yanitTr!.Ad.Should().Be("Mikrodenetleyiciler");

        // 2. İngilizce
        var yanitEn = await _istemci.GetFromJsonAsync<KategoriDetayDto>("/api/katalog/kategoriler/mikrodenetleyiciler?dil=en");
        yanitEn.Should().NotBeNull();
        yanitEn!.Ad.Should().Be("Microcontrollers");

        // 3. Geçersiz Dil -> Varsayılan (tr)
        var yanitBozuk = await _istemci.GetFromJsonAsync<KategoriDetayDto>("/api/katalog/kategoriler/mikrodenetleyiciler?dil=fr");
        yanitBozuk!.Ad.Should().Be("Mikrodenetleyiciler");
    }

    [Fact]
    public async Task UrunListeleme_Fiyatlar_KurIleDonusur()
    {
        var yanitUsd = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>("/api/katalog/urunler?kategoriId=1&paraBirimi=USD");
        var yanitTry = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>("/api/katalog/urunler?kategoriId=1&paraBirimi=TRY");
        
        yanitUsd.Should().NotBeNull();
        yanitTry.Should().NotBeNull();
        
        var urunUsd = yanitUsd!.Urunler.Kayitlar.FirstOrDefault();
        var urunTry = yanitTry!.Urunler.Kayitlar.FirstOrDefault(u => u.Id == urunUsd?.Id);
        
        urunUsd.Should().NotBeNull();
        urunTry.Should().NotBeNull();

        // USD 1 ise, TRY kuru 34.12 civarıdır (seed verisine göre), TRY fiyatı her zaman USD'den büyük olmalı
        urunTry!.BaslangicFiyati.Should().BeGreaterThan(urunUsd!.BaslangicFiyati);
    }

    [Fact]
    public async Task PublicIcerik_Blog_SaltOkunur_Basarili()
    {
        // Veritabanında yayınlanmış bir blog yazısı olduğunu garantilemek için scope kullanalım
        using (var scope = _fabrika.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            if (!await db.BlogYazilari.AnyAsync(b => b.Slug == "test-blog"))
            {
                db.BlogYazilari.Add(new Cevik.Alan.Icerik.BlogYazisi 
                { 
                    Baslik = "Test Blog", 
                    Slug = "test-blog", 
                    Ozet = "Ozet", 
                    IcerikHtml = "<p>Html</p>", 
                    YayinTarihi = System.DateTimeOffset.UtcNow.AddDays(-1) 
                });
                await db.SaveChangesAsync();
            }
        }

        // Listeleme Testi
        var listeYanit = await _istemci.GetAsync("/api/icerik/blog");
        listeYanit.StatusCode.Should().Be(HttpStatusCode.OK);
        var liste = await listeYanit.Content.ReadFromJsonAsync<List<PublicBlogOzetDto>>();
        liste.Should().NotBeEmpty();

        // Detay Testi
        var detayYanit = await _istemci.GetAsync("/api/icerik/blog/test-blog");
        detayYanit.StatusCode.Should().Be(HttpStatusCode.OK);
        var detay = await detayYanit.Content.ReadFromJsonAsync<PublicBlogDetayDto>();
        detay.Should().NotBeNull();
        detay!.Baslik.Should().Be("Test Blog");
    }

    [Fact]
    public async Task PublicIcerik_Sayfa_DilTercihineGore_Degisir()
    {
        using (var scope = _fabrika.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            if (!await db.Sayfalar.AnyAsync(s => s.Slug == "hakkimizda"))
            {
                db.Sayfalar.Add(new Cevik.Alan.Icerik.Sayfa 
                { 
                    Slug = "hakkimizda", 
                    BaslikTr = "Hakkımızda", 
                    BaslikEn = "About Us", 
                    IcerikHtmlTr = "İçerik", 
                    IcerikHtmlEn = "Content", 
                    YayindaMi = true 
                });
                await db.SaveChangesAsync();
            }
        }

        // Türkçe Testi
        var yanitTr = await _istemci.GetFromJsonAsync<PublicSayfaDto>("/api/icerik/sayfalar/hakkimizda?dil=tr");
        yanitTr.Should().NotBeNull();
        yanitTr!.Baslik.Should().Be("Hakkımızda");

        // İngilizce Testi
        var yanitEn = await _istemci.GetFromJsonAsync<PublicSayfaDto>("/api/icerik/sayfalar/hakkimizda?dil=en");
        yanitEn.Should().NotBeNull();
        yanitEn!.Baslik.Should().Be("About Us");
    }
}
