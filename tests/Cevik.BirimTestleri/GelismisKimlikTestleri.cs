using System;
using System.Linq;
using System.Threading.Tasks;
using Cevik.Alan.Kimlik;
using Cevik.Altyapi.Kimlik.Servisler;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Kimlik.Dto;
using Cevik.Uygulama.Ortak;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Xunit;
using Moq;

namespace Cevik.BirimTestleri;

public class GelismisKimlikTestleri
{
    private DbContextOptions<CevikDbContext> GetDbOptions(string dbName)
    {
        return new DbContextOptionsBuilder<CevikDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
    }

    private IOptions<JwtAyarlari> GetJwtOptions()
    {
        return Options.Create(new JwtAyarlari
        {
            Key = "TestKey123456789012345678901234567890",
            Issuer = "Test",
            Audience = "Test",
            GecerlilikDakika = 60
        });
    }

    [Fact]
    public async Task TokenYenile_GecerliToken_YeniTokenVerir()
    {
        var options = GetDbOptions("TokenYenile_Db");
        using var context = new CevikDbContext(options);
        var jwtOptions = GetJwtOptions();
        var servis = new KimlikServisi(context, jwtOptions, new Mock<Cevik.Uygulama.Ortak.Arayuzler.IEpostaServisi>().Object);

        var dto = new KullaniciKayitDto { Ad = "Ali", Soyad = "Veli", Eposta = "ali@test.com", Sifre = "Sifre123", Telefon = "123" };
        await servis.KayitOlAsync(dto);
        
        var giris = await servis.GirisYapAsync(new KullaniciGirisDto { Eposta = "ali@test.com", Sifre = "Sifre123" });
        giris.Should().NotBeNull();
        giris!.RefreshToken.Should().NotBeNullOrEmpty();

        var yenile = await servis.TokenYenileAsync(new TokenYenileDto { RefreshToken = giris.RefreshToken });
        yenile.Should().NotBeNull();
        yenile!.RefreshToken.Should().NotBe(giris.RefreshToken);
    }

    [Fact]
    public async Task TokenYenile_KisaSureliTekrar_AyniArdilTokeniVerir()
    {
        var options = GetDbOptions("TokenReuse_Db");
        using var context = new CevikDbContext(options);
        var jwtOptions = GetJwtOptions();
        var servis = new KimlikServisi(context, jwtOptions, new Mock<Cevik.Uygulama.Ortak.Arayuzler.IEpostaServisi>().Object);

        await servis.KayitOlAsync(new KullaniciKayitDto { Ad = "A", Soyad = "B", Eposta = "a@b.com", Sifre = "123", Telefon = "1" });
        var giris = await servis.GirisYapAsync(new KullaniciGirisDto { Eposta = "a@b.com", Sifre = "123" });
        
        // 1. kullanım - başarılı
        var yenile1 = await servis.TokenYenileAsync(new TokenYenileDto { RefreshToken = giris!.RefreshToken });
        
        // 2. kullanım - çerezlerin henüz güncellenmediği kısa yarış penceresi
        var yenile2 = await servis.TokenYenileAsync(new TokenYenileDto { RefreshToken = giris.RefreshToken });

        yenile2.Should().NotBeNull();
        yenile2!.RefreshToken.Should().Be(yenile1!.RefreshToken);

        // Ardıl token aile iptal edilmeden normal biçimde kullanılabilmeli.
        var yenile3 = await servis.TokenYenileAsync(new TokenYenileDto { RefreshToken = yenile1!.RefreshToken });
        yenile3.Should().NotBeNull();
    }

