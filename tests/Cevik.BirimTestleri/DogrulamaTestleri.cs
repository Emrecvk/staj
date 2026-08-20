using Cevik.Uygulama.Kimlik.Dto;
using Cevik.Uygulama.Kimlik.Validations;
using Cevik.Uygulama.Siparis.Dto;
using Cevik.Uygulama.Siparis.Validations;
using Cevik.Uygulama.Yonetim.Dto;
using Cevik.Uygulama.Yonetim.Validations;
using FluentAssertions;

namespace Cevik.BirimTestleri;

public class KullaniciGirisValidasyonTestleri
{
    private readonly KullaniciGirisDtoValidator _validator = new();

    [Theory]
    [InlineData("", "123456")]
    [InlineData("gecersiz", "123456")]
    [InlineData("test@test.com", "")]
    public void GecersizGirdiler_Reddedilir(string eposta, string sifre)
    {
        _validator.Validate(new KullaniciGirisDto { Eposta = eposta, Sifre = sifre })
                  .IsValid.Should().BeFalse();
    }

    [Fact]
    public void GecerliGiris_KabulEdilir()
    {
        _validator.Validate(new KullaniciGirisDto { Eposta = "test@test.com", Sifre = "Sifre123" })
                  .IsValid.Should().BeTrue();
    }
}

public class KullaniciKayitValidasyonTestleri
{
    private readonly KullaniciKayitDtoValidator _validator = new();

    private static KullaniciKayitDto Gecerli(string sifre = "Sifre12345") => new()
    {
        Ad = "Ali", Soyad = "Yılmaz", Eposta = "ali@test.com",
        Telefon = "05551234567", Sifre = sifre
    };

    [Theory]
    [InlineData("abc")]           // çok kısa
    [InlineData("sifre12345")]    // büyük harf yok
    [InlineData("SifreDeneme")]   // rakam yok
    public void ZayifSifreler_Reddedilir(string sifre)
    {
        _validator.Validate(Gecerli(sifre)).IsValid.Should().BeFalse();
    }

    [Fact]
    public void GecerliKayit_KabulEdilir()
    {
        _validator.Validate(Gecerli()).IsValid.Should().BeTrue();
    }
}

public class FirmaBasvuruValidasyonTestleri
{
    private readonly FirmaBasvuruDtoValidator _validator = new();

    [Fact]
    public void GecersizVergiNo_Reddedilir()
    {
        var sonuc = _validator.Validate(new FirmaBasvuruDto
        {
            FirmaAdi = "Test Firma", VergiDairesi = "Kadıköy", VergiNo = "123"
        });

        sonuc.IsValid.Should().BeFalse();
        sonuc.Errors.Should().Contain(e => e.PropertyName == "VergiNo");
    }

    [Fact]
    public void GecerliBasvuru_KabulEdilir()
    {
        _validator.Validate(new FirmaBasvuruDto
        {
            FirmaAdi = "Test Firma", VergiDairesi = "Kadıköy", VergiNo = "1234567890"
        }).IsValid.Should().BeTrue();
    }
}

public class AdresValidasyonTestleri
{
    private readonly AdresEkleDtoValidator _validator = new();

    private static AdresEkleDto Gecerli() => new()
    {
        Baslik = "Ev", Sehir = "İstanbul", Ilce = "Kadıköy",
        PostaKodu = "34710", AcikAdres = "Caferağa Mah. Test Sokak No:1 D:2"
    };

    [Fact]
    public void GecerliAdres_KabulEdilir() => _validator.Validate(Gecerli()).IsValid.Should().BeTrue();

    [Theory]
    [InlineData("123")]      // 5 haneden kısa
    [InlineData("3471A")]    // harf içeriyor
    [InlineData("123456")]   // 5 haneden uzun
    public void GecersizPostaKodu_Reddedilir(string postaKodu)
    {
        var dto = Gecerli();
        dto.PostaKodu = postaKodu;

        _validator.Validate(dto).IsValid.Should().BeFalse();
    }

    [Fact]
    public void CokKisaAcikAdres_Reddedilir()
    {
        var dto = Gecerli();
        dto.AcikAdres = "Kısa";

        _validator.Validate(dto).IsValid.Should().BeFalse();
    }
}

public class SepetValidasyonTestleri
{
    private readonly SepeteEkleDtoValidator _ekleValidator = new();
    private readonly SepetGuncelleDtoValidator _guncelleValidator = new();

    [Theory]
    [InlineData(1, 0)]
    [InlineData(0, 5)]
    public void GecersizSepeteEkle_Reddedilir(long ambalajId, int miktar)
    {
        _ekleValidator.Validate(new SepeteEkleDto { UrunAmbalajId = ambalajId, Miktar = miktar })
                      .IsValid.Should().BeFalse();
    }

    [Fact]
    public void GecerliSepeteEkle_KabulEdilir()
    {
        _ekleValidator.Validate(new SepeteEkleDto { UrunAmbalajId = 1, Miktar = 10 })
                      .IsValid.Should().BeTrue();
    }

