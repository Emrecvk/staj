using System.Text.Json;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using Cevik.Alan.Siparis;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Ortak;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Cevik.Altyapi.Siparis.Servisler;

/// <summary>
/// Sipariş kurmanın ortak adımları: numara üretimi, kalem doğrulama + stok
/// düşümü, adres snapshot'ı, KDV ve kargo hesabı.
///
/// Bu sınıf bilerek var: siparişe iki yoldan giriliyor — sepetten
/// (<see cref="SiparisServisi"/>) ve kabul edilmiş teklif dönüşümünden
/// (<c>TeklifServisi.SipariseDonusturAsync</c>). Önceki sürümde teklif yolu
/// kendi paralel ve EKSİK kopyasını çalıştırıyordu: MOQ/katlama kuralı
/// uygulanmıyor, stok ne kontrol ediliyor ne düşülüyor, KDV ve kargo hiç
/// hesaplanmıyor, para birimi "USD"/kur 1 sabitleniyor ve adres "{}" olarak
/// yazılıyordu. Aynı ürün iki yoldan iki farklı tutara satılıyordu.
///
/// Kural gövdeleri <see cref="SiparisMiktarKurali"/> gibi Alan katmanındadır;
/// burada yalnızca onların çağrı sırası ve kalıcılık tarafı toplanır.
/// </summary>
public sealed class SiparisKurucu
{
    private readonly CevikDbContext _context;
    private readonly TicariAyarlar _ticari;

    public SiparisKurucu(CevikDbContext context, IOptions<TicariAyarlar> ticari)
    {
        _context = context;
        _ticari = ticari.Value;
    }

    public TicariAyarlar Ticari => _ticari;

    /// <summary>
    /// SIP-2026-000123 biçiminde, yıl içinde artan sipariş numarası.
    /// Saniye damgalı şema kullanılmaz: aynı saniyede iki sipariş aynı
    /// numarayı alıyor ve <c>SiparisNo</c> unique index'i 500 üretiyordu.
    /// Silinmiş siparişler de sayılır, aksi halde numara geri dönebilir.
    /// </summary>
    public async Task<string> SiparisNoUretAsync(CancellationToken iptalJetonu = default)
    {
        var yil = DateTimeOffset.UtcNow.Year;
        var onEk = $"SIP-{yil}-";

        // PostgreSQL transaction-scoped advisory lock aynı yıl için iki
        // siparişin aynı numarayı okumasını engeller. Her iki çağıran da bu
        // metodu kendi sipariş transaction'ı içinde çalıştırır.
        if (_context.Database.ProviderName?.Contains("Npgsql", StringComparison.OrdinalIgnoreCase) == true)
        {
            var kilitAnahtari = $"cevik-siparis-no-{yil}";
            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT pg_advisory_xact_lock(hashtext({kilitAnahtari}))",
                iptalJetonu);
        }

        var sonNumara = await _context.Siparisler
            .IgnoreQueryFilters()
            .Where(s => s.SiparisNo.StartsWith(onEk))
            .OrderByDescending(s => s.Id)
            .Select(s => s.SiparisNo)
            .FirstOrDefaultAsync(iptalJetonu);

        var siradaki = 1;
        if (sonNumara is not null && int.TryParse(sonNumara[onEk.Length..], out var mevcut))
            siradaki = mevcut + 1;

