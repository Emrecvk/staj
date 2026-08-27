using Cevik.Alan.Bom;
using Cevik.Alan.Katalog;
using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Bom.Arayuzler;
using Cevik.Uygulama.Bom.Dto;
using Cevik.Uygulama.Ortak;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Altyapi.Bom.Servisler;

public class MalzemeListesiServisi : IMalzemeListesiServisi
{
    private const int EnFazlaKalem = 500;
    private readonly CevikDbContext _context;

    public MalzemeListesiServisi(CevikDbContext context) => _context = context;

    public async Task<MalzemeListesiSonucDto> YukleVeEslestirAsync(
        MalzemeListesiYukleDto dto,
        long? kullaniciId,
        int? firmaId)
    {
        if (dto.Kalemler.Count is 0 or > EnFazlaKalem)
            throw new IsKuraliIhlaliException($"Malzeme listesi 1-{EnFazlaKalem} kalem içermelidir.");

        if (dto.Kalemler.Any(k => string.IsNullOrWhiteSpace(k.ArananKod) || k.Miktar <= 0))
            throw new IsKuraliIhlaliException("Her BOM kaleminde ürün kodu ve sıfırdan büyük miktar bulunmalıdır.");

        var liste = new MalzemeListesi
        {
            Ad = dto.Ad.Trim(),
            Aciklama = dto.Aciklama?.Trim(),
            KullaniciId = kullaniciId,
            FirmaId = firmaId
        };

        var sonuc = new MalzemeListesiSonucDto { Ad = liste.Ad };

        foreach (var satir in dto.Kalemler.OrderBy(k => k.SatirNo))
        {
            var normalizeKod = UrunKoduNormalizeleyici.Normalize(satir.ArananKod);
            var adayUrunler = await AdaylariGetirAsync(normalizeKod);
            var adaylar = adayUrunler
                .Select(u => AdayaCevir(u, satir.Miktar, normalizeKod))
                .Where(a => a is not null)
                .Cast<BomAdayDto>()
                .ToList();

            var tamEslesme = adaylar.FirstOrDefault(a =>
                UrunKoduNormalizeleyici.Normalize(a.UreticiUrunKodu) == normalizeKod);
            var secilen = tamEslesme ?? (adaylar.Count == 1 ? adaylar[0] : null);

            var kalem = new MalzemeListesiKalemi
            {
                SatirNo = satir.SatirNo,
                ArananKod = satir.ArananKod.Trim(),
                Referanslar = satir.Referanslar?.Trim(),
                Miktar = satir.Miktar,
                EslesenUrunId = secilen?.UrunId,
                EslesmeDurumu = secilen is null
                    ? adaylar.Count == 0 ? BomEslesmeDurumu.Bulunamadi : BomEslesmeDurumu.OlasiEslesme
                    : tamEslesme is null ? BomEslesmeDurumu.OlasiEslesme : BomEslesmeDurumu.TamEslesme,
                EslesmeSkoru = secilen?.EslesmeSkoru ?? 0
            };
            liste.Kalemler.Add(kalem);

            sonuc.Kalemler.Add(new BomKalemSonucDto
            {
                SatirNo = satir.SatirNo,
                ArananKod = satir.ArananKod,
                Referanslar = satir.Referanslar,
                Miktar = satir.Miktar,
                EslesmeDurumu = (short)kalem.EslesmeDurumu,
                Secilen = secilen,
                Adaylar = adaylar
            });
        }

        _context.MalzemeListeleri.Add(liste);
        await _context.SaveChangesAsync();

        sonuc.Id = liste.Id;
        for (var i = 0; i < sonuc.Kalemler.Count; i++)
            sonuc.Kalemler[i].KalemId = liste.Kalemler.OrderBy(k => k.SatirNo).ElementAt(i).Id;

        return sonuc;
    }

