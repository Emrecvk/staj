using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using Cevik.Alan.Siparis;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Odemeler.Arayuzler;
using Cevik.Uygulama.Odemeler.Dto;
using Cevik.Uygulama.Ortak;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Altyapi.Odemeler.Servisler;

public class OdemeServisi : IOdemeServisi
{
    private const string DurumBasarili = "Basarili";
    private const string DurumBasarisiz = "Basarisiz";

    private readonly CevikDbContext _context;
    private readonly IOdemeSaglayicisi _saglayici;

    public OdemeServisi(CevikDbContext context, IOdemeSaglayicisi saglayici)
    {
        _context = context;
        _saglayici = saglayici;
    }

    public async Task<OdemeYanitDto> OdemeYapAsync(long kullaniciId, long siparisId, OdemeIstekDto istek)
    {
        var siparis = await _context.Siparisler
            .FirstOrDefaultAsync(s => s.Id == siparisId)
            ?? throw new KeyNotFoundException("Sipariş bulunamadı.");

        // Yetki: kullanıcı yalnızca kendi siparişini ödeyebilir.
        if (siparis.KullaniciId != kullaniciId)
            throw new UnauthorizedAccessException("Bu sipariş size ait değil.");

        // Çift tahsilat koruması: zaten ödenmiş siparişe ikinci kez para çekilmez.
        var zatenOdendi = await _context.Odemeler
            .AnyAsync(o => o.SiparisId == siparisId && o.Durum == DurumBasarili);

        if (zatenOdendi)
            throw new IsKuraliIhlaliException("Bu siparişin ödemesi zaten alınmış.");

        if (siparis.Durum is not (SiparisDurumu.Olusturuldu or SiparisDurumu.OdemeBekliyor))
            throw new IsKuraliIhlaliException(
                $"'{siparis.Durum}' durumundaki bir sipariş için ödeme alınamaz.");

        // Sipariş ödeme beklemeye alınır; sağlayıcı yanıtı gecikse veya
        // uygulama çökse bile siparişin nerede kaldığı kayıtta görünür.
        if (siparis.Durum == SiparisDurumu.Olusturuldu)
            DurumuIlerlet(siparis, SiparisDurumu.OdemeBekliyor, kullaniciId, "Ödeme başlatıldı");

        var sonuc = await _saglayici.TahsilEtAsync(new OdemeTalebi(
            siparis.SiparisNo, siparis.GenelToplam, siparis.ParaBirimi, istek.OdemeJetonu));

        // Her deneme — başarısız olanlar dahil — kaydedilir. Yeniden deneme
        // akışının denetlenebilmesi için geçmiş şart.
        _context.Odemeler.Add(new Alan.Siparis.Odeme
        {
            SiparisId = siparis.Id,
            Yontem = "KrediKarti",
            Saglayici = _saglayici.Ad,
            SaglayiciReferans = sonuc.Referans,
            Tutar = siparis.GenelToplam,
            Durum = sonuc.Basarili ? DurumBasarili : DurumBasarisiz,
            HamYanitJson = sonuc.HamYanitJson,
        });

        if (sonuc.Basarili)
            DurumuIlerlet(siparis, SiparisDurumu.Onaylandi, kullaniciId, "Ödeme alındı");

        await _context.SaveChangesAsync();

        return new OdemeYanitDto
        {
            Basarili = sonuc.Basarili,
            Mesaj = sonuc.Mesaj,
            HataKodu = sonuc.HataKodu,
            // Başarısız ödemede sipariş OdemeBekliyor'da kalır; kullanıcı
            // aynı sipariş üzerinden tekrar deneyebilir.
            YenidenDenenebilir = !sonuc.Basarili && sonuc.YenidenDenenebilir,
            SiparisNo = siparis.SiparisNo,
            SiparisDurumu = (short)siparis.Durum,
        };
    }

    public async Task<IReadOnlyList<OdemeDenemesiDto>> DenemeleriGetirAsync(long kullaniciId, long siparisId)
    {
        var siparis = await _context.Siparisler
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == siparisId)
            ?? throw new KeyNotFoundException("Sipariş bulunamadı.");

        if (siparis.KullaniciId != kullaniciId)
            throw new UnauthorizedAccessException("Bu sipariş size ait değil.");

        return await _context.Odemeler
            .Where(o => o.SiparisId == siparisId)
            .OrderByDescending(o => o.OlusturmaTarihi)
            .AsNoTracking()
            .Select(o => new OdemeDenemesiDto
            {
                Id = o.Id,
                Durum = o.Durum,
                Saglayici = o.Saglayici,
                SaglayiciReferans = o.SaglayiciReferans,
                Tutar = o.Tutar,
                Tarih = o.OlusturmaTarihi,
            })
            .ToListAsync();
    }

    /// <summary>
    /// Durum geçişini kural tablosundan doğrulayarak uygular ve geçmişe yazar.
    /// Doğrudan atama yapılmaz; geçiş kuralı tek yerde kalmalı.
    /// </summary>
    private void DurumuIlerlet(SiparisVarligi siparis, SiparisDurumu hedef, long kullaniciId, string aciklama)
    {
        if (!SiparisDurumMakinesi.GecisGecerliMi(siparis.Durum, hedef))
            throw new IsKuraliIhlaliException($"{siparis.Durum} → {hedef} geçişi geçersiz.");

        var oncekiDurum = siparis.Durum;
        siparis.Durum = hedef;

        _context.SiparisDurumGecmisleri.Add(new SiparisDurumGecmisi
        {
            SiparisId = siparis.Id,
            OncekiDurum = oncekiDurum,
            YeniDurum = hedef,
            Aciklama = aciklama,
            DegistirenKullaniciId = kullaniciId,
        });
    }
}