    [Fact]
    public async Task Girisler_FarkliAileOlusturur_RotasyonAileyiKorur()
    {
        var options = GetDbOptions("TokenFamily_Db");
        using var context = new CevikDbContext(options);
        var servis = new KimlikServisi(
            context,
            GetJwtOptions(),
            new Mock<Cevik.Uygulama.Ortak.Arayuzler.IEpostaServisi>().Object);

        await servis.KayitOlAsync(new KullaniciKayitDto
        {
            Ad = "Aile",
            Soyad = "Testi",
            Eposta = "aile@test.com",
            Sifre = "Sifre123",
            Telefon = "1"
        });

        var ilkGiris = await servis.GirisYapAsync(new KullaniciGirisDto
        {
            Eposta = "aile@test.com",
            Sifre = "Sifre123"
        });
        var ikinciGiris = await servis.GirisYapAsync(new KullaniciGirisDto
        {
            Eposta = "aile@test.com",
            Sifre = "Sifre123"
        });

        await servis.TokenYenileAsync(new TokenYenileDto { RefreshToken = ilkGiris!.RefreshToken });

        var aileBoyutlari = await context.KullaniciRefreshTokens
            .GroupBy(x => x.AileId)
            .Select(x => new { AileId = x.Key, Adet = x.Count() })
            .OrderBy(x => x.Adet)
            .ToListAsync();

        ikinciGiris.Should().NotBeNull();
        aileBoyutlari.Should().HaveCount(2);
        aileBoyutlari.Should().OnlyContain(x => x.AileId != Guid.Empty);
        aileBoyutlari.Select(x => x.Adet).Should().Equal(1, 2);
    }

    [Fact]
    public async Task SupheliTekrar_YalnizIlgiliOturumAilesiniIptalEder()
    {
        var options = GetDbOptions("TokenFamilyReplay_Db");
        using var context = new CevikDbContext(options);
        var servis = new KimlikServisi(
            context,
            GetJwtOptions(),
            new Mock<Cevik.Uygulama.Ortak.Arayuzler.IEpostaServisi>().Object);

        await servis.KayitOlAsync(new KullaniciKayitDto
        {
            Ad = "Cihaz",
            Soyad = "Testi",
            Eposta = "cihaz@test.com",
            Sifre = "Sifre123",
            Telefon = "1"
        });

        var ilkCihaz = await servis.GirisYapAsync(new KullaniciGirisDto
        {
            Eposta = "cihaz@test.com",
            Sifre = "Sifre123"
        });
        var ilkAileKoku = await context.KullaniciRefreshTokens.SingleAsync();

        var ikinciCihaz = await servis.GirisYapAsync(new KullaniciGirisDto
        {
            Eposta = "cihaz@test.com",
            Sifre = "Sifre123"
        });

        var ilkCihazArdili = await servis.TokenYenileAsync(new TokenYenileDto
        {
            RefreshToken = ilkCihaz!.RefreshToken
        });

        // Tolerans penceresi geçmiş bir eski-token kullanımı çalıntı sayılır.
        ilkAileKoku.GuncellemeTarihi = DateTimeOffset.UtcNow.Subtract(TimeSpan.FromMinutes(1));
        var supheliTekrar = await servis.TokenYenileAsync(new TokenYenileDto
        {
            RefreshToken = ilkCihaz.RefreshToken
        });

        supheliTekrar.Should().BeNull();
        (await servis.TokenYenileAsync(new TokenYenileDto
        {
            RefreshToken = ilkCihazArdili!.RefreshToken
        })).Should().BeNull("şüpheli tekrarın ait olduğu aile kapatılmalı");
        (await servis.TokenYenileAsync(new TokenYenileDto
        {
            RefreshToken = ikinciCihaz!.RefreshToken
        })).Should().NotBeNull("başka cihazın ayrı oturumu açık kalmalı");
    }

