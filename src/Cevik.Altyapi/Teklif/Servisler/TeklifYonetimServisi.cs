using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cevik.Alan.Ortak;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Teklif.Arayuzler;
using Cevik.Uygulama.Teklif.Dto;
using Cevik.Uygulama.Ortak;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Altyapi.Teklif.Servisler;

public class TeklifYonetimServisi : ITeklifYonetimServisi
{
    private readonly CevikDbContext _context;

    public TeklifYonetimServisi(CevikDbContext context)
    {
        _context = context;
    }

    public async Task<SayfaliSonucDto<TeklifListelemeDto>> TumTeklifleriGetirAsync(int sayfaNo, int sayfaBoyutu)
    {
        sayfaNo = Math.Max(1, sayfaNo);
        sayfaBoyutu = Math.Clamp(sayfaBoyutu, 1, 100);
        var sorgu = _context.TeklifTalepleri.AsNoTracking();
        return new SayfaliSonucDto<TeklifListelemeDto>
        {
            SayfaNo = sayfaNo,
            SayfaBoyutu = sayfaBoyutu,
            ToplamKayit = await sorgu.CountAsync(),
            Kayitlar = await sorgu
            .OrderByDescending(t => t.Id)
            .Skip((sayfaNo - 1) * sayfaBoyutu)
            .Take(sayfaBoyutu)
            .Select(t => new TeklifListelemeDto
            {
                Id = t.Id,
                TalepNo = t.TalepNo,
                Durum = t.Durum,
                GecerlilikTarihi = t.GecerlilikTarihi
            })
            .ToListAsync()
        };
    }

    public async Task<TeklifDetayDto?> TeklifDetayGetirAsync(long teklifId)
    {
        return await _context.TeklifTalepleri
            .AsNoTracking()
            .Include(t => t.Kalemler)
            .Where(t => t.Id == teklifId)
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

    public async Task IncelemeyeAlAsync(long teklifId, long satisTemsilcisiId)
    {
        var teklif = await _context.TeklifTalepleri.FindAsync(teklifId);
        if (teklif == null) throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Teklif bulunamadı.");

        if (teklif.Durum != TeklifDurumu.Yeni)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Sadece yeni teklifler incelemeye alınabilir.");

        teklif.Durum = TeklifDurumu.Inceleniyor;
        teklif.SatisTemsilcisiId = satisTemsilcisiId;
        await _context.SaveChangesAsync();
    }

    public async Task FiyatlandirAsync(long teklifId, TeklifFiyatlandirDto dto)
    {
        var teklif = await _context.TeklifTalepleri.Include(t => t.Kalemler).FirstOrDefaultAsync(t => t.Id == teklifId);
        if (teklif == null) throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Teklif bulunamadı.");

        if (teklif.Durum != TeklifDurumu.Inceleniyor && teklif.Durum != TeklifDurumu.Fiyatlandirildi)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Teklif fiyatlandırılabilir durumda değil.");

        teklif.GecerlilikTarihi = dto.GecerlilikTarihi;
        teklif.TemsilciNotu = dto.TemsilciNotu;
        teklif.Durum = TeklifDurumu.MusteriOnayiBekliyor;

        foreach (var kalem in teklif.Kalemler)
        {
            if (dto.Kalemler.TryGetValue(kalem.Id, out var guncelle))
            {
                kalem.TeklifEdilenMiktar = guncelle.TeklifEdilenMiktar;
                kalem.TeklifEdilenBirimFiyat = guncelle.TeklifEdilenBirimFiyat;
                kalem.ParaBirimi = guncelle.ParaBirimi ?? "USD";
                kalem.TeklifEdilenTeslimSuresiGun = guncelle.TeklifEdilenTeslimSuresiGun;
                kalem.SatisTemsilcisiNotu = guncelle.SatisTemsilcisiNotu;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task ReddetAsync(long teklifId)
    {
        var teklif = await _context.TeklifTalepleri.FindAsync(teklifId);
        if (teklif == null) throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Teklif bulunamadı.");

        if (teklif.Durum == TeklifDurumu.KabulEdildi || teklif.Durum == TeklifDurumu.SipariseDonusturuldu)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Bu aşamadaki teklif reddedilemez.");

        teklif.Durum = TeklifDurumu.Reddedildi;
        await _context.SaveChangesAsync();
    }
}
