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
}
