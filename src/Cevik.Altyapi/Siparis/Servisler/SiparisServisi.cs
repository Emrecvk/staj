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
    private readonly SiparisKurucu _kurucu;

    public SiparisServisi(
        CevikDbContext context,
        ISepetServisi sepetServisi,
        IDovizKuruServisi dovizKuruServisi,
        SiparisKurucu kurucu)
    {
        _context = context;
        _sepetServisi = sepetServisi;
        _dovizKuruServisi = dovizKuruServisi;
        _kurucu = kurucu;
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
        var kur = await _dovizKuruServisi.KurGetirAsync(sepetDto.ParaBirimi, _kurucu.Ticari.AnaParaBirimi);

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var siparis = new SiparisVarligi
            {
                SiparisNo = await _kurucu.SiparisNoUretAsync(),
                KullaniciId = kullaniciId,
                FirmaId = kullanici.FirmaId,
                Durum = SiparisDurumu.Olusturuldu,
                ParaBirimi = sepetDto.ParaBirimi,
                Kur = kur,
                MusteriNotu = dto.MusteriNotu,
                FaturaAdresiJson = SiparisKurucu.AdresSnapshotAl(faturaAdresi),
                TeslimatAdresiJson = SiparisKurucu.AdresSnapshotAl(teslimatAdresi)
            };

            decimal araToplam = 0;
            decimal indirimTutari = 0;

            foreach (var kalem in sepetDto.Kalemler)
            {
                // Doğrulama + stok düşümü + snapshot tek yerde: SiparisKurucu.
                // Teklif dönüşümü de aynı metodu çağırır, iki yol ayrışamaz.
                var siparisKalemi = await _kurucu.KalemKurAsync(
                    kalem.UrunAmbalajId, kalem.Miktar, kalem.BirimFiyat);

                siparis.Kalemler.Add(siparisKalemi);
                araToplam += kalem.ListeBirimFiyati * kalem.Miktar;
                indirimTutari += kalem.IndirimTutari;
            }

            _kurucu.ToplamlariYaz(siparis, araToplam, indirimTutari);

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

    public async Task<SayfaliSonucDto<SiparisListelemeDto>> SiparisleriGetirAsync(
        long kullaniciId,
        int sayfaNo,
        int sayfaBoyutu)
    {
        sayfaNo = Math.Max(1, sayfaNo);
        sayfaBoyutu = Math.Clamp(sayfaBoyutu, 1, 100);
        var sorgu = _context.Siparisler.Where(s => s.KullaniciId == kullaniciId);
        return new SayfaliSonucDto<SiparisListelemeDto>
        {
            SayfaNo = sayfaNo,
            SayfaBoyutu = sayfaBoyutu,
            ToplamKayit = await sorgu.CountAsync(),
            Kayitlar = await sorgu
            .OrderByDescending(s => s.Id)
            .Skip((sayfaNo - 1) * sayfaBoyutu)
            .Take(sayfaBoyutu)
            .Select(s => new SiparisListelemeDto
            {
                Id = s.Id,
                SiparisNo = s.SiparisNo,
                Durum = s.Durum,
                GenelToplam = s.GenelToplam,
                ParaBirimi = s.ParaBirimi,
                Tarih = s.GuncellemeTarihi ?? s.OlusturmaTarihi
            })
            .ToListAsync()
        };
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
            IndirimTutari = siparis.IndirimTutari,
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