    public async Task<BomAdayDto> AdaySecAsync(long listeId, long kalemId, long urunId, long? kullaniciId)
    {
        var kalem = await _context.MalzemeListesiKalemleri
            .Include(k => k.MalzemeListesi)
            .FirstOrDefaultAsync(k => k.Id == kalemId && k.MalzemeListesiId == listeId)
            ?? throw new KeyNotFoundException("BOM kalemi bulunamadı.");

        if (kalem.MalzemeListesi.KullaniciId is not null && kalem.MalzemeListesi.KullaniciId != kullaniciId)
            throw new UnauthorizedAccessException("Bu malzeme listesine erişemezsiniz.");

        var urun = await _context.Urunler
            .AsNoTracking()
            .Include(u => u.Uretici)
            .Include(u => u.UrunAmbalajlari).ThenInclude(a => a.FiyatKademeleri)
            .FirstOrDefaultAsync(u => u.Id == urunId && u.Aktif)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var aday = AdayaCevir(urun, kalem.Miktar, UrunKoduNormalizeleyici.Normalize(kalem.ArananKod))
            ?? throw new IsKuraliIhlaliException("Seçilen ürünün satışa açık ambalajı yok.");

        kalem.EslesenUrunId = urun.Id;
        kalem.EslesmeDurumu = BomEslesmeDurumu.OlasiEslesme;
        kalem.EslesmeSkoru = aday.EslesmeSkoru;
        await _context.SaveChangesAsync();
        return aday;
    }

    private async Task<List<Urun>> AdaylariGetirAsync(string normalizeKod)
    {
        var tam = await _context.Urunler
            .AsNoTracking()
            .Include(u => u.Uretici)
            .Include(u => u.UrunAmbalajlari).ThenInclude(a => a.FiyatKademeleri)
            .Where(u => u.Aktif && u.NormalizeKod == normalizeKod)
            .Take(1)
            .ToListAsync();

        if (tam.Count > 0) return tam;

        return await _context.Urunler
            .AsNoTracking()
            .Include(u => u.Uretici)
            .Include(u => u.UrunAmbalajlari).ThenInclude(a => a.FiyatKademeleri)
            .Where(u => u.Aktif && EF.Functions.TrigramsSimilarity(u.NormalizeKod, normalizeKod) >= 0.25)
            .OrderByDescending(u => EF.Functions.TrigramsSimilarity(u.NormalizeKod, normalizeKod))
            .ThenBy(u => u.Id)
            .Take(5)
            .ToListAsync();
    }

    private static BomAdayDto? AdayaCevir(Urun urun, int istenenMiktar, string normalizeKod)
    {
        var ambalaj = urun.UrunAmbalajlari
            .Where(a => a.FiyatKademeleri.Count > 0)
            .OrderByDescending(a => a.VarsayilanMi)
            .ThenByDescending(a => a.StokMiktari >= istenenMiktar)
            .ThenBy(a => a.Id)
            .FirstOrDefault();
        if (ambalaj is null) return null;

        var kontrol = SiparisMiktarKurali.Dogrula(istenenMiktar, ambalaj);
        var gecerliMiktar = kontrol.Gecerli ? istenenMiktar : kontrol.OnerilenMiktar;
        var kademe = FiyatKademesiSecici.Sec(ambalaj.FiyatKademeleri, gecerliMiktar);
        var urunKodu = UrunKoduNormalizeleyici.Normalize(urun.UreticiUrunKodu);

        return new BomAdayDto
        {
            UrunId = urun.Id,
            UreticiUrunKodu = urun.UreticiUrunKodu,
            UreticiAd = urun.Uretici.Ad,
            KisaAciklama = urun.KisaAciklama,
            AmbalajId = ambalaj.Id,
            AmbalajAdi = ambalaj.Ad,
            Mpq = ambalaj.Mpq,
            Moq = ambalaj.Moq,
            KatlamaMiktari = ambalaj.KatlamaMiktari,
            StokMiktari = ambalaj.StokMiktari,
            GecerliMiktar = gecerliMiktar,
            StokYeterliMi = ambalaj.StokMiktari >= gecerliMiktar,
            BirimFiyat = kademe?.BirimFiyat,
            ParaBirimi = kademe?.ParaBirimi,
            EslesmeSkoru = EslesmeSkoruHesapla(normalizeKod, urunKodu)
        };
    }

    private static int EslesmeSkoruHesapla(string aranan, string bulunan)
    {
        if (aranan == bulunan) return 100;
        if (bulunan.Contains(aranan, StringComparison.Ordinal)) return 90;

        var ortak = aranan.Intersect(bulunan).Count();
        return Math.Clamp((int)Math.Round(100m * ortak / Math.Max(aranan.Length, bulunan.Length)), 1, 89);
    }
}
