using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Cevik.Alan.Kimlik;
using Cevik.Uygulama.Katalog.Dto;
using Cevik.Uygulama.Kimlik.Dto;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using System.Collections.Generic;

namespace Cevik.EntegrasyonTestleri;

[Collection("SiralamaGerektirmeyenler")]
public class KatalogIliskilerTestleri : IClassFixture<CevikUygulamaFabrikasi>
{
    private readonly CevikUygulamaFabrikasi _fabrika;

    public KatalogIliskilerTestleri(CevikUygulamaFabrikasi fabrika)
    {
        _fabrika = fabrika;
    }

    [Fact]
    public async Task Karsilastirma_Listesine_UrunEkleme_Misafir_Basarili()
    {
        var istemci = _fabrika.CreateClient();
        istemci.DefaultRequestHeaders.Add("X-Session-Key", "test-session-123");

        // DB'den rastgele urun bul
        using var scope = _fabrika.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
        var urun = await db.Urunler.FirstAsync();

        // 1. Karsilastirmaya Ekle
        var yanitEkle = await istemci.PostAsync($"/api/katalog/karsilastirma/{urun.Id}", null);
        yanitEkle.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // 2. Karsilastirma Listesini Getir
        var yanitListe = await istemci.GetFromJsonAsync<KarsilastirmaSonucDto>("/api/katalog/karsilastirma");
        yanitListe.Should().NotBeNull();
        yanitListe!.Urunler.Should().ContainSingle(u => u.UrunId == urun.Id);

        // 3. Karsilastirmadan Cikar
        var yanitCikar = await istemci.DeleteAsync($"/api/katalog/karsilastirma/{urun.Id}");
        yanitCikar.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // 4. Tekrar Getir ve Bos Oldugunu Dogrula
        var yanitListe2 = await istemci.GetFromJsonAsync<KarsilastirmaSonucDto>("/api/katalog/karsilastirma");
        yanitListe2!.Urunler.Should().BeEmpty();
    }

    [Fact]
    public async Task FirmaYetkilisi_MusteriUrunKodu_Crud_Basarili()
    {
        var eposta = "firma@test.com";
        var parola = "Sifre12345";
        var istemci = _fabrika.CreateClient();

        // Firma kullanıcısı oluştur ve token al
        await istemci.PostAsJsonAsync("/api/kimlik/kayit", new
        {
            ad = "Firma",
            soyad = "Yetkili",
            eposta = eposta,
            telefon = "05551112233",
            sifre = parola
        });

        // Manuel firma yetkisi atayalım DB'den
        using (var scope = _fabrika.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            var user = await db.Kullanicilar.FirstOrDefaultAsync(k => k.Eposta == eposta);
            if (user != null)
            {
                var firma = new Cevik.Alan.Kimlik.Firma { Unvan = "Test Firmasi", VergiDairesi = "VD", VergiNo = "1234567890", OnayDurumu = Cevik.Alan.Ortak.FirmaOnayDurumu.Onaylandi };
                db.Firmalar.Add(firma);
                await db.SaveChangesAsync();

                user.FirmaYetkilisiMi = true;
                user.FirmaId = firma.Id;
                await db.SaveChangesAsync();
            }
        }

        var girisYaniti = await istemci.PostAsJsonAsync("/api/kimlik/giris", new { eposta, sifre = parola });
        girisYaniti.EnsureSuccessStatusCode();
        var token = (await girisYaniti.Content.ReadFromJsonAsync<TokenDto>())!.AccessToken;

        istemci.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        using var scope2 = _fabrika.Services.CreateScope();
        var db2 = scope2.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
        var urun = await db2.Urunler.FirstAsync();

        // 1. Ekle
        var ekleDto = new MusteriUrunKoduEkleDto { UrunId = urun.Id, MusteriKodu = "MCODE-001", Aciklama = "Bizim kod" };
        var yanitEkle = await istemci.PostAsJsonAsync("/api/profil/musteri-urun-kodlari", ekleDto);
        yanitEkle.StatusCode.Should().Be(HttpStatusCode.OK);
        var eklenen = await yanitEkle.Content.ReadFromJsonAsync<MusteriUrunKoduDto>();
        eklenen.Should().NotBeNull();
        eklenen!.MusteriKodu.Should().Be("MCODE-001");

        // 2. Listele
        var yanitListe = await istemci.GetFromJsonAsync<Cevik.Uygulama.Ortak.SayfaliSonucDto<MusteriUrunKoduDto>>(
            "/api/profil/musteri-urun-kodlari");
        yanitListe!.Kayitlar.Should().Contain(m => m.Id == eklenen.Id && m.MusteriKodu == "MCODE-001");

        // 3. Guncelle
        var guncelleDto = new MusteriUrunKoduGuncelleDto { MusteriKodu = "MCODE-002", Aciklama = "Guncel kod" };
        var yanitGuncelle = await istemci.PutAsJsonAsync($"/api/profil/musteri-urun-kodlari/{eklenen.Id}", guncelleDto);
        yanitGuncelle.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // 4. Sil
        var yanitSil = await istemci.DeleteAsync($"/api/profil/musteri-urun-kodlari/{eklenen.Id}");
        yanitSil.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
}
