using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cevik.Alan.Ortak;
using Cevik.Alan.Teklif;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Siparis.Arayuzler;
using Cevik.Uygulama.Teklif.Arayuzler;
using Cevik.Uygulama.Teklif.Dto;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Altyapi.Teklif.Servisler;

public class TeklifServisi : ITeklifServisi
{
    private readonly CevikDbContext _context;
    private readonly ISepetServisi _sepetServisi;

    public TeklifServisi(CevikDbContext context, ISepetServisi sepetServisi)
    {
        _context = context;
        _sepetServisi = sepetServisi;
    }

    public async Task<TeklifListelemeDto?> TeklifTalebiOlusturAsync(long kullaniciId, string? oturumAnahtari, TeklifOlusturDto dto)
    {
        var kullanici = await _context.Kullanicilar.FindAsync(kullaniciId);
        if (kullanici == null || kullanici.FirmaId == null) return null; // Sadece firmalar teklif isteyebilir

        var sepetDto = await _sepetServisi.SepetGetirAsync(kullaniciId, oturumAnahtari);
        if (sepetDto == null || !sepetDto.Kalemler.Any()) return null;

        var teklif = new TeklifTalebi
        {
            TalepNo = "TK-" + DateTime.Now.ToString("yyyyMMddHHmmss") + "-" + kullaniciId,
            KullaniciId = kullaniciId,
            FirmaId = kullanici.FirmaId,
            Durum = TeklifDurumu.Yeni,
            MusteriNotu = dto.MusteriNotu
        };

        foreach (var kalem in sepetDto.Kalemler)
        {
            teklif.Kalemler.Add(new TeklifKalemi
            {
                UrunId = kalem.UrunId,
                Miktar = kalem.Miktar,
                HedefBirimFiyat = kalem.BirimFiyat
            });
        }

        _context.TeklifTalepleri.Add(teklif);
        await _context.SaveChangesAsync();

        // Sepeti temizle
        await _sepetServisi.SepetiBosaltAsync(kullaniciId, oturumAnahtari);

        return new TeklifListelemeDto
        {
            Id = teklif.Id,
            TalepNo = teklif.TalepNo,
            Durum = teklif.Durum,
            GecerlilikTarihi = teklif.GecerlilikTarihi
        };
    }

    public async Task<List<TeklifListelemeDto>> TeklifleriGetirAsync(long kullaniciId)
    {
        return await _context.TeklifTalepleri
            .Where(t => t.KullaniciId == kullaniciId)
            .OrderByDescending(t => t.Id)
            .Select(t => new TeklifListelemeDto
            {
                Id = t.Id,
                TalepNo = t.TalepNo,
                Durum = t.Durum,
                GecerlilikTarihi = t.GecerlilikTarihi
            })
            .ToListAsync();
    }

