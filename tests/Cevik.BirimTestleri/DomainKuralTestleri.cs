using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using FluentAssertions;

namespace Cevik.BirimTestleri;

/// <summary>
/// MOQ / MPQ / katlama kuralları — sepete ekleme ve sipariş oluşturmanın
/// dayandığı kural. Bu kural bozulursa müşteri satın alamayacağı bir miktarı
/// sipariş edebilir hâle gelir.
/// </summary>
public class SiparisMiktarKuraliTestleri
{
    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void SifirVeyaNegatifMiktar_Reddedilir(int miktar)
    {
        var sonuc = SiparisMiktarKurali.Dogrula(miktar, moq: 1, katlamaMiktari: 1);

        sonuc.Gecerli.Should().BeFalse();
        sonuc.Hata.Should().Contain("sıfırdan büyük");
    }

    [Fact]
    public void MoqAltindakiMiktar_Reddedilir_VeMoqOnerilir()
    {
        // Özdisan'daki tipik durum: MOQ 1500, müşteri 100 girmiş.
        var sonuc = SiparisMiktarKurali.Dogrula(miktar: 100, moq: 1500, katlamaMiktari: 1);

        sonuc.Gecerli.Should().BeFalse();
        sonuc.Hata.Should().Contain("1500");
        sonuc.OnerilenMiktar.Should().Be(1500);
    }

    [Fact]
    public void KatlamaKurallarinaUymayanMiktar_Reddedilir_VeUsteYuvarlanir()
    {
        // Multiple = 5, müşteri 7 girdi -> 10 önerilmeli (aşağı değil YUKARI).
        var sonuc = SiparisMiktarKurali.Dogrula(miktar: 7, moq: 1, katlamaMiktari: 5);

        sonuc.Gecerli.Should().BeFalse();
        sonuc.OnerilenMiktar.Should().Be(10);
    }

    [Fact]
    public void MoqVeKatlamaUyumluMiktar_KabulEdilir()
    {
        var sonuc = SiparisMiktarKurali.Dogrula(miktar: 3000, moq: 1500, katlamaMiktari: 1500);

        sonuc.Gecerli.Should().BeTrue();
        sonuc.Hata.Should().BeNull();
        sonuc.OnerilenMiktar.Should().Be(3000);
    }

    [Fact]
    public void MoqAltindaykenOnerilenMiktar_KatlamayaDaUymalidir()
    {
        // MOQ 100 ama katlama 30 -> 100 katlamaya uymuyor, 120 önerilmeli.
        var sonuc = SiparisMiktarKurali.Dogrula(miktar: 10, moq: 100, katlamaMiktari: 30);

        sonuc.Gecerli.Should().BeFalse();
        sonuc.OnerilenMiktar.Should().Be(120);
        (sonuc.OnerilenMiktar % 30).Should().Be(0);
    }

    [Fact]
    public void BozukVeri_KatlamaSifir_ModuloPatlamaz()
    {
        // Seed/import hatası sonucu katlama 0 gelirse hesap çökmemeli.
        var sonuc = SiparisMiktarKurali.Dogrula(miktar: 7, moq: 1, katlamaMiktari: 0);

        sonuc.Gecerli.Should().BeTrue();
    }

    [Fact]
    public void AmbalajUzerindenDogrulama_AyniSonucuVerir()
    {
        var ambalaj = new UrunAmbalaji
        {
            Ad = "Tape & Reel (TR)",
            AmbalajTipi = AmbalajTipi.TapeReel,
            Moq = 3000,
            KatlamaMiktari = 3000,
            Mpq = 3000
        };

        SiparisMiktarKurali.Dogrula(2999, ambalaj).Gecerli.Should().BeFalse();
        SiparisMiktarKurali.Dogrula(6000, ambalaj).Gecerli.Should().BeTrue();
    }

    /// <summary>
    /// PLANLAMA.md 5.3 domain kuralı yalnızca MOQ ve katlamayı içerir;
    /// MPQ ambalaj boyutunu tarif eden bir alandır, sipariş kısıtı değil.
    /// MPQ bir ara alt sınır olarak eklenmiş ve MOQ'su 1 olan üründen
    /// 10 adet almayı bile engellemişti — bu test o davranışın geri
    /// gelmesini engeller.
    /// </summary>
    [Fact]
    public void MpqBuyukOlsaBile_MoqVeKatlamaya_UyanMiktar_Kabul_Edilir()
    {
        var ambalaj = new UrunAmbalaji
        {
            Ad = "Tape & Reel (TR)",
            AmbalajTipi = AmbalajTipi.TapeReel,
            Moq = 1,
            KatlamaMiktari = 1,
            Mpq = 3000
        };

        SiparisMiktarKurali.Dogrula(10, ambalaj).Gecerli.Should().BeTrue();
    }