    [Fact]
    public void SepetGuncellemede_SifirMiktar_SerbesttiIcinKabulEdilir()
    {
        // 0 = "kalemi sepetten çıkar" anlamına gelir.
        _guncelleValidator.Validate(new SepetGuncelleDto { KalemId = 1, YeniMiktar = 0 })
                          .IsValid.Should().BeTrue();
    }

    [Fact]
    public void SepetGuncellemede_NegatifMiktar_Reddedilir()
    {
        _guncelleValidator.Validate(new SepetGuncelleDto { KalemId = 1, YeniMiktar = -1 })
                          .IsValid.Should().BeFalse();
    }
}

public class SiparisValidasyonTestleri
{
    private readonly SiparisOlusturDtoValidator _validator = new();

    [Fact]
    public void AdresIdSifir_IkiHataVerir()
    {
        var sonuc = _validator.Validate(new SiparisOlusturDto { FaturaAdresiId = 0, TeslimatAdresiId = 0 });

        sonuc.IsValid.Should().BeFalse();
        sonuc.Errors.Should().HaveCount(2);
    }

    [Fact]
    public void GecerliSiparis_KabulEdilir()
    {
        _validator.Validate(new SiparisOlusturDto { FaturaAdresiId = 1, TeslimatAdresiId = 2 })
                  .IsValid.Should().BeTrue();
    }
}

/// <summary>
/// Yönetim uçlarının doğrulayıcıları — admin girdisi de doğrulanmalı.
/// </summary>
public class YonetimValidasyonTestleri
{
    [Fact]
    public void UrunKodundaGecersizKarakter_Reddedilir()
    {
        var validator = new UrunEkleDtoValidator();

        var dto = new UrunEkleDto
        {
            KategoriId = 1, UreticiId = 1,
            UreticiUrunKodu = "STM32<script>", // enjeksiyon denemesi
            KisaAciklama = "Test"
        };

        validator.Validate(dto).IsValid.Should().BeFalse();
    }

    [Fact]
    public void GecerliUrun_KabulEdilir()
    {
        var validator = new UrunEkleDtoValidator();

        var dto = new UrunEkleDto
        {
            KategoriId = 1, UreticiId = 1,
            UreticiUrunKodu = "STM32F103C8T6",
            KisaAciklama = "MCU 32 Bit 72 MHz LQFP48",
            UrunDurumu = 1
        };

        validator.Validate(dto).IsValid.Should().BeTrue();
    }

    [Fact]
    public void NegatifStok_Reddedilir()
    {
        new StokGuncelleDtoValidator()
            .Validate(new StokGuncelleDto { UrunAmbalajId = 1, StokMiktari = -5 })
            .IsValid.Should().BeFalse();
    }

    [Fact]
    public void GecmisTarihliGelecekStok_Reddedilir()
    {
        new StokGuncelleDtoValidator()
            .Validate(new StokGuncelleDto
            {
                UrunAmbalajId = 1,
                StokMiktari = 10,
                GelecekStokTarihi = DateTime.UtcNow.AddDays(-1)
            })
            .IsValid.Should().BeFalse();
    }

    [Fact]
    public void TersFiyatKademesi_Reddedilir()
    {
        // MaxMiktar < MinMiktar
        new AmbalajFiyatGuncelleDtoValidator()
            .Validate(new AmbalajFiyatGuncelleDto
            {
                UrunAmbalajId = 1,
                Kademeler = [new FiyatKademesiYazDto { MinMiktar = 100, MaxMiktar = 50, BirimFiyat = 1m }]
            })
            .IsValid.Should().BeFalse();
    }

    [Fact]
    public void BosFiyatKademesiListesi_Reddedilir()
    {
        new AmbalajFiyatGuncelleDtoValidator()
            .Validate(new AmbalajFiyatGuncelleDto { UrunAmbalajId = 1, Kademeler = [] })
            .IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData("Buyuk-Harf")]
    [InlineData("bosluk var")]
    [InlineData("türkçe-karakter-ğ")]
    public void GecersizSlug_Reddedilir(string slug)
    {
        new KategoriYazDtoValidator()
            .Validate(new KategoriYazDto
            {
                AdTr = "Test", AdEn = "Test", SlugTr = slug, SlugEn = "test"
            })
            .IsValid.Should().BeFalse();
    }

    [Fact]
    public void GecersizOzellikKodu_Reddedilir()
    {
        // Kod query string'de kullanılıyor: yalnızca küçük harf/rakam/alt çizgi.
        new OzellikTanimiYazDtoValidator()
            .Validate(new OzellikTanimiYazDto
            {
                Kod = "Bit Sayisi", AdTr = "Bit Sayısı", AdEn = "Bit Count",
                VeriTipi = 5, GosterimTipi = 1
            })
            .IsValid.Should().BeFalse();
    }

    [Fact]
    public void GecersizRolDegeri_Reddedilir()
    {
        new KullaniciRolGuncelleDtoValidator()
            .Validate(new KullaniciRolGuncelleDto { KullaniciId = 1, Rol = 99 })
            .IsValid.Should().BeFalse();
    }
}
