using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Kimlik.Arayuzler;
using Cevik.Uygulama.Kimlik.Dto;
using Microsoft.EntityFrameworkCore;

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

    public async Task<List<FavoriDto>> FavorileriGetirAsync(long kullaniciId)
    {
        return await _context.Favoriler
            .Include(f => f.Urun)
            .ThenInclude(u => u.UrunAmbalajlari)
            .ThenInclude(a => a.FiyatKademeleri)
            .AsNoTracking()
            .Where(f => f.KullaniciId == kullaniciId)
            .Select(f => new FavoriDto
            {
                UrunId = f.UrunId,
                UrunKodu = f.Urun.UreticiUrunKodu,
                KisaAciklama = f.Urun.KisaAciklama,
                Fiyat = f.Urun.UrunAmbalajlari.FirstOrDefault() != null 
                        ? f.Urun.UrunAmbalajlari.FirstOrDefault()!.FiyatKademeleri.FirstOrDefault()!.BirimFiyat 
                        : null
            })
            .ToListAsync();
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
}