    /// <summary>
    /// Önerilen miktar her zaman katlamaya uymalı: kullanıcı öneriyi aynen
    /// girdiğinde yeniden reddedilmemeli. Sıfır/negatif dalı bu kuralı
    /// atlıyor ve katlamaya uymayan bir MOQ değeri öneriyordu.
    /// </summary>
    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void SifirVeyaNegatifMiktarda_OnerilenMiktar_KatlamayaUyar(int miktar)
    {
        var sonuc = SiparisMiktarKurali.Dogrula(miktar, moq: 100, katlamaMiktari: 30);

        sonuc.Gecerli.Should().BeFalse();
        sonuc.OnerilenMiktar.Should().Be(120, "100 MOQ'u 30'un katına yuvarlanmalı");
        SiparisMiktarKurali.Dogrula(sonuc.OnerilenMiktar, moq: 100, katlamaMiktari: 30)
            .Gecerli.Should().BeTrue("önerilen miktar yeniden doğrulamayı geçmeli");
    }
}

public class IndirimHesabiTestleri
{
    [Fact]
    public void EnAvantajliIndirimSecilir_VeIndirimlerUstUsteBindirilmez()
    {
        var simdi = DateTimeOffset.UtcNow;
        var indirimler = new List<Indirim>
        {
            new()
            {
                Id = 7,
                Ad = "Ürün kampanyası",
                HedefTipi = IndirimHedefTipi.Urun,
                HedefId = 1,
                IndirimTipi = IndirimTipi.Yuzde,
                Deger = 20m,
                BaslangicTarihi = simdi.AddDays(-1),
                BitisTarihi = simdi.AddDays(1),
                Aktif = true
            }
        };

        var sonuc = IndirimHesabi.Uygula(100m, 3, 10m, indirimler);

        sonuc.BirimFiyat.Should().Be(80m);
        sonuc.SatirIndirimTutari.Should().Be(60m);
        sonuc.IndirimId.Should().Be(7);
    }
}

/// <summary>
/// Kademeli fiyat seçimi — "çok alırsan az ödersin" mantığının doğruluğu.
/// </summary>
public class FiyatKademesiSeciciTestleri
{
    private static List<FiyatKademesi> Kademeler() =>
    [
        new() { MinMiktar = 1,    MaxMiktar = 49,   BirimFiyat = 1.00m, ParaBirimi = "USD" },
        new() { MinMiktar = 50,   MaxMiktar = 249,  BirimFiyat = 0.90m, ParaBirimi = "USD" },
        new() { MinMiktar = 250,  MaxMiktar = 999,  BirimFiyat = 0.82m, ParaBirimi = "USD" },
        new() { MinMiktar = 1000, MaxMiktar = null, BirimFiyat = 0.71m, ParaBirimi = "USD" }
    ];

    [Theory]
    [InlineData(1, 1.00)]
    [InlineData(49, 1.00)]
    [InlineData(50, 0.90)]
    [InlineData(249, 0.90)]
    [InlineData(250, 0.82)]
    [InlineData(999, 0.82)]
    [InlineData(1000, 0.71)]
    [InlineData(50000, 0.71)]
    public void MiktaraGoreDogruKademeSecilir(int miktar, decimal beklenenFiyat)
    {
        var kademe = FiyatKademesiSecici.Sec(Kademeler(), miktar);

        kademe.Should().NotBeNull();
        kademe!.BirimFiyat.Should().Be(beklenenFiyat);
    }

    [Fact]
    public void AcikUcluKademeYokkenUstMiktar_EnYuksekKademeyeDuser()
    {
        // Üst sınırsız kademe yok; 5000 adet hiçbir aralığa girmiyor.
        List<FiyatKademesi> sinirli =
        [
            new() { MinMiktar = 1,  MaxMiktar = 49,  BirimFiyat = 1.00m, ParaBirimi = "USD" },
            new() { MinMiktar = 50, MaxMiktar = 249, BirimFiyat = 0.90m, ParaBirimi = "USD" }
        ];

        var kademe = FiyatKademesiSecici.Sec(sinirli, 5000);

        kademe.Should().NotBeNull();
        kademe!.BirimFiyat.Should().Be(0.90m);
    }