    public async Task<TeklifDetayDto?> TeklifDetayGetirAsync(long kullaniciId, long teklifId)
    {
        return await _context.TeklifTalepleri
            .AsNoTracking()
            .Include(t => t.Kalemler)
            .Where(t => t.KullaniciId == kullaniciId && t.Id == teklifId)
            .Select(t => new TeklifDetayDto
            {
                Id = t.Id,
                TalepNo = t.TalepNo,
                Durum = t.Durum,
                GecerlilikTarihi = t.GecerlilikTarihi,
                MusteriNotu = t.MusteriNotu,
                TemsilciNotu = t.TemsilciNotu,
                Kalemler = t.Kalemler.Select(k => new TeklifKalemiDto
                {
                    Id = k.Id,
                    UrunId = k.UrunId,
                    SerbestUrunKodu = k.SerbestUrunKodu,
                    Miktar = k.Miktar,
                    TeklifEdilenMiktar = k.TeklifEdilenMiktar,
                    HedefBirimFiyat = k.HedefBirimFiyat,
                    TeklifEdilenBirimFiyat = k.TeklifEdilenBirimFiyat,
                    ParaBirimi = k.ParaBirimi,
                    TeklifEdilenTeslimSuresiGun = k.TeklifEdilenTeslimSuresiGun,
                    SatisTemsilcisiNotu = k.SatisTemsilcisiNotu
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }

    public async Task DurumDegistirMusteriAsync(long kullaniciId, long teklifId, bool kabul)
    {
        var teklif = await _context.TeklifTalepleri.FirstOrDefaultAsync(t => t.Id == teklifId && t.KullaniciId == kullaniciId);
        if (teklif == null) throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Teklif bulunamadı.");

        if (teklif.Durum != TeklifDurumu.MusteriOnayiBekliyor)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Sadece onay bekleyen teklifler kabul veya reddedilebilir.");

        if (teklif.GecerlilikTarihi.HasValue && teklif.GecerlilikTarihi < DateTimeOffset.UtcNow)
        {
            teklif.Durum = TeklifDurumu.SuresiDoldu;
            await _context.SaveChangesAsync();
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Teklifin süresi dolmuş.");
        }

        teklif.Durum = kabul ? TeklifDurumu.KabulEdildi : TeklifDurumu.Reddedildi;
        await _context.SaveChangesAsync();
    }

    public async Task SipariseDonusturAsync(long kullaniciId, long teklifId)
    {
        // 1. Transaction scope (to prevent double conversion and ensure atomicity)
        using var tran = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

        var teklif = await _context.TeklifTalepleri
            .Include(t => t.Kalemler)
            .ThenInclude(k => k.Urun)
            .FirstOrDefaultAsync(t => t.Id == teklifId && t.KullaniciId == kullaniciId);

        if (teklif == null) throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Teklif bulunamadı.");

        if (teklif.Durum == TeklifDurumu.SipariseDonusturuldu)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Bu teklif zaten siparişe dönüştürülmüş.");

        if (teklif.Durum != TeklifDurumu.KabulEdildi)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Sadece kabul edilen teklifler siparişe dönüştürülebilir.");

        var siparis = new Cevik.Alan.Siparis.SiparisVarligi
        {
            KullaniciId = kullaniciId,
            FirmaId = teklif.FirmaId,
            SiparisNo = "S-" + DateTime.Now.ToString("yyyyMMddHHmmss") + "-" + kullaniciId,
            Durum = Cevik.Alan.Ortak.SiparisDurumu.Olusturuldu,
            AraToplam = 0m,
            GenelToplam = 0m,
            ParaBirimi = "USD", // simplified for now
            Kur = 1m,
            KaynakTeklifId = teklif.Id,
            FaturaAdresiJson = "{}", // To be filled by user later or fetched from user defaults
            TeslimatAdresiJson = "{}",
            Kalemler = new List<Cevik.Alan.Siparis.SiparisKalemi>()
        };

        foreach (var kalem in teklif.Kalemler)
        {
            if (kalem.UrunId == null || kalem.Urun == null) continue;

            // Fetch the first package or a dummy value for snapshot
            var ambalajId = await _context.UrunAmbalajlari
                .Where(a => a.UrunId == kalem.UrunId)
                .Select(a => a.Id)
                .FirstOrDefaultAsync();

            if (ambalajId == 0) continue; // Skip if no packaging found

            var miktar = kalem.TeklifEdilenMiktar ?? kalem.Miktar;
            var fiyat = kalem.TeklifEdilenBirimFiyat ?? 0;
            var satirTutar = miktar * fiyat;

            siparis.Kalemler.Add(new Cevik.Alan.Siparis.SiparisKalemi
            {
                UrunId = kalem.UrunId.Value,
                UrunAmbalajId = ambalajId,
                Miktar = miktar,
                BirimFiyat = fiyat,
                SatirToplami = satirTutar,
                UrunKoduSnapshot = kalem.Urun.UreticiUrunKodu,
                UrunAdiSnapshot = kalem.Urun.KisaAciklama ?? kalem.Urun.UreticiUrunKodu,
                AmbalajAdiSnapshot = "Varsayılan"
            });
            
            siparis.AraToplam += satirTutar;
            siparis.GenelToplam += satirTutar;
        }

        _context.Siparisler.Add(siparis);
        
        teklif.Durum = TeklifDurumu.SipariseDonusturuldu;
        
        await _context.SaveChangesAsync();
        await tran.CommitAsync();
    }
}
