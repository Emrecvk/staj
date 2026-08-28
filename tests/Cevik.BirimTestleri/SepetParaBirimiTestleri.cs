using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Katalog;
using Cevik.Alan.Siparis;
using Cevik.Altyapi.Siparis.Servisler;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Siparis.Arayuzler;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace Cevik.BirimTestleri;

public class SepetParaBirimiTestleri
{
    [Fact]
    public async Task KarisikParaBirimleri_SepetinParaBirimineDonusturulerekToplanir()
    {
        var options = new DbContextOptionsBuilder<CevikDbContext>()
            .UseInMemoryDatabase($"KarisikSepet_{Guid.NewGuid():N}")
            .Options;
        await using var context = new CevikDbContext(options);

        var uretici = new Uretici { Ad = "Test", Slug = "test" };
        var kategori = new Kategori
        {
            AdTr = "Test", AdEn = "Test", SlugTr = "test", SlugEn = "test",
            Yol = "1", YaprakMi = true
        };
        var usdUrun = UrunOlustur("USD-URUN", uretici, kategori, 10m, "USD");
        var tryUrun = UrunOlustur("TRY-URUN", uretici, kategori, 300m, "TRY");
        var sepet = new Sepet { OturumAnahtari = "karisik", ParaBirimi = "TRY" };
        sepet.Kalemler.Add(new SepetKalemi { Sepet = sepet, UrunAmbalaji = usdUrun.UrunAmbalajlari.Single(), Miktar = 1 });
        sepet.Kalemler.Add(new SepetKalemi { Sepet = sepet, UrunAmbalaji = tryUrun.UrunAmbalajlari.Single(), Miktar = 1 });
        context.AddRange(uretici, kategori, usdUrun, tryUrun, sepet);
        await context.SaveChangesAsync();

        var servis = new SepetServisi(context, new SabitKurServisi());

        var sonuc = await servis.SepetGetirAsync(null, "karisik");

        sonuc!.ParaBirimi.Should().Be("TRY");
        sonuc.GenelToplam.Should().Be(600m);
        sonuc.Kalemler.Single(k => k.UrunKodu == "USD-URUN").BirimFiyat.Should().Be(300m);
    }

    private static Urun UrunOlustur(
        string kod,
        Uretici uretici,
        Kategori kategori,
        decimal fiyat,
        string paraBirimi)
    {
        var urun = new Urun
        {
            Uretici = uretici,
            Kategori = kategori,
            UreticiUrunKodu = kod,
            NormalizeKod = kod,
            KisaAciklama = kod
        };
        var ambalaj = new UrunAmbalaji
        {
            Urun = urun,
            Ad = "Adet",
            Mpq = 1,
            Moq = 1,
            KatlamaMiktari = 1,
            StokMiktari = 10
        };
        ambalaj.FiyatKademeleri.Add(new FiyatKademesi
        {
            UrunAmbalaji = ambalaj,
            MinMiktar = 1,
            BirimFiyat = fiyat,
            ParaBirimi = paraBirimi
        });
        urun.UrunAmbalajlari.Add(ambalaj);
        return urun;
    }

    private sealed class SabitKurServisi : IDovizKuruServisi
    {
        public Task<decimal> KurGetirAsync(string kaynakParaBirimi, string hedefParaBirimi, DateOnly? tarih = null) =>
            Task.FromResult(kaynakParaBirimi == "USD" && hedefParaBirimi == "TRY" ? 30m : 1m);

        public async Task<decimal?> KurDeneAsync(string kaynakParaBirimi, string hedefParaBirimi, DateOnly? tarih = null) =>
            await KurGetirAsync(kaynakParaBirimi, hedefParaBirimi, tarih);
    }
}
