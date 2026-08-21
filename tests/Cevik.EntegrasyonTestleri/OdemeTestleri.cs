using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Cevik.Alan.Ortak;
using Cevik.Altyapi.Odemeler.Servisler;
using Cevik.Uygulama.Kimlik.Dto;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace Cevik.EntegrasyonTestleri;

/// <summary>
/// Sandbox ödeme akışı.
///
/// Önceki sürümde ödeme tamamen tarayıcıdaydı: <c>Math.random() &lt; 0.20</c>
/// ile rastgele ret üretiliyor, sunucuda hiçbir kayıt oluşmuyordu. Bu testler
/// ödemenin gerçekten sunucuda gerçekleştiğini, siparişi ilerlettiğini,
/// denemelerin kaydedildiğini ve çift tahsilatın engellendiğini doğrular.
/// </summary>
[Collection("Api")]
public class OdemeTestleri
{
    private readonly CevikUygulamaFabrikasi _fabrika;
    private readonly HttpClient _istemci;

    private static readonly JsonSerializerOptions JsonAyarlari = new(JsonSerializerDefaults.Web);

    public OdemeTestleri(CevikUygulamaFabrikasi fabrika)
    {
        _fabrika = fabrika;
        _istemci = fabrika.CreateClient();
        _istemci.DefaultRequestHeaders.Add("X-Forwarded-For", $"192.168.7.{Random.Shared.Next(1, 255)}");
    }

    [Fact]
    public async Task BasariliOdeme_SiparisiOnaylar_VeKayitOlusturur()
    {
        var (siparisId, token) = await SiparisOlusturAsync();

        var yanit = await OdeAsync(siparisId, token, SandboxOdemeSaglayicisi.BasariliJeton);
        yanit.StatusCode.Should().Be(HttpStatusCode.OK);

        var sonuc = await yanit.Content.ReadFromJsonAsync<JsonElement>();
        sonuc.GetProperty("basarili").GetBoolean().Should().BeTrue();
        sonuc.GetProperty("siparisDurumu").GetInt16().Should().Be((short)SiparisDurumu.Onaylandi);

        var durum = await _fabrika.Veritabaniyla(db => db.Siparisler
            .Where(s => s.Id == siparisId).Select(s => s.Durum).FirstAsync());
        durum.Should().Be(SiparisDurumu.Onaylandi);

        // Odeme kaydi saglayici referansiyla birlikte kalici olmali.
        var odeme = await _fabrika.Veritabaniyla(db => db.Odemeler
            .Where(o => o.SiparisId == siparisId).FirstAsync());

        odeme.Durum.Should().Be("Basarili");
        odeme.Saglayici.Should().Be("Sandbox");
        odeme.SaglayiciReferans.Should().NotBeNullOrEmpty("mutabakat icin saglayici referansi saklanmali");
        odeme.Tutar.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task YetersizBakiye_SiparisiOnaylamaz_VeYenidenDenemeyeIzinVerir()
    {
        var (siparisId, token) = await SiparisOlusturAsync();

        var yanit = await OdeAsync(siparisId, token, SandboxOdemeSaglayicisi.YetersizBakiyeJeton);

        // Basarisiz odeme sunucu hatasi degil: istemci "yeniden dene" akisini
        // yonetebilsin diye 200 ile yapisal sonuc doner.
        yanit.StatusCode.Should().Be(HttpStatusCode.OK);

        var sonuc = await yanit.Content.ReadFromJsonAsync<JsonElement>();
        sonuc.GetProperty("basarili").GetBoolean().Should().BeFalse();
        sonuc.GetProperty("hataKodu").GetString().Should().Be("YETERSIZ_BAKIYE");
        sonuc.GetProperty("yenidenDenenebilir").GetBoolean().Should().BeTrue();

        // Siparis odeme bekliyor durumunda KALMALI ki tekrar denenebilsin.
        var durum = await _fabrika.Veritabaniyla(db => db.Siparisler
            .Where(s => s.Id == siparisId).Select(s => s.Durum).FirstAsync());
        durum.Should().Be(SiparisDurumu.OdemeBekliyor);
    }

    [Fact]
    public async Task KaliciRet_YenidenDenemeyeIzinVermez()
    {
        var (siparisId, token) = await SiparisOlusturAsync();

        var yanit = await OdeAsync(siparisId, token, SandboxOdemeSaglayicisi.ReddedildiJeton);
        var sonuc = await yanit.Content.ReadFromJsonAsync<JsonElement>();

        sonuc.GetProperty("basarili").GetBoolean().Should().BeFalse();
        sonuc.GetProperty("yenidenDenenebilir").GetBoolean().Should().BeFalse(
            "banka kalici ret verdiginde ayni kartla tekrar denemek anlamsiz");
    }

    [Fact]
    public async Task BasarisizDenemeSonrasi_YenidenDeneme_Basarili_Olabilir()
    {
        var (siparisId, token) = await SiparisOlusturAsync();

        await OdeAsync(siparisId, token, SandboxOdemeSaglayicisi.SaglayiciHatasiJeton);
        var ikinci = await OdeAsync(siparisId, token, SandboxOdemeSaglayicisi.BasariliJeton);

        var sonuc = await ikinci.Content.ReadFromJsonAsync<JsonElement>();
        sonuc.GetProperty("basarili").GetBoolean().Should().BeTrue();

        // Her iki deneme de kayitli olmali — denetlenebilirlik icin.
        var denemeler = await _fabrika.Veritabaniyla(db => db.Odemeler
            .Where(o => o.SiparisId == siparisId).ToListAsync());

        denemeler.Should().HaveCount(2);
        denemeler.Should().ContainSingle(o => o.Durum == "Basarili");
        denemeler.Should().ContainSingle(o => o.Durum == "Basarisiz");
    }

    [Fact]
    public async Task OdenmisSiparis_IkinciKezTahsilEdilemez()
    {
        var (siparisId, token) = await SiparisOlusturAsync();

        await OdeAsync(siparisId, token, SandboxOdemeSaglayicisi.BasariliJeton);
        var ikinci = await OdeAsync(siparisId, token, SandboxOdemeSaglayicisi.BasariliJeton);

        ikinci.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity,
            "cift tahsilat is kurali ihlali olarak reddedilmeli");

        var odemeSayisi = await _fabrika.Veritabaniyla(db => db.Odemeler
            .CountAsync(o => o.SiparisId == siparisId && o.Durum == "Basarili"));

        odemeSayisi.Should().Be(1, "musteriden iki kez para cekilmemeli");
    }