        return onEk + siradaki.ToString("D6");
    }

    /// <summary>
    /// Kalemi doğrular, stoğu düşer ve snapshot'lanmış sipariş kalemini döner.
    ///
    /// Üç doğrulama da burada yapılır ve atlanamaz:
    ///  - MOQ / katlama (<see cref="SiparisMiktarKurali"/>),
    ///  - sıfır veya negatif fiyat — fiyatsız kalem bedava siparişe dönüşmemeli,
    ///  - stok yeterliliği; ardından <c>StokMiktari</c> düşülür.
    /// </summary>
    public async Task<SiparisKalemi> KalemKurAsync(
        long urunAmbalajId,
        int miktar,
        decimal birimFiyat,
        CancellationToken iptalJetonu = default)
    {
        var ambalaj = await _context.UrunAmbalajlari
            .Include(a => a.Urun)
            .FirstOrDefaultAsync(a => a.Id == urunAmbalajId, iptalJetonu)
            ?? throw new KeyNotFoundException($"Ürün ambalajı bulunamadı (Id: {urunAmbalajId}).");

        // MOQ / katlama kuralı: sepete eklerken kontrol ediliyor ama
        // ambalaj kuralları o günden sonra değişmiş olabilir.
        var miktarKontrol = SiparisMiktarKurali.Dogrula(miktar, ambalaj);
        if (!miktarKontrol.Gecerli)
            throw new IsKuraliIhlaliException(
                $"{ambalaj.Urun.UreticiUrunKodu}: {miktarKontrol.Hata} " +
                $"(önerilen miktar: {miktarKontrol.OnerilenMiktar})");

        if (birimFiyat <= 0m)
            throw new IsKuraliIhlaliException(
                $"{ambalaj.Urun.UreticiUrunKodu}: geçerli bir birim fiyat bulunamadı. " +
                "Fiyatı olmayan ürün siparişe dönüştürülemez.");

        if (ambalaj.StokMiktari < miktar)
            throw new IsKuraliIhlaliException(
                $"Stok yetersiz. Ürün: {ambalaj.Urun.UreticiUrunKodu}, " +
                $"istenen: {miktar}, mevcut: {ambalaj.StokMiktari}");

        ambalaj.StokMiktari -= miktar;

        return new SiparisKalemi
        {
            UrunId = ambalaj.UrunId,
            UrunAmbalajId = ambalaj.Id,
            // Snapshot: ürün 6 ay sonra yeniden adlandırılsa bile fatura bozulmasın.
            UrunKoduSnapshot = ambalaj.Urun.UreticiUrunKodu,
            UrunAdiSnapshot = ambalaj.Urun.KisaAciklama,
            AmbalajAdiSnapshot = ambalaj.Ad,
            KdvOrani = _ticari.KdvOrani,
            Miktar = miktar,
            BirimFiyat = birimFiyat,
            SatirToplami = ParaHesabi.Yuvarla(birimFiyat * miktar)
        };
    }

    /// <summary>Liste ara toplamı ve indirimden KDV, kargo ve genel toplamı yazar.</summary>
    public void ToplamlariYaz(SiparisVarligi siparis, decimal araToplam, decimal indirimTutari = 0m)
    {
        var indirimliAraToplam = Math.Max(0m, araToplam - indirimTutari);
        siparis.AraToplam = araToplam;
        siparis.IndirimTutari = indirimTutari;
        siparis.KargoUcreti = KargoUcretiHesapla(indirimliAraToplam, siparis.Kur);
        // Kargo teslim hizmetidir ve mal bedeli gibi KDV matrahına dahildir.
        siparis.KdvTutari = ParaHesabi.Yuvarla(
            (indirimliAraToplam + siparis.KargoUcreti) * (_ticari.KdvOrani / 100m));
        siparis.GenelToplam = indirimliAraToplam + siparis.KdvTutari + siparis.KargoUcreti;
    }

    /// <summary>
    /// Kargo eşiği ana para birimi (varsayılan TRY) cinsindendir; sipariş USD ise
    /// karşılaştırmadan önce çevrilir. Önceki sürüm USD tutarı doğrudan
    /// 1000 TL eşiğiyle karşılaştırıyor ve neredeyse her siparişe kargo yazıyordu.
    /// </summary>
    public decimal KargoUcretiHesapla(decimal araToplam, decimal kur)
    {
        var anaParaBirimindeTutar = araToplam * kur;

        if (anaParaBirimindeTutar >= _ticari.UcretsizKargoEsigi)
            return 0m;

        // Kargo ücreti de siparişin para biriminde yazılmalı.
        return kur == 0 ? _ticari.KargoUcreti : ParaHesabi.Yuvarla(_ticari.KargoUcreti / kur);
    }

    public static string AdresSnapshotAl(Adres adres) =>
        JsonSerializer.Serialize(new
        {
            adres.Baslik,
            adres.AdSoyad,
            adres.Telefon,
            adres.Il,
            adres.Ilce,
            adres.AcikAdres,
            adres.PostaKodu
        });

    /// <summary>
    /// Teklif dönüşümünde adres istemciden gelmez; kullanıcının varsayılan
    /// adresi kullanılır. Adresi yoksa sipariş sevk edilemeyeceği için
    /// oluşturulmaz — önceki sürüm <c>"{}"</c> yazıp adressiz sipariş üretiyordu.
    /// </summary>
    public async Task<Adres> VarsayilanAdresGetirAsync(long kullaniciId, CancellationToken iptalJetonu = default)
    {
        var adres = await _context.Adresler
            .Where(a => a.KullaniciId == kullaniciId)
            .OrderByDescending(a => a.VarsayilanMi)
            .ThenBy(a => a.Id)
            .FirstOrDefaultAsync(iptalJetonu);

        return adres ?? throw new IsKuraliIhlaliException(
            "Siparişe dönüştürmek için önce profilinizde bir adres tanımlamalısınız.");
    }
}
