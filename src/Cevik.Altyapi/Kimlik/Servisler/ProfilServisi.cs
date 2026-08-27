using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Kimlik.Arayuzler;
using Cevik.Uygulama.Kimlik.Dto;
using Microsoft.EntityFrameworkCore;
using Cevik.Uygulama.Ortak;

namespace Cevik.Altyapi.Kimlik.Servisler;

public class ProfilServisi : IProfilServisi
{
    private readonly CevikDbContext _context;

    public ProfilServisi(CevikDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdresDto>> AdresleriGetirAsync(long kullaniciId)
    {
        return await _context.Adresler
            .AsNoTracking()
            .Where(a => a.KullaniciId == kullaniciId)
            .Select(a => new AdresDto
            {
                Id = a.Id,
                Baslik = a.Baslik,
                Sehir = a.Il,
                Ilce = a.Ilce,
                PostaKodu = a.PostaKodu ?? "",
                AcikAdres = a.AcikAdres,
                FaturaAdresiMi = a.Tip == AdresTipi.Fatura
            })
            .ToListAsync();
    }

    public async Task<AdresDto?> AdresEkleAsync(long kullaniciId, AdresEkleDto dto)
    {
        var kullanici = await _context.Kullanicilar.FindAsync(kullaniciId);
        if (kullanici == null) return null;

        var adres = new Adres
        {
            KullaniciId = kullaniciId,
            Baslik = dto.Baslik,
            AdSoyad = kullanici.Ad + " " + kullanici.Soyad,
            Il = dto.Sehir,
            Ilce = dto.Ilce,
            PostaKodu = dto.PostaKodu,
            AcikAdres = dto.AcikAdres,
            Tip = dto.FaturaAdresiMi ? AdresTipi.Fatura : AdresTipi.Teslimat
        };

        _context.Adresler.Add(adres);
        await _context.SaveChangesAsync();

        return new AdresDto
        {
            Id = adres.Id,
            Baslik = adres.Baslik,
            Sehir = adres.Il,
            Ilce = adres.Ilce,
            PostaKodu = adres.PostaKodu ?? "",
            AcikAdres = adres.AcikAdres,
            FaturaAdresiMi = adres.Tip == AdresTipi.Fatura
        };
    }

    public async Task<bool> AdresSilAsync(long kullaniciId, long adresId)
    {
        var adres = await _context.Adresler.FirstOrDefaultAsync(a => a.Id == adresId && a.KullaniciId == kullaniciId);
        if (adres == null) return false;

        _context.Adresler.Remove(adres);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<SayfaliSonucDto<FavoriDto>> FavorileriGetirAsync(long kullaniciId, int sayfaNo, int sayfaBoyutu)
    {
        sayfaNo = Math.Max(1, sayfaNo);
        sayfaBoyutu = Math.Clamp(sayfaBoyutu, 1, 100);
        var sorgu = _context.Favoriler.Where(f => f.KullaniciId == kullaniciId);
        return new SayfaliSonucDto<FavoriDto>
        {
            SayfaNo = sayfaNo,
            SayfaBoyutu = sayfaBoyutu,
            ToplamKayit = await sorgu.CountAsync(),
            Kayitlar = await sorgu
            .Include(f => f.Urun)
            .ThenInclude(u => u.UrunAmbalajlari)
            .ThenInclude(a => a.FiyatKademeleri)
            .AsNoTracking()
            .OrderByDescending(f => f.OlusturmaTarihi)
            .Skip((sayfaNo - 1) * sayfaBoyutu)
            .Take(sayfaBoyutu)
            .Select(f => new FavoriDto
            {
                UrunId = f.UrunId,
                UrunKodu = f.Urun.UreticiUrunKodu,
                KisaAciklama = f.Urun.KisaAciklama,
                Fiyat = f.Urun.UrunAmbalajlari.FirstOrDefault() != null 
                        ? f.Urun.UrunAmbalajlari.FirstOrDefault()!.FiyatKademeleri.FirstOrDefault()!.BirimFiyat 
                        : null
            })
            .ToListAsync()
        };
    }

    public async Task<bool> FavoriEkleAsync(long kullaniciId, FavoriEkleDto dto)
    {
        if (await _context.Favoriler.AnyAsync(f => f.KullaniciId == kullaniciId && f.UrunId == dto.UrunId))
            return true; // Zaten ekli

        var urun = await _context.Urunler.FindAsync(dto.UrunId);
        if (urun == null) return false;

        _context.Favoriler.Add(new Favori
        {
            KullaniciId = kullaniciId,
            UrunId = dto.UrunId
        });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> FavoriSilAsync(long kullaniciId, long urunId)
    {
        var favori = await _context.Favoriler.FirstOrDefaultAsync(f => f.UrunId == urunId && f.KullaniciId == kullaniciId);
        if (favori == null) return false;

        _context.Favoriler.Remove(favori);
        await _context.SaveChangesAsync();
        return true;
    }
    public async Task<SayfaliSonucDto<MusteriUrunKoduDto>> MusteriUrunKodlariniGetirAsync(
        long kullaniciId,
        int sayfaNo,
        int sayfaBoyutu)
    {
        var kullanici = await _context.Kullanicilar.AsNoTracking().FirstOrDefaultAsync(k => k.Id == kullaniciId);
        sayfaNo = Math.Max(1, sayfaNo);
        sayfaBoyutu = Math.Clamp(sayfaBoyutu, 1, 100);
        if (kullanici == null || kullanici.FirmaId == null)
            return new SayfaliSonucDto<MusteriUrunKoduDto> { SayfaNo = sayfaNo, SayfaBoyutu = sayfaBoyutu };

        var sorgu = _context.Set<MusteriUrunKodu>().Where(m => m.FirmaId == kullanici.FirmaId);
        return new SayfaliSonucDto<MusteriUrunKoduDto>
        {
            SayfaNo = sayfaNo,
            SayfaBoyutu = sayfaBoyutu,
            ToplamKayit = await sorgu.CountAsync(),
            Kayitlar = await sorgu
            .Include(m => m.Urun)
            .OrderBy(m => m.Id)
            .Skip((sayfaNo - 1) * sayfaBoyutu)
            .Take(sayfaBoyutu)
            .Select(m => new MusteriUrunKoduDto
            {
                Id = m.Id,
                UrunId = m.UrunId,
                UreticiUrunKodu = m.Urun.UreticiUrunKodu,
                MusteriKodu = m.MusteriKodu,
                Aciklama = m.Aciklama
            })
            .ToListAsync()
        };
    }

    public async Task<MusteriUrunKoduDto> MusteriUrunKoduEkleAsync(long kullaniciId, MusteriUrunKoduEkleDto dto)
    {
        var kullanici = await _context.Kullanicilar.FirstOrDefaultAsync(k => k.Id == kullaniciId);
        if (kullanici == null || kullanici.FirmaId == null) 
            throw new IsKuraliIhlaliException("Sadece firma yetkilileri müşteri ürün kodu ekleyebilir.");

        var kod = new MusteriUrunKodu
        {
            FirmaId = kullanici.FirmaId.Value,
            UrunId = dto.UrunId,
            MusteriKodu = dto.MusteriKodu,
            Aciklama = dto.Aciklama
        };

        _context.Set<MusteriUrunKodu>().Add(kod);
        await _context.SaveChangesAsync();

        var urun = await _context.Urunler.AsNoTracking().FirstOrDefaultAsync(u => u.Id == dto.UrunId);

        return new MusteriUrunKoduDto
        {
            Id = kod.Id,
            UrunId = kod.UrunId,
            UreticiUrunKodu = urun?.UreticiUrunKodu ?? "",
            MusteriKodu = kod.MusteriKodu,
            Aciklama = kod.Aciklama
        };
    }

    public async Task<bool> MusteriUrunKoduGuncelleAsync(long kullaniciId, long id, MusteriUrunKoduGuncelleDto dto)
    {
        var kullanici = await _context.Kullanicilar.AsNoTracking().FirstOrDefaultAsync(k => k.Id == kullaniciId);
        if (kullanici == null || kullanici.FirmaId == null) return false;

        var kod = await _context.Set<MusteriUrunKodu>().FirstOrDefaultAsync(m => m.Id == id && m.FirmaId == kullanici.FirmaId);
        if (kod == null) return false;

        kod.MusteriKodu = dto.MusteriKodu;
        kod.Aciklama = dto.Aciklama;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MusteriUrunKoduSilAsync(long kullaniciId, long id)
    {
        var kullanici = await _context.Kullanicilar.AsNoTracking().FirstOrDefaultAsync(k => k.Id == kullaniciId);
        if (kullanici == null || kullanici.FirmaId == null) return false;

        var kod = await _context.Set<MusteriUrunKodu>().FirstOrDefaultAsync(m => m.Id == id && m.FirmaId == kullanici.FirmaId);
        if (kod == null) return false;

        _context.Set<MusteriUrunKodu>().Remove(kod);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<FirmaBilgiDto?> FirmaBilgisiGetirAsync(long kullaniciId)
    {
        var kullanici = await _context.Kullanicilar
            .AsNoTracking()
            .Where(k => k.Id == kullaniciId)
            .Select(k => new { k.FirmaId, k.FirmaYetkilisiMi })
            .FirstOrDefaultAsync();

        if (kullanici?.FirmaId is null) return null;

        return await _context.Firmalar
            .AsNoTracking()
            .Where(f => f.Id == kullanici.FirmaId)
            .Select(f => new FirmaBilgiDto
            {
                Id = f.Id,
                Unvan = f.Unvan,
                VergiDairesi = f.VergiDairesi,
                VergiNo = f.VergiNo,
                KepAdresi = f.KepAdresi,
                OnayDurumu = (short)f.OnayDurumu,
                KrediLimiti = f.KrediLimiti,
                OdemeVadesiGun = f.OdemeVadesiGun,
                MusteriGrubu = f.MusteriGrubu != null ? f.MusteriGrubu.Ad : null,
                YetkiliMi = kullanici.FirmaYetkilisiMi,
            })
            .FirstOrDefaultAsync();
    }
}
