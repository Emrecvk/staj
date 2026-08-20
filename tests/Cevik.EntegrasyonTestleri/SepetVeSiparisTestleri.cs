using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Cevik.Uygulama.Kimlik.Dto;
using Cevik.Uygulama.Siparis.Dto;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace Cevik.EntegrasyonTestleri;

/// <summary>
/// Uçtan uca satın alma akışı: sepet kuralları, misafir sepeti birleştirme,
/// stok düşme ve sipariş tutar hesabı.
/// </summary>
[Collection("Api")]
public class SepetVeSiparisTestleri
{
    private readonly CevikUygulamaFabrikasi _fabrika;
    private readonly HttpClient _istemci;

    private static readonly JsonSerializerOptions JsonAyarlari = new(JsonSerializerDefaults.Web);

    public SepetVeSiparisTestleri(CevikUygulamaFabrikasi fabrika)
    {
        _fabrika = fabrika;
        _istemci = fabrika.CreateClient();
    }

    private record AmbalajBilgisi(long Id, int Moq, int Katlama, int Stok);

    /// <summary>Kuralları rahat sağlayan (MOQ ve katlama = 1) stoklu bir ambalaj bul.</summary>
    private Task<AmbalajBilgisi> KolayAmbalajBulAsync(int enAzStok = 50) =>
        _fabrika.Veritabaniyla(db => db.UrunAmbalajlari
            .Where(a => a.Moq == 1 && a.KatlamaMiktari == 1 && a.StokMiktari >= enAzStok)
            .OrderBy(a => a.Id)
            .Select(a => new AmbalajBilgisi(a.Id, a.Moq, a.KatlamaMiktari, a.StokMiktari))
            .FirstAsync());

    // -----------------------------------------------------------------------
    // Sepet kuralları
    // -----------------------------------------------------------------------

    [Fact]
    public async Task MisafirSepetineEkleme_Calisir()
    {
        var ambalaj = await KolayAmbalajBulAsync();
        var oturum = Guid.NewGuid().ToString("N");

        var sepet = await SepeteEkleAsync(oturum, ambalaj.Id, 10);

        sepet.Kalemler.Should().ContainSingle();
        sepet.Kalemler[0].Miktar.Should().Be(10);
        sepet.Kalemler[0].BirimFiyat.Should().BeGreaterThan(0, "kademeli fiyat okunmalı");
        sepet.GenelToplam.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task MoqAltiMiktar_422Doner()
    {
        // MOQ'su 1'den büyük bir ambalaj bul (ör. Tape & Reel).
        var ambalaj = await _fabrika.Veritabaniyla(db => db.UrunAmbalajlari
            .Where(a => a.Moq > 100 && a.StokMiktari > 0)
            .OrderBy(a => a.Id)
            .Select(a => new AmbalajBilgisi(a.Id, a.Moq, a.KatlamaMiktari, a.StokMiktari))
            .FirstAsync());

        var yanit = await _istemci.SendAsync(SepetIstegi(
            Guid.NewGuid().ToString("N"), ambalaj.Id, 1));

        yanit.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity,
            "MOQ altındaki miktar iş kuralı ihlalidir, 500 değil 422 dönmeli");

        var govde = await yanit.Content.ReadAsStringAsync();
        govde.Should().Contain(ambalaj.Moq.ToString(), "hata mesajı doğru MOQ değerini söylemeli");
    }

