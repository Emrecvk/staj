using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Cevik.Alan.Ortak;
using Cevik.Uygulama.Kimlik.Dto;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Builder;

namespace Cevik.EntegrasyonTestleri;

/// <summary>
/// Bildirilen güvenlik açıklarının kapandığını kanıtlayan testler.
/// Her test, daha önce gerçekten sömürülebilen bir davranışı hedefler.
/// </summary>
[Collection("Api")]
public class GuvenlikTestleri
{
    private readonly CevikUygulamaFabrikasi _fabrika;
    private readonly HttpClient _istemci;

    private static readonly JsonSerializerOptions JsonAyarlari = new(JsonSerializerDefaults.Web);

    public GuvenlikTestleri(CevikUygulamaFabrikasi fabrika)
    {
        _fabrika = fabrika;
        _istemci = fabrika.CreateClient();
    }

    // -----------------------------------------------------------------------
    // Yetkilendirme
    // -----------------------------------------------------------------------

    [Theory]
    [InlineData("GET", "/api/yonetim/firmalar/bekleyen")]
    [InlineData("GET", "/api/yonetim/siparisler")]
    [InlineData("GET", "/api/yonetim/blog")]
    [InlineData("GET", "/api/yonetim/urun")]
    [InlineData("GET", "/api/yonetim/kategori")]
    [InlineData("GET", "/api/yonetim/uretici")]
    [InlineData("GET", "/api/yonetim/ozellik")]
    public async Task YonetimUclari_TokensizErisimde_401Doner(string metot, string yol)
    {
        var yanit = await _istemci.SendAsync(new HttpRequestMessage(new HttpMethod(metot), yol));

        yanit.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            $"{yol} kimliksiz çağrılabilmemeli");
    }

    /// <summary>
    /// YAZMA uçları için 401 kapsamı. Önceki sürümde yalnızca yedi GET ucu
    /// test ediliyordu; bir POST/PUT/DELETE ucuna <c>[Authorize]</c> eklemeyi
    /// unutmak hiçbir testi kırmıyordu — yani en tehlikeli uçlar korumasızdı.
    /// </summary>
    [Theory]
    [InlineData("POST", "/api/yonetim/urun")]
    [InlineData("PUT", "/api/yonetim/urun/1")]
    [InlineData("DELETE", "/api/yonetim/urun/1")]
    [InlineData("PUT", "/api/yonetim/urun/stok")]
    [InlineData("PUT", "/api/yonetim/urun/fiyat")]
    [InlineData("POST", "/api/yonetim/kategori")]
    [InlineData("DELETE", "/api/yonetim/kategori/1")]
    [InlineData("POST", "/api/yonetim/uretici")]
    [InlineData("DELETE", "/api/yonetim/uretici/1")]
    [InlineData("POST", "/api/yonetim/blog")]
    [InlineData("PUT", "/api/Yonetim/siparis-durum")]
    [InlineData("PUT", "/api/Yonetim/kullanici-rol")]
    [InlineData("PUT", "/api/Yonetim/firma-onay")]
    [InlineData("GET", "/api/yonetim/teklifler")]
    public async Task YonetimYazmaUclari_TokensizErisimde_401Doner(string metot, string yol)
    {
        using var istek = new HttpRequestMessage(new HttpMethod(metot), yol)
        {
            Content = JsonContent.Create(new { })
        };

        var yanit = await _istemci.SendAsync(istek);

        yanit.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            $"{metot} {yol} kimliksiz çağrılabilmemeli");
    }

    /// <summary>
    /// Müşteri tokeni yönetim YAZMA uçlarına da girememeli. 401 (kimlik yok)
    /// ile 403 (kimlik var, yetki yok) ayrı hatalar; ikisini de doğrulamak
    /// gerekiyor çünkü politikayı unutmak yalnızca ikincisini bozar.
    /// </summary>
    [Theory]
    [InlineData("POST", "/api/yonetim/urun")]
    [InlineData("PUT", "/api/yonetim/urun/stok")]
    [InlineData("POST", "/api/yonetim/kategori")]
    [InlineData("POST", "/api/yonetim/uretici")]
    [InlineData("PUT", "/api/Yonetim/kullanici-rol")]
    [InlineData("PUT", "/api/Yonetim/firma-onay")]
    public async Task YonetimYazmaUclari_MusteriTokeniyle_403Doner(string metot, string yol)
    {
        var token = await MusteriTokeniAlAsync($"musteri.yazma.{Guid.NewGuid():N}@test.com");

        using var istek = new HttpRequestMessage(new HttpMethod(metot), yol)
        {
            Content = JsonContent.Create(new { })
        };
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var yanit = await _istemci.SendAsync(istek);

        yanit.StatusCode.Should().Be(HttpStatusCode.Forbidden,
            $"{metot} {yol} müşteri rolüne kapalı olmalı");
    }

    [Fact]
    public async Task YonetimUclari_MusteriTokeniyle_403Doner()
    {
        var token = await MusteriTokeniAlAsync("musteri.yetki@test.com");

        using var istek = new HttpRequestMessage(HttpMethod.Get, "/api/yonetim/siparisler");
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var yanit = await _istemci.SendAsync(istek);

        yanit.StatusCode.Should().Be(HttpStatusCode.Forbidden,
            "müşteri rolü yönetim uçlarına erişememeli");
    }

    [Fact]
    public async Task AdminTokeni_YonetimUcunaErisir()
    {
        var token = await AdminTokeniAlAsync();

        using var istek = new HttpRequestMessage(HttpMethod.Get, "/api/yonetim/siparisler");
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var yanit = await _istemci.SendAsync(istek);

        yanit.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // -----------------------------------------------------------------------
    // Rol yükseltme arka kapısı
    // -----------------------------------------------------------------------

    [Fact]
    public async Task YoneticiEpostasiylaKayit_AdminYetkisiVermez()
    {
        // Eski davranış: admin e-postasıyla kayıt olan herkes Admin rolü alıyordu.
        // Aynı adres zaten seed'li olduğu için kayıt reddedilmeli; reddedilmese
        // bile rol Musteri kalmalı.
        var yanit = await _istemci.PostAsJsonAsync("/api/kimlik/kayit", new
        {
            ad = "Sahte",
            soyad = "Yonetici",
            eposta = CevikUygulamaFabrikasi.YoneticiEpostasi,
            telefon = "05550000000",
            sifre = "Sahte12345"
        });

        yanit.StatusCode.Should().NotBe(HttpStatusCode.OK,
            "zaten var olan e-posta ile ikinci kayıt açılmamalı");

        var adminSayisi = await _fabrika.Veritabaniyla(db => db.Kullanicilar
            .CountAsync(k => k.Rol == KullaniciRolu.Admin));

        adminSayisi.Should().Be(1, "sistemde yalnızca seed'lenen tek yönetici olmalı");
    }

    [Fact]
    public async Task YeniKayit_HerZamanMusteriRolunuAlir()
    {
        var eposta = $"rol.testi.{Guid.NewGuid():N}@test.com";

        var yanit = await _istemci.PostAsJsonAsync("/api/kimlik/kayit", new
        {
            ad = "Rol", soyad = "Testi", eposta,
            telefon = "05551112233", sifre = "Sifre12345"
        });

        yanit.EnsureSuccessStatusCode();

        var rol = await _fabrika.Veritabaniyla(db => db.Kullanicilar
            .Where(k => k.Eposta == eposta)
            .Select(k => k.Rol)
            .FirstAsync());

        rol.Should().Be(KullaniciRolu.Musteri);
    }

    // -----------------------------------------------------------------------
    // Parola saklama
    // -----------------------------------------------------------------------

    [Fact]
    public async Task Parola_DuzMetinVeyaTuzsuzHashOlarakSaklanmaz()
    {
        var eposta = $"hash.testi.{Guid.NewGuid():N}@test.com";
        const string parola = "Sifre12345";

        (await _istemci.PostAsJsonAsync("/api/kimlik/kayit", new
        {
            ad = "Hash", soyad = "Testi", eposta,
            telefon = "05551112233", sifre = parola
        })).EnsureSuccessStatusCode();

        var hash = await _fabrika.Veritabaniyla(db => db.Kullanicilar
            .Where(k => k.Eposta == eposta)
            .Select(k => k.SifreHash)
            .FirstAsync());

        hash.Should().NotBe(parola, "parola düz metin saklanmamalı");

        // Tuzsuz SHA-256 çıktısı 64 karakterlik hex olur; ASP.NET Identity
        // PasswordHasher ise tuz+iterasyon içeren, çok daha uzun base64 üretir.
        hash.Length.Should().BeGreaterThan(64, "tuzsuz SHA-256 kullanılmamalı");

        // Aynı parolayla ikinci kullanıcı FARKLI hash almalı (tuz kanıtı).
        var ikinciEposta = $"hash.testi2.{Guid.NewGuid():N}@test.com";
        (await _istemci.PostAsJsonAsync("/api/kimlik/kayit", new
        {
            ad = "Hash", soyad = "Testi2", eposta = ikinciEposta,
            telefon = "05551112233", sifre = parola
        })).EnsureSuccessStatusCode();

        var ikinciHash = await _fabrika.Veritabaniyla(db => db.Kullanicilar
            .Where(k => k.Eposta == ikinciEposta)
            .Select(k => k.SifreHash)
            .FirstAsync());

        ikinciHash.Should().NotBe(hash, "aynı parola farklı tuzla farklı hash üretmeli");
    }

    // -----------------------------------------------------------------------
    // JWT
    // -----------------------------------------------------------------------

    [Fact]
    public async Task UretilenToken_ApiTarafindanKabulEdilir()
    {
        // Eski hata: token üreten servis ile doğrulayan middleware farklı
        // issuer/audience varsayılanına düşüyordu; her giriş "başarılı" görünüp
        // token hiçbir korumalı uçta çalışmıyordu.
        var token = await MusteriTokeniAlAsync($"jwt.testi.{Guid.NewGuid():N}@test.com");

        using var istek = new HttpRequestMessage(HttpMethod.Get, "/api/profil/adresler");
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var yanit = await _istemci.SendAsync(istek);

        yanit.StatusCode.Should().Be(HttpStatusCode.OK,
            "kendi ürettiğimiz token korumalı uçta kabul edilmeli");
    }

    [Fact]
    public async Task BozukToken_401Doner()
    {
        using var istek = new HttpRequestMessage(HttpMethod.Get, "/api/profil/adresler");
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "gecersiz.token.degeri");

        (await _istemci.SendAsync(istek)).StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task YanlisParola_TokenVermez()
    {
        var eposta = $"parola.testi.{Guid.NewGuid():N}@test.com";

        (await _istemci.PostAsJsonAsync("/api/kimlik/kayit", new
        {
            ad = "Parola", soyad = "Testi", eposta,
            telefon = "05551112233", sifre = "Dogru12345"
        })).EnsureSuccessStatusCode();

        var yanit = await _istemci.PostAsJsonAsync("/api/kimlik/giris", new
        {
            eposta, sifre = "Yanlis12345"
        });

        yanit.StatusCode.Should().NotBe(HttpStatusCode.OK);
    }

    // -----------------------------------------------------------------------
    // Firma onayı
    // -----------------------------------------------------------------------

    [Fact]
    public async Task FirmaBasvurusu_OnayOncesindeYetkiVermez()
    {
        var eposta = $"firma.testi.{Guid.NewGuid():N}@test.com";
        var token = await MusteriTokeniAlAsync(eposta);

        using var istek = new HttpRequestMessage(HttpMethod.Post, "/api/kimlik/firma-basvurusu")
        {
            Content = JsonContent.Create(new
            {
                firmaAdi = "Test Elektronik A.Ş.",
                vergiDairesi = "Kadıköy",
                vergiNo = "1234567890"
            })
        };
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        (await _istemci.SendAsync(istek)).EnsureSuccessStatusCode();

        var kullanici = await _fabrika.Veritabaniyla(db => db.Kullanicilar
            .Where(k => k.Eposta == eposta)
            .Select(k => new { k.FirmaYetkilisiMi, k.Rol, k.FirmaId })
            .FirstAsync());

        kullanici.FirmaId.Should().NotBeNull("başvuru firma kaydı oluşturmalı");
        kullanici.FirmaYetkilisiMi.Should().BeFalse("yetki ancak admin onayından sonra verilir");
        kullanici.Rol.Should().Be(KullaniciRolu.Musteri);
    }

    // -----------------------------------------------------------------------
    // Yardımcılar
    // -----------------------------------------------------------------------

    private async Task<string> MusteriTokeniAlAsync(string eposta)
    {
        const string parola = "Sifre12345";

        // Kayıt zaten varsa hata yut, doğrudan girişe geç.
        await _istemci.PostAsJsonAsync("/api/kimlik/kayit", new
        {
            ad = "Test", soyad = "Musteri", eposta,
            telefon = "05551112233", sifre = parola
        });

        return await TokenAlAsync(eposta, parola);
    }

    private Task<string> AdminTokeniAlAsync() =>
        TokenAlAsync(CevikUygulamaFabrikasi.YoneticiEpostasi, CevikUygulamaFabrikasi.YoneticiParolasi);

    private async Task<string> TokenAlAsync(string eposta, string parola)
    {
        var yanit = await _istemci.PostAsJsonAsync("/api/kimlik/giris", new { eposta, sifre = parola });
        yanit.EnsureSuccessStatusCode();

        var token = await yanit.Content.ReadFromJsonAsync<TokenDto>(JsonAyarlari);
        token!.AccessToken.Should().NotBeNullOrWhiteSpace();
        return token.AccessToken;
    }

    // -----------------------------------------------------------------------
    // Oran Sınırlama (Rate Limiting)
    // -----------------------------------------------------------------------

    [Fact]
    public async Task KimlikGiris_OranSinirlamasi_Uygulanir()
    {
        var eposta = $"ratelimit.{Guid.NewGuid():N}@test.com";
        var parola = "YanlisSifre123";
        
        var ozelIstemci = _fabrika.CreateClient();
        ozelIstemci.DefaultRequestHeaders.Remove("X-Forwarded-For");
        ozelIstemci.DefaultRequestHeaders.Add("X-Forwarded-For", "192.168.99.99");

        // Auth politikasının limiti 5 (1 dakikada)
        for (int i = 0; i < 5; i++)
        {
            await ozelIstemci.PostAsJsonAsync("/api/kimlik/giris", new { eposta, sifre = parola });
        }

        // 6. istekte 429 Too Many Requests dönmeli
        var yanit = await ozelIstemci.PostAsJsonAsync("/api/kimlik/giris", new { eposta, sifre = parola });
        
        yanit.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);
    }

    // -----------------------------------------------------------------------
    // Sağlık Kontrolü (Health Check)
    // -----------------------------------------------------------------------

    [Fact]
    public async Task SaglikKontrolu_200OkVeHealthyDoner()
    {
        var yanit = await _istemci.GetAsync("/saglik");

        yanit.StatusCode.Should().Be(HttpStatusCode.OK);

        // Uc artik hangi bagimliligin dustugunu bildiren JSON dondurur.
        // Duz "Healthy" metni PostgreSQL mi Redis mi coktugunu gizliyordu.
        var rapor = await yanit.Content.ReadFromJsonAsync<JsonElement>();

        rapor.GetProperty("durum").GetString().Should().Be("Healthy");

        var kontroller = rapor.GetProperty("kontroller").EnumerateArray().ToList();
        kontroller.Should().HaveCountGreaterThanOrEqualTo(2);

        // Her iki bagimlilik da gercekten yoklanmali ve saglikli olmali.
        kontroller.Select(k => k.GetProperty("ad").GetString())
            .Should().Contain(["postgresql", "redis"]);

        kontroller.Should().OnlyContain(k => k.GetProperty("durum").GetString() == "Healthy");
    }

    // -----------------------------------------------------------------------
    // CORS
    // -----------------------------------------------------------------------

    [Fact]
    public async Task Cors_GecerliOrigin_KabulEdilir()
    {
        using var istek = new HttpRequestMessage(HttpMethod.Options, "/api/kimlik/giris");
        istek.Headers.Add("Origin", "https://test.cevik.com");
        istek.Headers.Add("Access-Control-Request-Method", "POST");

        var yanit = await _istemci.SendAsync(istek);
        
        yanit.IsSuccessStatusCode.Should().BeTrue();
        yanit.Headers.Contains("Access-Control-Allow-Origin").Should().BeTrue();
    }

    // -----------------------------------------------------------------------
    // Problem Details
    // -----------------------------------------------------------------------

    [Fact]
    public async Task ProblemDetails_BozukIsteklerde_GecerliDoner()
    {
        // 400 Bad Request tetiklemek için geçersiz istek gönderelim
        var yanit = await _istemci.PostAsJsonAsync("/api/kimlik/kayit", new
        {
            eposta = "hatali_format",
            telefon = "123",
            sifre = "kisa"
        });

        yanit.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        yanit.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
    }

    [Fact]
    public async Task ProblemDetails_BulunamayanUcta_GecerliDoner()
    {
        var yanit = await _istemci.GetAsync("/api/olmayan-uc-adresi-404");

        yanit.StatusCode.Should().Be(HttpStatusCode.NotFound);
        yanit.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
    }

    [Fact]
    public async Task ProblemDetails_UretimOrtaminda_HassasVeriSizdirmaz()
    {
        // Ozel bir production fabrikasi olustur
        using var uretimFabrikasi = _fabrika.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Production");
        });

        var istemci = uretimFabrikasi.CreateClient();
        var yanit = await istemci.GetAsync("/api/test-hata");

        yanit.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        
        var icerik = await yanit.Content.ReadAsStringAsync();
        icerik.Should().NotContain("Cok gizli sistem hatasi", "Uretim ortaminda istisna detayi veya stack trace sizmamali");
        
        var problemDetails = await yanit.Content.ReadFromJsonAsync<JsonElement>();
        problemDetails.GetProperty("title").GetString().Should().Be("Beklenmeyen bir hata olustu");
        problemDetails.TryGetProperty("detail", out var detail).Should().BeFalse("Detail alani uretimde hic olmamali veya null olmali");
    }

    // -----------------------------------------------------------------------
    // Oran sinirlayici atlatma
    // -----------------------------------------------------------------------

    [Fact]
    public async Task OranSinirlamasi_SahteForwardedForIleAtlatilamaz()
    {
        // Guvenilen proxy YAPILANDIRILMAMIS hali — gercek uretim durusu.
        using var sikiFabrika = _fabrika.WithWebHostBuilder(builder =>
            builder.ConfigureAppConfiguration((_, yapilandirma) =>
                yapilandirma.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ForwardedHeaders:TumProxylereGuven"] = "false"
                })));

        // Uygulamanin ayaga kalkmasini tetikle, sonra etkin secenekleri oku.
        _ = sikiFabrika.CreateClient();
        var secenekler = sikiFabrika.Services
            .GetRequiredService<IOptions<ForwardedHeadersOptions>>().Value;

        // ASIL REGRESYON KORUMASI:
        // Onceki surumde burada KnownProxies.Clear() + KnownIPNetworks.Clear()
        // vardi. Ikisi de bosken ForwardedHeadersMiddleware X-Forwarded-For'u
        // HER kaynaktan kabul eder; oran sinirlayici istemciyi RemoteIpAddress'e
        // gore bolumlendirdigi icin saldirgan her istekte sahte bir IP yazip
        // giris ucundaki 5/dk limitini sinirsiz kez atlayabiliyordu.
        //
        // Allowlist'in DOLU olmasi, forwarded basliginin yalnizca taninan
        // proxy'lerden kabul edildigi anlamina gelir.
        (secenekler.KnownProxies.Count + secenekler.KnownIPNetworks.Count)
            .Should().BeGreaterThan(0,
                "guvenilen proxy listesi bosaltilirsa X-Forwarded-For her kaynaktan kabul edilir");

        // Not: bu senaryo TestServer uzerinden uctan uca gosterilemez.
        // TestServer baglantisi loopback gorunur, loopback ise ASP.NET Core'un
        // varsayilan guvenilen proxy'sidir; yani test istemcisinin forwarded
        // basligi MESRU olarak kabul edilir. Uretimde uzak bir saldirganin
        // baglantisi loopback olmadigi icin baslik yok sayilir.
    }

    [Fact]
    public async Task OranSinirlamasi_GelistirmeKacisKapisi_UretimVarsayilaninda_Kapali()
    {
        // TumProxylereGuven yalnizca gelistirme/test icin acilir; hicbir
        // yapilandirma verilmediginde KAPALI olmalidir.
        using var varsayilanFabrika = _fabrika.WithWebHostBuilder(builder =>
            builder.ConfigureAppConfiguration((_, yapilandirma) =>
                yapilandirma.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ForwardedHeaders:TumProxylereGuven"] = null
                })));

        _ = varsayilanFabrika.CreateClient();
        var secenekler = varsayilanFabrika.Services
            .GetRequiredService<IOptions<ForwardedHeadersOptions>>().Value;

        (secenekler.KnownProxies.Count + secenekler.KnownIPNetworks.Count)
            .Should().BeGreaterThan(0);
    }
}