    [Fact]
    public async Task CikisSonrasi_EskiTokenTekrari_OturumuYenidenAcmaz()
    {
        var options = GetDbOptions("TokenLogoutReplay_Db");
        using var context = new CevikDbContext(options);
        var servis = new KimlikServisi(
            context,
            GetJwtOptions(),
            new Mock<Cevik.Uygulama.Ortak.Arayuzler.IEpostaServisi>().Object);

        await servis.KayitOlAsync(new KullaniciKayitDto
        {
            Ad = "Çıkış",
            Soyad = "Testi",
            Eposta = "cikis-tekrar@test.com",
            Sifre = "Sifre123",
            Telefon = "1"
        });
        var giris = await servis.GirisYapAsync(new KullaniciGirisDto
        {
            Eposta = "cikis-tekrar@test.com",
            Sifre = "Sifre123"
        });
        var yenilenen = await servis.TokenYenileAsync(new TokenYenileDto
        {
            RefreshToken = giris!.RefreshToken
        });

        (await servis.CikisYapAsync(yenilenen!.RefreshToken)).Should().BeTrue();
        (await servis.TokenYenileAsync(new TokenYenileDto
        {
            RefreshToken = giris.RefreshToken
        })).Should().BeNull();
    }

    [Fact]
    public async Task CikisYap_TokenIptalEder()
    {
        var options = GetDbOptions("Cikis_Db");
        using var context = new CevikDbContext(options);
        var jwtOptions = GetJwtOptions();
        var servis = new KimlikServisi(context, jwtOptions, new Mock<Cevik.Uygulama.Ortak.Arayuzler.IEpostaServisi>().Object);

        await servis.KayitOlAsync(new KullaniciKayitDto { Ad = "C", Soyad = "D", Eposta = "c@d.com", Sifre = "123", Telefon = "1" });
        var giris = await servis.GirisYapAsync(new KullaniciGirisDto { Eposta = "c@d.com", Sifre = "123" });

        var cikis = await servis.CikisYapAsync(giris!.RefreshToken);
        cikis.Should().BeTrue();

        var yenile = await servis.TokenYenileAsync(new TokenYenileDto { RefreshToken = giris.RefreshToken });
        yenile.Should().BeNull();
    }

    [Fact]
    public async Task SifreSifirla_BasariliIse_RefreshTokensIptalOlur()
    {
        var options = GetDbOptions("SifreSifirla_Db");
        using var context = new CevikDbContext(options);
        var jwtOptions = GetJwtOptions();
        
        string capturedToken = "";
        var mockEmail = new Mock<Cevik.Uygulama.Ortak.Arayuzler.IEpostaServisi>();
        mockEmail.Setup(x => x.EpostaGonderAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Callback<string, string, string>((to, subj, body) => {
                capturedToken = body.Replace("Şifre sıfırlama kodunuz: ", "");
            });
            
        var servis = new KimlikServisi(context, jwtOptions, mockEmail.Object);

        await servis.KayitOlAsync(new KullaniciKayitDto { Ad = "E", Soyad = "F", Eposta = "e@f.com", Sifre = "123", Telefon = "1" });
        var giris = await servis.GirisYapAsync(new KullaniciGirisDto { Eposta = "e@f.com", Sifre = "123" });

        var talep = await servis.SifreSifirlamaTalebiOlusturAsync(new SifreSifirlamaTalebiDto { Eposta = "e@f.com" });
        talep.Should().BeTrue();
        capturedToken.Should().NotBeNullOrEmpty();

        var sonuc = await servis.SifreSifirlaAsync(new SifreSifirlaDto { Eposta = "e@f.com", Token = capturedToken, YeniSifre = "Yeni123" });
        sonuc.Should().BeTrue();

        // Eski şifreyle giriş başarısız olmalı
        var eskiGiris = await servis.GirisYapAsync(new KullaniciGirisDto { Eposta = "e@f.com", Sifre = "123" });
        eskiGiris.Should().BeNull();

        // Eski refresh token çalışmamalı (iptal edildi)
        var yenile = await servis.TokenYenileAsync(new TokenYenileDto { RefreshToken = giris!.RefreshToken });
        yenile.Should().BeNull();
    }
}