    [Fact]
    public async Task StokUstuMiktar_422Doner()
    {
        var ambalaj = await KolayAmbalajBulAsync();

        var yanit = await _istemci.SendAsync(SepetIstegi(
            Guid.NewGuid().ToString("N"), ambalaj.Id, ambalaj.Stok + 1000));

        yanit.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task KademeliFiyat_MiktarArttikcaDuser()
    {
        var ambalaj = await KolayAmbalajBulAsync(enAzStok: 1200);

        var azSepet = await SepeteEkleAsync(Guid.NewGuid().ToString("N"), ambalaj.Id, 1);
        var cokSepet = await SepeteEkleAsync(Guid.NewGuid().ToString("N"), ambalaj.Id, 1000);

        cokSepet.Kalemler[0].BirimFiyat.Should().BeLessThan(azSepet.Kalemler[0].BirimFiyat,
            "1000 adette birim fiyat 1 adetten düşük olmalı");
    }

    [Fact]
    public async Task MisafirSepeti_GirisSonrasiKullaniciSepetiyleBirlesir()
    {
        // PLANLAMA.md'nin özellikle uyardığı senaryo.
        var ambalaj = await KolayAmbalajBulAsync();
        var oturum = Guid.NewGuid().ToString("N");

        await SepeteEkleAsync(oturum, ambalaj.Id, 5);

        var eposta = $"birlesme.{Guid.NewGuid():N}@test.com";
        var token = await MusteriTokeniAlAsync(eposta);

        // Aynı oturum anahtarıyla, artık giriş yapmış olarak sepeti oku.
        using var istek = new HttpRequestMessage(HttpMethod.Get, "/api/sepet");
        istek.Headers.Add("X-Session-Key", oturum);
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var yanit = await _istemci.SendAsync(istek);
        yanit.EnsureSuccessStatusCode();

        var sepet = await yanit.Content.ReadFromJsonAsync<SepetDto>(JsonAyarlari);

        sepet!.Kalemler.Should().ContainSingle("misafirken eklenen ürün giriş sonrası kaybolmamalı");
        sepet.Kalemler[0].Miktar.Should().Be(5);
    }

    // -----------------------------------------------------------------------
    // Sipariş
    // -----------------------------------------------------------------------

    [Fact]
    public async Task SiparisOlusturma_StokDuser_VeTutarlarDogruHesaplanir()
    {
        var ambalaj = await KolayAmbalajBulAsync(enAzStok: 100);
        const int miktar = 20;

        var eposta = $"siparis.{Guid.NewGuid():N}@test.com";
        var token = await MusteriTokeniAlAsync(eposta);
        var oturum = Guid.NewGuid().ToString("N");

        var stokOncesi = await StokOkuAsync(ambalaj.Id);

        await SepeteEkleAsync(oturum, ambalaj.Id, miktar, token);
        var adresId = await AdresEkleAsync(token);

        using var istek = new HttpRequestMessage(HttpMethod.Post, "/api/siparis")
        {
            Content = JsonContent.Create(new
            {
                faturaAdresiId = adresId,
                teslimatAdresiId = adresId,
                musteriNotu = "Entegrasyon testi"
            })
        };
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        istek.Headers.Add("X-Session-Key", oturum);

        var yanit = await _istemci.SendAsync(istek);
        yanit.EnsureSuccessStatusCode();

        var siparis = await yanit.Content.ReadFromJsonAsync<SiparisDetayDto>(JsonAyarlari);

        siparis.Should().NotBeNull();
        siparis!.SiparisNo.Should().StartWith("SIP-", "sipariş numarası formatı SIP-YYYY-NNNNNN olmalı");
        siparis.Kalemler.Should().ContainSingle();

        // KDV oranı yapılandırmadan (%20) gelmeli.
        siparis.KdvTutari.Should().BeApproximately(siparis.AraToplam * 0.20m, 0.01m);
        siparis.GenelToplam.Should().BeApproximately(
            siparis.AraToplam + siparis.KdvTutari + siparis.KargoUcreti, 0.01m);

        var stokSonrasi = await StokOkuAsync(ambalaj.Id);
        stokSonrasi.Should().Be(stokOncesi - miktar, "sipariş stoğu düşürmeli");

        // Sepet boşalmalı.
        using var sepetIstegi = new HttpRequestMessage(HttpMethod.Get, "/api/sepet");
        sepetIstegi.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        sepetIstegi.Headers.Add("X-Session-Key", oturum);

        var sepet = await (await _istemci.SendAsync(sepetIstegi))
            .Content.ReadFromJsonAsync<SepetDto>(JsonAyarlari);

        sepet!.Kalemler.Should().BeEmpty("sipariş sonrası sepet boşalmalı");
    }

    [Fact]
    public async Task BaskasininAdresiyleSiparis_403Doner()
    {
        var ambalaj = await KolayAmbalajBulAsync();

        var kurbanToken = await MusteriTokeniAlAsync($"kurban.{Guid.NewGuid():N}@test.com");
        var kurbanAdresId = await AdresEkleAsync(kurbanToken);

        var saldirganToken = await MusteriTokeniAlAsync($"saldirgan.{Guid.NewGuid():N}@test.com");
        var oturum = Guid.NewGuid().ToString("N");
        await SepeteEkleAsync(oturum, ambalaj.Id, 5, saldirganToken);

        using var istek = new HttpRequestMessage(HttpMethod.Post, "/api/siparis")
        {
            Content = JsonContent.Create(new
            {
                faturaAdresiId = kurbanAdresId,
                teslimatAdresiId = kurbanAdresId
            })
        };
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", saldirganToken);
        istek.Headers.Add("X-Session-Key", oturum);

        var yanit = await _istemci.SendAsync(istek);

        yanit.StatusCode.Should().Be(HttpStatusCode.Forbidden,
            "başka kullanıcının adresiyle sipariş verilememeli");
    }

    [Fact]
    public async Task BosSepetleSiparis_422Doner()
    {
        var token = await MusteriTokeniAlAsync($"bossepet.{Guid.NewGuid():N}@test.com");
        var adresId = await AdresEkleAsync(token);

        using var istek = new HttpRequestMessage(HttpMethod.Post, "/api/siparis")
        {
            Content = JsonContent.Create(new { faturaAdresiId = adresId, teslimatAdresiId = adresId })
        };
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        istek.Headers.Add("X-Session-Key", Guid.NewGuid().ToString("N"));

        (await _istemci.SendAsync(istek)).StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }

    // -----------------------------------------------------------------------
    // Yardımcılar
    // -----------------------------------------------------------------------

    private HttpRequestMessage SepetIstegi(string oturum, long ambalajId, int miktar, string? token = null)
    {
        var istek = new HttpRequestMessage(HttpMethod.Post, "/api/sepet")
        {
            Content = JsonContent.Create(new { urunAmbalajId = ambalajId, miktar })
        };
        istek.Headers.Add("X-Session-Key", oturum);

        if (token is not null)
            istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        return istek;
    }

    private async Task<SepetDto> SepeteEkleAsync(string oturum, long ambalajId, int miktar, string? token = null)
    {
        var yanit = await _istemci.SendAsync(SepetIstegi(oturum, ambalajId, miktar, token));
        yanit.EnsureSuccessStatusCode();
        return (await yanit.Content.ReadFromJsonAsync<SepetDto>(JsonAyarlari))!;
    }

    private Task<int> StokOkuAsync(long ambalajId) =>
        _fabrika.Veritabaniyla(db => db.UrunAmbalajlari
            .Where(a => a.Id == ambalajId)
            .Select(a => a.StokMiktari)
            .FirstAsync());

    private async Task<long> AdresEkleAsync(string token)
    {
        using var istek = new HttpRequestMessage(HttpMethod.Post, "/api/profil/adresler")
        {
            Content = JsonContent.Create(new
            {
                baslik = "Ofis",
                sehir = "İstanbul",
                ilce = "Ümraniye",
                postaKodu = "34775",
                acikAdres = "Test Mahallesi, Deneme Caddesi No: 42 Kat: 3",
                faturaAdresiMi = true
            })
        };
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var yanit = await _istemci.SendAsync(istek);
        yanit.EnsureSuccessStatusCode();

        // Uç adres listesini veya tek adresi dönebilir; id'yi veritabanından teyit ediyoruz.
        var kullaniciId = KullaniciIdCoz(token);

        return await _fabrika.Veritabaniyla(db => db.Adresler
            .Where(a => a.KullaniciId == kullaniciId)
            .OrderByDescending(a => a.Id)
            .Select(a => a.Id)
            .FirstAsync());
    }

    private static long KullaniciIdCoz(string token)
    {
        var jwt = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().ReadJwtToken(token);
        var talep = jwt.Claims.First(c => c.Type is "nameid"
            or "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
        return long.Parse(talep.Value);
    }

    private async Task<string> MusteriTokeniAlAsync(string eposta)
    {
        const string parola = "Sifre12345";

        await _istemci.PostAsJsonAsync("/api/kimlik/kayit", new
        {
            ad = "Test", soyad = "Musteri", eposta,
            telefon = "05551112233", sifre = parola
        });

        var yanit = await _istemci.PostAsJsonAsync("/api/kimlik/giris", new { eposta, sifre = parola });
        yanit.EnsureSuccessStatusCode();

        var token = await yanit.Content.ReadFromJsonAsync<TokenDto>(JsonAyarlari);
        return token!.AccessToken;
    }
}
