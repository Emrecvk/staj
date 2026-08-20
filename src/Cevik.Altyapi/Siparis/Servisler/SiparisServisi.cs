using System.Text.Json;
using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using Cevik.Alan.Siparis;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Siparis.Arayuzler;
using Cevik.Uygulama.Siparis.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Cevik.Altyapi.Siparis.Servisler;

public class SiparisServisi : ISiparisServisi
{
    private readonly CevikDbContext _context;
    private readonly ISepetServisi _sepetServisi;
    private readonly IDovizKuruServisi _dovizKuruServisi;
    private readonly TicariAyarlar _ticari;

    public SiparisServisi(
        CevikDbContext context,
        ISepetServisi sepetServisi,
        IDovizKuruServisi dovizKuruServisi,
        IOptions<TicariAyarlar> ticari)
    {
        _context = context;
        _sepetServisi = sepetServisi;
        _dovizKuruServisi = dovizKuruServisi;
        _ticari = ticari.Value;
    }

    public async Task<SiparisDetayDto?> SiparisOlusturAsync(long kullaniciId, string? oturumAnahtari, SiparisOlusturDto dto)
    {
        var kullanici = await _context.Kullanicilar.FindAsync(kullaniciId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        var sepetDto = await _sepetServisi.SepetGetirAsync(kullaniciId, oturumAnahtari);
        if (sepetDto is null || sepetDto.Kalemler.Count == 0)
            throw new IsKuraliIhlaliException("Sepetiniz boş.");

        var faturaAdresi = await _context.Adresler.FindAsync(dto.FaturaAdresiId);
        var teslimatAdresi = await _context.Adresler.FindAsync(dto.TeslimatAdresiId);

        if (faturaAdresi is null || teslimatAdresi is null)
            throw new KeyNotFoundException("Fatura veya teslimat adresi bulunamadı.");

        if (faturaAdresi.KullaniciId != kullaniciId || teslimatAdresi.KullaniciId != kullaniciId)
            throw new UnauthorizedAccessException("Adres bu kullanıcıya ait değil.");

        // Sipariş anındaki kuru sabitliyoruz: kur yarın değişse bile bu siparişin
        // TL karşılığı değişmemeli.
        var kur = await _dovizKuruServisi.KurGetirAsync(sepetDto.ParaBirimi, _ticari.AnaParaBirimi);

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var siparis = new SiparisVarligi
            {
                SiparisNo = await SiparisNoUretAsync(),
                KullaniciId = kullaniciId,
                FirmaId = kullanici.FirmaId,
                Durum = SiparisDurumu.Olusturuldu,
                ParaBirimi = sepetDto.ParaBirimi,
                Kur = kur,
                MusteriNotu = dto.MusteriNotu,
                FaturaAdresiJson = AdresSnapshotAl(faturaAdresi),
                TeslimatAdresiJson = AdresSnapshotAl(teslimatAdresi)
            };

            decimal araToplam = 0;

            foreach (var kalem in sepetDto.Kalemler)
            {
                var ambalaj = await _context.UrunAmbalajlari
                    .Include(a => a.Urun)
                    .FirstOrDefaultAsync(a => a.Id == kalem.UrunAmbalajId)
                    ?? throw new KeyNotFoundException($"Ürün ambalajı bulunamadı (Id: {kalem.UrunAmbalajId}).");

                // MOQ / katlama kuralı: sepete eklerken kontrol ediliyor ama
                // ambalaj kuralları o günden sonra değişmiş olabilir.
                var miktarKontrol = SiparisMiktarKurali.Dogrula(kalem.Miktar, ambalaj);
                if (!miktarKontrol.Gecerli)
                    throw new IsKuraliIhlaliException(
                        $"{ambalaj.Urun.UreticiUrunKodu}: {miktarKontrol.Hata} " +
                        $"(önerilen miktar: {miktarKontrol.OnerilenMiktar})");

                if (ambalaj.StokMiktari < kalem.Miktar)
                    throw new IsKuraliIhlaliException(
                        $"Stok yetersiz. Ürün: {ambalaj.Urun.UreticiUrunKodu}, " +
                        $"istenen: {kalem.Miktar}, mevcut: {ambalaj.StokMiktari}");

                ambalaj.StokMiktari -= kalem.Miktar;

                siparis.Kalemler.Add(new SiparisKalemi
                {
                    UrunId = ambalaj.UrunId,
                    UrunAmbalajId = ambalaj.Id,
                    // Snapshot: ürün 6 ay sonra yeniden adlandırılsa bile fatura bozulmasın.
                    UrunKoduSnapshot = ambalaj.Urun.UreticiUrunKodu,
                    UrunAdiSnapshot = ambalaj.Urun.KisaAciklama,
                    AmbalajAdiSnapshot = ambalaj.Ad,
                    KdvOrani = _ticari.KdvOrani,
                    Miktar = kalem.Miktar,
                    BirimFiyat = kalem.BirimFiyat,
                    SatirToplami = kalem.ToplamFiyat
                });

                araToplam += kalem.ToplamFiyat;
            }

            siparis.AraToplam = araToplam;
            siparis.KdvTutari = Yuvarla(araToplam * (_ticari.KdvOrani / 100m));
            siparis.KargoUcreti = KargoUcretiHesapla(araToplam, kur);
            siparis.GenelToplam = siparis.AraToplam + siparis.KdvTutari + siparis.KargoUcreti;

            _context.Siparisler.Add(siparis);
            await _context.SaveChangesAsync();

            _context.SiparisDurumGecmisleri.Add(new SiparisDurumGecmisi
            {
                SiparisId = siparis.Id,
                OncekiDurum = null,
                YeniDurum = SiparisDurumu.Olusturuldu,
                DegistirenKullaniciId = kullaniciId,
                Aciklama = "Sipariş oluşturuldu."
            });

            await _sepetServisi.SepetiBosaltAsync(kullaniciId, oturumAnahtari);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return await SiparisDetayGetirAsync(kullaniciId, siparis.Id);
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync();
            // xmin çakışması: aynı ambalajın stoğunu başka bir sipariş değiştirdi.
            throw new IsKuraliIhlaliException(
                "Ürün stokları siz sipariş verirken başka bir müşteri tarafından değiştirildi. Lütfen tekrar deneyin.");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    /// <summary>
    /// Kargo eşiği ana para birimi (varsayılan TRY) cinsindendir; sepet USD ise
    /// karşılaştırmadan önce çevrilir. Önceki sürüm USD tutarı doğrudan
    /// 1000 TL eşiğiyle karşılaştırıyor ve neredeyse her siparişe kargo yazıyordu.
    /// </summary>
    private decimal KargoUcretiHesapla(decimal araToplam, decimal kur)
    {
        var anaParaBirimindeTutar = araToplam * kur;

        if (anaParaBirimindeTutar >= _ticari.UcretsizKargoEsigi)
            return 0m;

        // Kargo ücreti de siparişin para biriminde yazılmalı.
        return kur == 0 ? _ticari.KargoUcreti : Yuvarla(_ticari.KargoUcreti / kur);
    }

    private static decimal Yuvarla(decimal deger) => Math.Round(deger, 4, MidpointRounding.AwayFromZero);

    private static string AdresSnapshotAl(Cevik.Alan.Kimlik.Adres adres) =>
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
    /// SIP-2026-000123 biçiminde, yıl içinde artan sipariş numarası.
    /// Önceki sürüm saniye damgası kullanıyordu; aynı saniyede iki sipariş
    /// aynı numarayı alabiliyordu.
    /// </summary>
    private async Task<string> SiparisNoUretAsync()
    {
        var yil = DateTimeOffset.UtcNow.Year;
        var onEk = $"SIP-{yil}-";

        var sonNumara = await _context.Siparisler
            .IgnoreQueryFilters()
            .Where(s => s.SiparisNo.StartsWith(onEk))
            .OrderByDescending(s => s.Id)
            .Select(s => s.SiparisNo)
            .FirstOrDefaultAsync();

        var siradaki = 1;
        if (sonNumara is not null && int.TryParse(sonNumara[onEk.Length..], out var mevcut))
            siradaki = mevcut + 1;

        return onEk + siradaki.ToString("D6");
    }

    public async Task<List<SiparisListelemeDto>> SiparisleriGetirAsync(long kullaniciId)
    {
        return await _context.Siparisler
            .Where(s => s.KullaniciId == kullaniciId)
            .OrderByDescending(s => s.Id)
            .Select(s => new SiparisListelemeDto
            {
                Id = s.Id,
                SiparisNo = s.SiparisNo,
                Durum = s.Durum,
                GenelToplam = s.GenelToplam,
                ParaBirimi = s.ParaBirimi,
                Tarih = s.GuncellemeTarihi ?? s.OlusturmaTarihi
            })
            .ToListAsync();
    }

    public async Task<SiparisDetayDto?> SiparisDetayGetirAsync(long kullaniciId, long siparisId)
    {
        var siparis = await _context.Siparisler
            .Include(s => s.Kalemler)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == siparisId && s.KullaniciId == kullaniciId);

        if (siparis is null) return null;

        return new SiparisDetayDto
        {
            Id = siparis.Id,
            SiparisNo = siparis.SiparisNo,
            Durum = siparis.Durum,
            GenelToplam = siparis.GenelToplam,
            ParaBirimi = siparis.ParaBirimi,
            Tarih = siparis.GuncellemeTarihi ?? siparis.OlusturmaTarihi,
            AraToplam = siparis.AraToplam,
            KdvTutari = siparis.KdvTutari,
            KargoUcreti = siparis.KargoUcreti,
            // Snapshot alanlarından okuyoruz: ürün sonradan silinse bile
            // sipariş detayı eksiksiz görünmeli.
            Kalemler = siparis.Kalemler.Select(k => new SiparisKalemDto
            {
                UrunId = k.UrunId,
                UrunKodu = k.UrunKoduSnapshot,
                Miktar = k.Miktar,
                BirimFiyat = k.BirimFiyat,
                ToplamFiyat = k.SatirToplami
            }).ToList()
        };
    }
}