    [Fact]
    public async Task BaskasininSiparisi_Odenemez()
    {
        var (siparisId, _) = await SiparisOlusturAsync();
        var yabanciToken = await MusteriTokeniAlAsync($"yabanci.{Guid.NewGuid():N}@test.com");

        var yanit = await OdeAsync(siparisId, yabanciToken, SandboxOdemeSaglayicisi.BasariliJeton);

        yanit.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var odemeVar = await _fabrika.Veritabaniyla(db => db.Odemeler
            .AnyAsync(o => o.SiparisId == siparisId));
        odemeVar.Should().BeFalse();
    }

    [Fact]
    public async Task Odeme_TokensizCagrilamaz()
    {
        var (siparisId, _) = await SiparisOlusturAsync();

        var yanit = await _istemci.PostAsJsonAsync($"/api/odeme/{siparisId}",
            new { odemeJetonu = SandboxOdemeSaglayicisi.BasariliJeton });

        yanit.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // -----------------------------------------------------------------------

    private async Task<HttpResponseMessage> OdeAsync(long siparisId, string token, string jeton)
    {
        using var istek = new HttpRequestMessage(HttpMethod.Post, $"/api/odeme/{siparisId}")
        {
            Content = JsonContent.Create(new { odemeJetonu = jeton, kartSahibi = "Test Kullanici" })
        };
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await _istemci.SendAsync(istek);
    }

    /// <summary>Ödemeye hazır, kendine ait bir sipariş oluşturur.</summary>
    private async Task<(long SiparisId, string Token)> SiparisOlusturAsync()
    {
        var ambalajId = await _fabrika.Veritabaniyla(db => db.UrunAmbalajlari
            .Where(a => a.StokMiktari > 50 && a.Moq <= 5)
            .OrderBy(a => a.Id)
            .Select(a => a.Id)
            .FirstAsync());

        var token = await MusteriTokeniAlAsync($"odeme.{Guid.NewGuid():N}@test.com");
        var oturum = Guid.NewGuid().ToString("N");

        using (var sepetIstegi = new HttpRequestMessage(HttpMethod.Post, "/api/sepet")
        {
            Content = JsonContent.Create(new { urunAmbalajId = ambalajId, miktar = 5 })
        })
        {
            sepetIstegi.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            sepetIstegi.Headers.Add("X-Session-Key", oturum);
            (await _istemci.SendAsync(sepetIstegi)).EnsureSuccessStatusCode();
        }

        var adresId = await AdresEkleAsync(token);

        using var siparisIstegi = new HttpRequestMessage(HttpMethod.Post, "/api/siparis")
        {
            Content = JsonContent.Create(new
            {
                faturaAdresiId = adresId,
                teslimatAdresiId = adresId,
                musteriNotu = "Odeme testi"
            })
        };
        siparisIstegi.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        siparisIstegi.Headers.Add("X-Session-Key", oturum);

        var yanit = await _istemci.SendAsync(siparisIstegi);
        yanit.EnsureSuccessStatusCode();

        var govde = await yanit.Content.ReadFromJsonAsync<JsonElement>();
        return (govde.GetProperty("id").GetInt64(), token);
    }

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
                acikAdres = "Test Mahallesi, Deneme Caddesi No: 42",
                faturaAdresiMi = true
            })
        };
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        (await _istemci.SendAsync(istek)).EnsureSuccessStatusCode();

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
            ad = "Odeme", soyad = "Testi", eposta,
            telefon = "05551112233", sifre = parola
        });

        var yanit = await _istemci.PostAsJsonAsync("/api/kimlik/giris", new { eposta, sifre = parola });
        yanit.EnsureSuccessStatusCode();

        var token = await yanit.Content.ReadFromJsonAsync<TokenDto>(JsonAyarlari);
        return token!.AccessToken;
    }
}