    [Fact]
    public void MusteriGrubunaOzelFiyat_ListeFiyatiniEzer()
    {
        var kademeler = Kademeler();
        kademeler.Add(new FiyatKademesi
        {
            MinMiktar = 1, MaxMiktar = 49, BirimFiyat = 0.65m, ParaBirimi = "USD", MusteriGrubuId = 7
        });

        FiyatKademesiSecici.Sec(kademeler, 10, musteriGrubuId: 7)!.BirimFiyat.Should().Be(0.65m);
        // Gruba dahil olmayan müşteri özel fiyatı GÖRMEMELİ.
        FiyatKademesiSecici.Sec(kademeler, 10, musteriGrubuId: 99)!.BirimFiyat.Should().Be(1.00m);
        FiyatKademesiSecici.Sec(kademeler, 10)!.BirimFiyat.Should().Be(1.00m);
    }

    [Fact]
    public void SuresiGecmisKademe_Secilmez()
    {
        var an = new DateTimeOffset(2026, 8, 20, 0, 0, 0, TimeSpan.Zero);

        List<FiyatKademesi> kademeler =
        [
            new()
            {
                MinMiktar = 1, BirimFiyat = 0.50m, ParaBirimi = "USD",
                GecerlilikBitis = an.AddDays(-1) // dün bitti
            },
            new() { MinMiktar = 1, BirimFiyat = 1.00m, ParaBirimi = "USD" }
        ];

        var kademe = FiyatKademesiSecici.Sec(kademeler, 10, null, an);

        kademe!.BirimFiyat.Should().Be(1.00m);
    }

    [Fact]
    public void KademeYoksa_NullDoner()
    {
        FiyatKademesiSecici.Sec([], 10).Should().BeNull();
    }
}

/// <summary>
/// Sipariş durum makinesi — geçersiz geçişlerin engellendiğinin kanıtı.
/// </summary>
public class SiparisDurumMakinesiTestleri
{
    [Theory]
    [InlineData(SiparisDurumu.Olusturuldu, SiparisDurumu.OdemeBekliyor)]
    [InlineData(SiparisDurumu.Olusturuldu, SiparisDurumu.IptalEdildi)]
    [InlineData(SiparisDurumu.Onaylandi, SiparisDurumu.Hazirlaniyor)]
    [InlineData(SiparisDurumu.Hazirlaniyor, SiparisDurumu.KargoyaVerildi)]
    [InlineData(SiparisDurumu.KargoyaVerildi, SiparisDurumu.TeslimEdildi)]
    [InlineData(SiparisDurumu.TeslimEdildi, SiparisDurumu.IadeEdildi)]
    public void GecerliGecisler_KabulEdilir(SiparisDurumu mevcut, SiparisDurumu hedef)
    {
        SiparisDurumMakinesi.GecisGecerliMi(mevcut, hedef).Should().BeTrue();
    }

    [Theory]
    [InlineData(SiparisDurumu.TeslimEdildi, SiparisDurumu.OdemeBekliyor)]  // geriye dönüş
    [InlineData(SiparisDurumu.Olusturuldu, SiparisDurumu.TeslimEdildi)]    // adım atlama
    [InlineData(SiparisDurumu.IptalEdildi, SiparisDurumu.Onaylandi)]       // uç durumdan çıkış
    [InlineData(SiparisDurumu.IadeEdildi, SiparisDurumu.KargoyaVerildi)]
    [InlineData(SiparisDurumu.KargoyaVerildi, SiparisDurumu.IptalEdildi)]  // kargodakini iptal edemezsin
    public void GecersizGecisler_Reddedilir(SiparisDurumu mevcut, SiparisDurumu hedef)
    {
        SiparisDurumMakinesi.GecisGecerliMi(mevcut, hedef).Should().BeFalse();
    }

    [Fact]
    public void IptalYalnizcaOnayOncesindeMumkundur()
    {
        SiparisDurumMakinesi.IptalEdilebilirMi(SiparisDurumu.Olusturuldu).Should().BeTrue();
        SiparisDurumMakinesi.IptalEdilebilirMi(SiparisDurumu.OdemeBekliyor).Should().BeTrue();
        SiparisDurumMakinesi.IptalEdilebilirMi(SiparisDurumu.Onaylandi).Should().BeTrue();

        SiparisDurumMakinesi.IptalEdilebilirMi(SiparisDurumu.Hazirlaniyor).Should().BeFalse();
        SiparisDurumMakinesi.IptalEdilebilirMi(SiparisDurumu.TeslimEdildi).Should().BeFalse();
    }

