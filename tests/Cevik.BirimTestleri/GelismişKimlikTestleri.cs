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

namespace Cevik.BirimTestleri;

public class GelismişKimlikTestleri
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
        var servis = new KimlikServisi(context, jwtOptions);

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
    public async Task TokenYenile_KullanilmisToken_AileyiIptalEder()
    {
        var options = GetDbOptions("TokenReuse_Db");
        using var context = new CevikDbContext(options);
        var jwtOptions = GetJwtOptions();
        var servis = new KimlikServisi(context, jwtOptions);

        await servis.KayitOlAsync(new KullaniciKayitDto { Ad = "A", Soyad = "B", Eposta = "a@b.com", Sifre = "123", Telefon = "1" });
        var giris = await servis.GirisYapAsync(new KullaniciGirisDto { Eposta = "a@b.com", Sifre = "123" });
        
        // 1. kullanım - başarılı
        var yenile1 = await servis.TokenYenileAsync(new TokenYenileDto { RefreshToken = giris!.RefreshToken });
        
        // 2. kullanım - aynı token tekrar (çalınmış senaryosu)
        var yenile2 = await servis.TokenYenileAsync(new TokenYenileDto { RefreshToken = giris.RefreshToken });
        
        yenile2.Should().BeNull(); // Engellenmeli
        
        // 3. kullanım - yenilenmiş token da iptal edilmiş olmalı
        var yenile3 = await servis.TokenYenileAsync(new TokenYenileDto { RefreshToken = yenile1!.RefreshToken });
        yenile3.Should().BeNull(); 
    }

    [Fact]
    public async Task CikisYap_TokenIptalEder()
    {
        var options = GetDbOptions("Cikis_Db");
        using var context = new CevikDbContext(options);
        var jwtOptions = GetJwtOptions();
        var servis = new KimlikServisi(context, jwtOptions);

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
        var servis = new KimlikServisi(context, jwtOptions);

        await servis.KayitOlAsync(new KullaniciKayitDto { Ad = "E", Soyad = "F", Eposta = "e@f.com", Sifre = "123", Telefon = "1" });
        var giris = await servis.GirisYapAsync(new KullaniciGirisDto { Eposta = "e@f.com", Sifre = "123" });

        var token = await servis.SifreSifirlamaTalebiOlusturAsync(new SifreSifirlamaTalebiDto { Eposta = "e@f.com" });
        token.Should().NotBeNull();

        var sonuc = await servis.SifreSifirlaAsync(new SifreSifirlaDto { Eposta = "e@f.com", Token = token!, YeniSifre = "Yeni123" });
        sonuc.Should().BeTrue();

        // Eski şifreyle giriş başarısız olmalı
        var eskiGiris = await servis.GirisYapAsync(new KullaniciGirisDto { Eposta = "e@f.com", Sifre = "123" });
        eskiGiris.Should().BeNull();

        // Eski refresh token çalışmamalı (iptal edildi)
        var yenile = await servis.TokenYenileAsync(new TokenYenileDto { RefreshToken = giris!.RefreshToken });
        yenile.Should().BeNull();
    }
}
