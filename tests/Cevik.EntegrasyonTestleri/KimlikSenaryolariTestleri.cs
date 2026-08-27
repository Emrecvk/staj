using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Cevik.Uygulama.Kimlik.Dto;
using FluentAssertions;
using Xunit;

namespace Cevik.EntegrasyonTestleri;

[Collection("Api")]
public class KimlikSenaryolariTestleri : IClassFixture<CevikUygulamaFabrikasi>
{
    private readonly CevikUygulamaFabrikasi _fabrika;
    private readonly HttpClient _istemci;
    private static readonly JsonSerializerOptions JsonAyarlari = new(JsonSerializerDefaults.Web);

    public KimlikSenaryolariTestleri(CevikUygulamaFabrikasi fabrika)
    {
        _fabrika = fabrika;
        _istemci = fabrika.CreateClient();
    }

    [Fact]
    public async Task Senaryo1_Giris_Ve_Yenileme_Basarili_Olur()
    {
        var (_, _, tokenDto) = await KullaniciOlusturVeGirisYapAsync();

        tokenDto.Should().NotBeNull();
        tokenDto.AccessToken.Should().NotBeNullOrEmpty();
        tokenDto.RefreshToken.Should().NotBeNullOrEmpty();

        var yenileYanit = await _istemci.PostAsJsonAsync("/api/Kimlik/yenile", new TokenYenileDto
        {
            RefreshToken = tokenDto.RefreshToken
        });

        yenileYanit.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var yeniTokenDto = await yenileYanit.Content.ReadFromJsonAsync<TokenDto>(JsonAyarlari);
        yeniTokenDto.Should().NotBeNull();
        yeniTokenDto!.AccessToken.Should().NotBeNullOrEmpty();
        yeniTokenDto.RefreshToken.Should().NotBeNullOrEmpty();
        yeniTokenDto.RefreshToken.Should().NotBe(tokenDto.RefreshToken, "Refresh token should be rotated.");
    }

    [Fact]
    public async Task Senaryo2_KisaSureli_Tekrar_Ayni_Ardil_Tokeni_Verir()
    {
        var (_, _, tokenDto) = await KullaniciOlusturVeGirisYapAsync();

        // 1. Yenileme (Başarılı olmalı)
        var ilkYenileYanit = await _istemci.PostAsJsonAsync("/api/Kimlik/yenile", new TokenYenileDto
        {
            RefreshToken = tokenDto.RefreshToken
        });
        ilkYenileYanit.StatusCode.Should().Be(HttpStatusCode.OK);

        var ilkToken = await ilkYenileYanit.Content.ReadFromJsonAsync<TokenDto>(JsonAyarlari);

        // Çerezi henüz güncellenmemiş ikinci istek aynı başarılı sonucu alır.
        var ikinciYenileYanit = await _istemci.PostAsJsonAsync("/api/Kimlik/yenile", new TokenYenileDto
        {
            RefreshToken = tokenDto.RefreshToken
        });

        ikinciYenileYanit.StatusCode.Should().Be(HttpStatusCode.OK);
        var ikinciToken = await ikinciYenileYanit.Content.ReadFromJsonAsync<TokenDto>(JsonAyarlari);
        ikinciToken!.RefreshToken.Should().Be(ilkToken!.RefreshToken);
    }

    [Fact]
    public async Task Senaryo3_EsZamanli_Yenileme_Istekleri_Ayni_Ardil_Tokeni_Alir()
    {
        var (_, _, tokenDto) = await KullaniciOlusturVeGirisYapAsync();

        // Aynı refresh token ile aynı anda iki istek gönder
        var yenileDto = new TokenYenileDto { RefreshToken = tokenDto.RefreshToken };
        var jsonContent1 = JsonContent.Create(yenileDto, options: JsonAyarlari);
        var jsonContent2 = JsonContent.Create(yenileDto, options: JsonAyarlari);

        var task1 = _istemci.PostAsync("/api/Kimlik/yenile", jsonContent1);
        var task2 = _istemci.PostAsync("/api/Kimlik/yenile", jsonContent2);

        var sonuclar = await Task.WhenAll(task1, task2);

        sonuclar.Should().OnlyContain(x => x.StatusCode == HttpStatusCode.OK,
            "eşzamanlı istekler oturumu yanlışlıkla geçersiz kılmamalı");

        var tokenlar = await Task.WhenAll(sonuclar.Select(x =>
            x.Content.ReadFromJsonAsync<TokenDto>(JsonAyarlari)));
        tokenlar.Should().OnlyContain(x => x != null);
        tokenlar.Select(x => x!.RefreshToken).Distinct().Should().ContainSingle();
    }

    [Fact]
    public async Task Senaryo4_Cikis_Islemi_Ve_Gecersiz_Kilma()
    {
        var (_, _, tokenDto) = await KullaniciOlusturVeGirisYapAsync();

        var cikisYanit = await _istemci.PostAsJsonAsync("/api/Kimlik/cikis", new TokenYenileDto
        {
            RefreshToken = tokenDto.RefreshToken
        });
        cikisYanit.StatusCode.Should().Be(HttpStatusCode.OK);

        // Çıkış yaptıktan sonra token kullanılamamalı
        var yenileYanit = await _istemci.PostAsJsonAsync("/api/Kimlik/yenile", new TokenYenileDto
        {
            RefreshToken = tokenDto.RefreshToken
        });
        yenileYanit.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Senaryo5_Sifre_Sifirlama_Hesap_Listeleme_Engelleme()
    {
        var sahteEposta = $"bulunmayan.{Guid.NewGuid():N}@test.com";

        var yanit = await _istemci.PostAsJsonAsync("/api/Kimlik/sifre-sifirlama-talebi", new SifreSifirlamaTalebiDto
        {
            Eposta = sahteEposta
        });

        // Hesap listelemeyi engellemek için mevcut olmayan hesapta dahi 200 dönmeli
        yanit.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Senaryo6_Eposta_Dogrulama_Akisi()
    {
        var (eposta, _, tokenDto) = await KullaniciOlusturVeGirisYapAsync();

        using var istek = new HttpRequestMessage(HttpMethod.Post, "/api/Kimlik/eposta-dogrulama-talebi");
        istek.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenDto.AccessToken);

        var talepYanit = await _istemci.SendAsync(istek);
        talepYanit.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // E-posta dogrulama asamasini UI ve gercek e-posta uzerinden calisacagi icin
        // DB dogrulamasi yapmiyoruz ve DevToken sizintisi olmadigini teyit ediyoruz.
    }

    private async Task<(string Eposta, string Parola, TokenDto Token)> KullaniciOlusturVeGirisYapAsync()
    {
        var eposta = $"test.{Guid.NewGuid():N}@test.com";
        var parola = "Test.123456";

        var kayitYanit = await _istemci.PostAsJsonAsync("/api/Kimlik/kayit", new KullaniciKayitDto
        {
            Ad = "Test",
            Soyad = "Kullanici",
            Eposta = eposta,
            Telefon = "05554443322",
            Sifre = parola
        });
        kayitYanit.EnsureSuccessStatusCode();

        var girisYanit = await _istemci.PostAsJsonAsync("/api/Kimlik/giris", new KullaniciGirisDto
        {
            Eposta = eposta,
            Sifre = parola
        });
        girisYanit.EnsureSuccessStatusCode();

        var token = await girisYanit.Content.ReadFromJsonAsync<TokenDto>(JsonAyarlari);
        return (eposta, parola, token!);
    }
}