    [Fact]
    public void UcDurumlarinIzinliGecisiYoktur()
    {
        SiparisDurumMakinesi.IzinliGecisler(SiparisDurumu.IptalEdildi).Should().BeEmpty();
        SiparisDurumMakinesi.IzinliGecisler(SiparisDurumu.IadeEdildi).Should().BeEmpty();
    }
}

/// <summary>
/// Ürün kodu normalizasyonu — aramanın çalışmasının ön şartı.
/// Seed tarafı ile arama tarafı AYNI kuralı kullanmalı.
/// </summary>
public class UrunKoduNormalizeleyiciTestleri
{
    [Theory]
    [InlineData("STM32F103C8T6", "STM32F103C8T6")]
    [InlineData("stm32-f103", "STM32F103")]
    [InlineData("STM 32 F103", "STM32F103")]
    [InlineData("stm32.f103_c8", "STM32F103C8")]
    [InlineData("  RC0805FR-071KL  ", "RC0805FR071KL")]
    public void FarkliYazimlar_AyniNormalKodaIner(string girdi, string beklenen)
    {
        UrunKoduNormalizeleyici.Normalize(girdi).Should().Be(beklenen);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void BosGirdi_BosDoner(string? girdi)
    {
        UrunKoduNormalizeleyici.Normalize(girdi).Should().BeEmpty();
    }

    [Fact]
    public void KullaniciAramasi_UrunKodununOnEkiyleEslesir()
    {
        // "STM32F1" araması STM32F103C8T6'yı bulmalı (ILIKE %...% ile).
        var urunKodu = UrunKoduNormalizeleyici.Normalize("STM32F103C8T6");
        var arama = UrunKoduNormalizeleyici.Normalize("stm32-f1");

        urunKodu.Should().Contain(arama);
    }
}

/// <summary>
/// Para yuvarlama ve dönüştürme. Bu sınıfın hiç testi yoktu: sepet her
/// okumada, sipariş her kurulumda buradan geçiyor ama yuvarlama yönü ya da
/// hassasiyeti değişse hiçbir test kırılmıyordu.
///
/// PLANLAMA.md 5.3 hassasiyeti açıkça belirliyor: numeric(18,6). Pasif
/// komponentlerde birim fiyat 0,0234 USD gibi olabilir; 2 ondalığa yuvarlamak
/// 10.000 adetlik siparişte yüzlerce lira hata demektir.
/// </summary>
public class ParaHesabiTestleri
{
    [Fact]
    public void Hassasiyet_AltiOndalik()
    {
        ParaHesabi.OndalikHassasiyeti.Should().Be(6);
    }

    [Fact]
    public void KucukBirimFiyat_IkiOndaligaDusurulmez()
    {
        // 0,0234 USD × 10.000 adet = 234 USD. İki ondalığa yuvarlanmış
        // 0,02'lik bir fiyat 200 USD verir — 34 USD fark.
        var birimFiyat = ParaHesabi.Yuvarla(0.0234m);

        birimFiyat.Should().Be(0.0234m);
        (birimFiyat * 10_000).Should().Be(234m);
    }

    [Theory]
    [InlineData("0.0000005", "0.000001")]
    [InlineData("0.0000015", "0.000002")]
    [InlineData("-0.0000005", "-0.000001")]
    public void Yuvarlama_YarimDegerleri_SifirdanUzaga_Yuvarlar(string girdi, string beklenen)
    {
        // MidpointRounding.AwayFromZero: bankacı yuvarlamasına düşülürse
        // 0,0000005 → 0 olur ve toplamlar sistematik olarak aşağı kayar.
        var kultur = System.Globalization.CultureInfo.InvariantCulture;

        ParaHesabi.Yuvarla(decimal.Parse(girdi, kultur))
            .Should().Be(decimal.Parse(beklenen, kultur));
    }

    [Fact]
    public void AltinciOndaliktan_Sonrasi_Yuvarlanir()
    {
        ParaHesabi.Yuvarla(1.23456749m).Should().Be(1.234567m);
    }

    [Fact]
    public void Donustur_KurlaCarpar_VeYuvarlar()
    {
        ParaHesabi.Donustur(12.5m, 34.1234m).Should().Be(426.5425m);
    }

    [Fact]
    public void Donustur_BirKur_TutariDegistirmez()
    {
        ParaHesabi.Donustur(1234.567891m, 1m).Should().Be(1234.567891m);
    }
}
