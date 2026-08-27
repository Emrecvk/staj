using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cevik.Alan.Ortak;
using Cevik.Alan.Teklif;
using Cevik.Altyapi.Siparis.Servisler;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Siparis.Arayuzler;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Teklif.Arayuzler;
using Cevik.Uygulama.Teklif.Dto;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Altyapi.Teklif.Servisler;

public class TeklifServisi : ITeklifServisi
{
    private readonly CevikDbContext _context;
    private readonly ISepetServisi _sepetServisi;
    private readonly IDovizKuruServisi _dovizKuruServisi;
    private readonly SiparisKurucu _kurucu;

    public TeklifServisi(
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

    /// <summary>
    /// Teklif talebi yalnızca ONAYLANMIŞ firmanın yetkilisine açıktır.
    ///
    /// Önceki sürüm sadece <c>FirmaId != null</c> bakıyordu; firma kaydını
    /// kullanıcı kendisi oluşturduğu ve kayıt <see cref="FirmaOnayDurumu.Beklemede"/>
    /// başladığı için admin onay adımı fiilen işlevsizdi — uydurma vergi
    /// numarasıyla açılan her firma B2B teklif akışına giriyordu.
    /// </summary>
    public async Task<TeklifListelemeDto> TeklifTalebiOlusturAsync(long kullaniciId, string? oturumAnahtari, TeklifOlusturDto dto)
    {
        var kullanici = await _context.Kullanicilar
            .Include(k => k.Firma)
            .FirstOrDefaultAsync(k => k.Id == kullaniciId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        if (kullanici.FirmaId is null || kullanici.Firma is null)
            throw new UnauthorizedAccessException("Teklif talebi yalnızca kurumsal hesaplarla oluşturulabilir.");

        if (!kullanici.FirmaYetkilisiMi)
            throw new UnauthorizedAccessException("Teklif talebini yalnızca firma yetkilisi oluşturabilir.");

        if (kullanici.Firma.OnayDurumu != FirmaOnayDurumu.Onaylandi)
            throw new UnauthorizedAccessException(
                "Firma başvurunuz henüz onaylanmadı. Onaydan sonra teklif talebi oluşturabilirsiniz.");

        var sepetDto = await _sepetServisi.SepetGetirAsync(kullaniciId, oturumAnahtari);
        if (sepetDto is null || sepetDto.Kalemler.Count == 0)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Sepetiniz boş, teklif talebi oluşturulamaz.");

        var teklif = new TeklifTalebi
        {
            TalepNo = await TalepNoUretAsync(),
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
                // Ambalaj bilgisi teklifle birlikte taşınmalı: MOQ, katlama ve
                // stok ambalaj başınadır. Önceki sürüm bunu düşürüyor, siparişe
                // dönüşte ambalaj rastgele seçiliyordu.
                UrunAmbalajId = kalem.UrunAmbalajId,
                Miktar = kalem.Miktar,
                HedefBirimFiyat = kalem.BirimFiyat,
                ParaBirimi = sepetDto.ParaBirimi
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

    public async Task<SayfaliSonucDto<TeklifListelemeDto>> TeklifleriGetirAsync(
        long kullaniciId,
        int sayfaNo,
        int sayfaBoyutu)
    {
        sayfaNo = Math.Max(1, sayfaNo);
        sayfaBoyutu = Math.Clamp(sayfaBoyutu, 1, 100);
        var sorgu = _context.TeklifTalepleri.Where(t => t.KullaniciId == kullaniciId);
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

    /// <summary>
    /// Kabul edilmiş teklifi siparişe çevirir.
    ///
    /// Sipariş kurma adımlarının tamamı <see cref="SiparisKurucu"/> üzerinden
    /// geçer — sepetten sipariş verme yoluyla BİREBİR aynı kurallar işler.
    /// Önceki sürüm burada paralel ve eksik bir kopya çalıştırıyordu:
    /// MOQ/katlama doğrulanmıyor, stok ne kontrol ediliyor ne düşülüyor,
    /// KDV ve kargo hiç hesaplanmıyor, para birimi "USD" ve kur 1 sabitleniyor,
    /// adres "{}" yazılıyor, fiyatlandırılmamış kalem 0,00 ile siparişe giriyor
    /// ve ürünü/ambalajı çözülemeyen kalemler sessizce atlanıyordu.
    /// </summary>
    public async Task SipariseDonusturAsync(long kullaniciId, long teklifId)
    {
        var teklif = await _context.TeklifTalepleri
            .Include(t => t.Kalemler)
            .ThenInclude(k => k.Urun)
            .FirstOrDefaultAsync(t => t.Id == teklifId && t.KullaniciId == kullaniciId)
            ?? throw new KeyNotFoundException("Teklif bulunamadı.");

        if (teklif.Durum == TeklifDurumu.SipariseDonusturuldu)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Bu teklif zaten siparişe dönüştürülmüş.");

        if (teklif.Durum != TeklifDurumu.KabulEdildi)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Sadece kabul edilen teklifler siparişe dönüştürülebilir.");

        if (teklif.Kalemler.Count == 0)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException("Teklifte kalem yok.");

        // Her kalem bir ambalaja bağlanmalı: MOQ, katlama ve stok ambalaj
        // başınadır. UrunAmbalajId alanı sonradan eklendiği için eski
        // tekliflerde null olabilir; o durumda ürünün VARSAYILAN ambalajına
        // düşülür. Rastgele "ilk ambalaj" seçilmez — varsayılan yoksa en
        // küçük Id ile deterministik davranılır.
        var ambalajCozumu = await AmbalajlariCozAsync(teklif.Kalemler);

        // Eksik kalemi sessizce atlamak yerine dönüşümü durdur: müşteri
        // N kalemli teklifi kabul edip daha az kalemli sipariş almamalı.
        var cozulemeyen = teklif.Kalemler
            .Where(k => !ambalajCozumu.ContainsKey(k.Id))
            .Select(k => k.SerbestUrunKodu ?? k.Urun?.UreticiUrunKodu ?? $"#{k.Id}")
            .ToList();

        if (cozulemeyen.Count > 0)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException(
                "Katalogda karşılığı olmayan kalemler siparişe dönüştürülemez: " +
                string.Join(", ", cozulemeyen) +
                ". Satış temsilcinizle iletişime geçin.");

        var fiyatsiz = teklif.Kalemler
            .Where(k => k.TeklifEdilenBirimFiyat is null or <= 0m)
            .Select(k => k.Urun?.UreticiUrunKodu ?? $"#{k.Id}")
            .ToList();

        if (fiyatsiz.Count > 0)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException(
                "Fiyatlandırılmamış kalemler siparişe dönüştürülemez: " + string.Join(", ", fiyatsiz));

        // Teklif kalemleri tek para biriminde olmalı; karışık kalemlerde
        // tutarlar toplanamaz.
        var paraBirimleri = teklif.Kalemler
            .Select(k => k.ParaBirimi ?? _kurucu.Ticari.AnaParaBirimi)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (paraBirimleri.Count > 1)
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException(
                "Teklif kalemleri farklı para birimlerinde fiyatlandırılmış: " +
                string.Join(", ", paraBirimleri) + ". Siparişe dönüştürülemez.");

        var paraBirimi = paraBirimleri[0];
        var adres = await _kurucu.VarsayilanAdresGetirAsync(kullaniciId);

        // Sipariş anındaki kuru sabitliyoruz: kur yarın değişse bile bu
        // siparişin ana para birimi karşılığı değişmemeli.
        var kur = await _dovizKuruServisi.KurGetirAsync(paraBirimi, _kurucu.Ticari.AnaParaBirimi);

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var siparis = new Cevik.Alan.Siparis.SiparisVarligi
            {
                SiparisNo = await _kurucu.SiparisNoUretAsync(),
                KullaniciId = kullaniciId,
                FirmaId = teklif.FirmaId,
                Durum = SiparisDurumu.Olusturuldu,
                ParaBirimi = paraBirimi,
                Kur = kur,
                KaynakTeklifId = teklif.Id,
                MusteriNotu = teklif.MusteriNotu,
                FaturaAdresiJson = SiparisKurucu.AdresSnapshotAl(adres),
                TeslimatAdresiJson = SiparisKurucu.AdresSnapshotAl(adres)
            };

            decimal araToplam = 0;

            foreach (var kalem in teklif.Kalemler)
            {
                var miktar = kalem.TeklifEdilenMiktar ?? kalem.Miktar;

                var siparisKalemi = await _kurucu.KalemKurAsync(
                    ambalajCozumu[kalem.Id], miktar, kalem.TeklifEdilenBirimFiyat!.Value);

                siparis.Kalemler.Add(siparisKalemi);
                araToplam += siparisKalemi.SatirToplami;
            }

            _kurucu.ToplamlariYaz(siparis, araToplam);

            _context.Siparisler.Add(siparis);
            teklif.Durum = TeklifDurumu.SipariseDonusturuldu;
            await _context.SaveChangesAsync();

            _context.SiparisDurumGecmisleri.Add(new Cevik.Alan.Siparis.SiparisDurumGecmisi
            {
                SiparisId = siparis.Id,
                OncekiDurum = null,
                YeniDurum = SiparisDurumu.Olusturuldu,
                DegistirenKullaniciId = kullaniciId,
                Aciklama = $"{teklif.TalepNo} numaralı tekliften oluşturuldu."
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync();
            // xmin çakışması: aynı ambalajın stoğunu başka bir sipariş değiştirdi.
            throw new Cevik.Uygulama.Ortak.IsKuraliIhlaliException(
                "Ürün stokları siz sipariş verirken başka bir müşteri tarafından değiştirildi. Lütfen tekrar deneyin.");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    /// <summary>
    /// Teklif kalemi → ambalaj eşlemesi. Kalemin kendi <c>UrunAmbalajId</c>'si
    /// varsa o kullanılır; yoksa (alan sonradan eklendiği için eski kayıtlarda
    /// null'dır) ürünün varsayılan ambalajına düşülür. Ürünü de ambalajı da
    /// çözülemeyen kalemler sözlükte yer almaz ve çağıran tarafından reddedilir.
    /// </summary>
    private async Task<Dictionary<long, long>> AmbalajlariCozAsync(ICollection<TeklifKalemi> kalemler)
    {
        var sonuc = new Dictionary<long, long>();

        foreach (var kalem in kalemler)
            if (kalem.UrunAmbalajId is { } ambalajId)
                sonuc[kalem.Id] = ambalajId;

        var ambalajsizUrunIdleri = kalemler
            .Where(k => k.UrunAmbalajId is null && k.UrunId is not null)
            .Select(k => k.UrunId!.Value)
            .Distinct()
            .ToList();

        if (ambalajsizUrunIdleri.Count == 0) return sonuc;

        var varsayilanlar = await _context.UrunAmbalajlari
            .Where(a => ambalajsizUrunIdleri.Contains(a.UrunId))
            .OrderByDescending(a => a.VarsayilanMi)
            .ThenBy(a => a.Id)
            .Select(a => new { a.UrunId, a.Id })
            .ToListAsync();

        var urunBasinaVarsayilan = varsayilanlar
            .GroupBy(a => a.UrunId)
            .ToDictionary(g => g.Key, g => g.First().Id);

        foreach (var kalem in kalemler)
        {
            if (sonuc.ContainsKey(kalem.Id) || kalem.UrunId is null) continue;

            if (urunBasinaVarsayilan.TryGetValue(kalem.UrunId.Value, out var ambalajId))
                sonuc[kalem.Id] = ambalajId;
        }

        return sonuc;
    }

    /// <summary>
    /// TK-2026-000123 biçiminde, yıl içinde artan talep numarası.
    /// Saniye damgalı önceki şema aynı saniyedeki iki talepte
    /// <c>TalepNo</c> unique index'ini ihlal ediyordu.
    /// </summary>
    private async Task<string> TalepNoUretAsync()
    {
        var onEk = $"TK-{DateTimeOffset.UtcNow.Year}-";

        var sonNumara = await _context.TeklifTalepleri
            .IgnoreQueryFilters()
            .Where(t => t.TalepNo.StartsWith(onEk))
            .OrderByDescending(t => t.Id)
            .Select(t => t.TalepNo)
            .FirstOrDefaultAsync();

        var siradaki = 1;
        if (sonNumara is not null && int.TryParse(sonNumara[onEk.Length..], out var mevcut))
            siradaki = mevcut + 1;

        return onEk + siradaki.ToString("D6");
    }
}
