using Cevik.Alan.Icerik;
using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using Cevik.Alan.Siparis;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Yonetim.Arayuzler;
using Cevik.Uygulama.Yonetim.Dto;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Altyapi.Yonetim.Servisler;

public class YonetimServisi : IYonetimServisi
{
    private readonly CevikDbContext _context;

    public YonetimServisi(CevikDbContext context) => _context = context;

    // -----------------------------------------------------------------------
    // Firma onayı
    // -----------------------------------------------------------------------

    public async Task<List<FirmaBasvuruOzetDto>> BekleyenFirmalariGetirAsync()
    {
        return await _context.Firmalar
            .Where(f => f.OnayDurumu == FirmaOnayDurumu.Beklemede)
            .OrderBy(f => f.OlusturmaTarihi)
            .AsNoTracking()
            .Select(f => new FirmaBasvuruOzetDto
            {
                Id = f.Id,
                Unvan = f.Unvan,
                VergiDairesi = f.VergiDairesi,
                VergiNo = f.VergiNo,
                KepAdresi = f.KepAdresi,
                OnayDurumu = f.OnayDurumu,
                BasvuruTarihi = f.OlusturmaTarihi,
                KullaniciSayisi = _context.Kullanicilar.Count(k => k.FirmaId == f.Id)
            })
            .ToListAsync();
    }

    public async Task<bool> FirmaOnaylaAsync(FirmaOnayDto dto, long islemiYapanKullaniciId)
    {
        var firma = await _context.Firmalar.FirstOrDefaultAsync(f => f.Id == (int)dto.FirmaId);
        if (firma is null) return false;

        firma.OnayDurumu = dto.Durum;

        var firmaKullanicilari = await _context.Kullanicilar
            .Where(k => k.FirmaId == firma.Id)
            .ToListAsync();

        // B2B fiyat ve teklif hakkı YALNIZCA onaydan sonra açılır.
        var onaylandi = dto.Durum == FirmaOnayDurumu.Onaylandi;

        foreach (var kullanici in firmaKullanicilari)
        {
            kullanici.FirmaYetkilisiMi = onaylandi;

            // Rolü yalnızca müşteri seviyesindeyken yükselt/indir; bir admin veya
            // satış temsilcisi firma onayı yüzünden rol kaybetmemeli.
            if (onaylandi && kullanici.Rol == KullaniciRolu.Musteri)
                kullanici.Rol = KullaniciRolu.FirmaYoneticisi;
            else if (!onaylandi && kullanici.Rol == KullaniciRolu.FirmaYoneticisi)
                kullanici.Rol = KullaniciRolu.Musteri;
        }

        _context.DenetimKayitlari.Add(new DenetimKaydi
        {
            TabloAdi = "firmalar",
            KayitId = firma.Id.ToString(),
            Islem = "OnayDurumuDegisti",
            YeniDegerJson = $"{{\"onayDurumu\":\"{dto.Durum}\"}}",
            KullaniciId = islemiYapanKullaniciId
        });

        await _context.SaveChangesAsync();
        return true;
    }

    // -----------------------------------------------------------------------
    // Sipariş yönetimi
    // -----------------------------------------------------------------------

    public async Task<List<SiparisYonetimOzetDto>> SiparisleriGetirAsync(short? durum, int sayfa, int boyut)
    {
        boyut = Math.Clamp(boyut, 1, 200);
        sayfa = Math.Max(sayfa, 1);

        var sorgu = _context.Siparisler.AsQueryable();

        if (durum.HasValue)
            sorgu = sorgu.Where(s => s.Durum == (SiparisDurumu)durum.Value);

        var kayitlar = await sorgu
            .OrderByDescending(s => s.Id)
            .Skip((sayfa - 1) * boyut)
            .Take(boyut)
            .AsNoTracking()
            .Select(s => new SiparisYonetimOzetDto
            {
                Id = s.Id,
                SiparisNo = s.SiparisNo,
                Durum = s.Durum,
                GenelToplam = s.GenelToplam,
                ParaBirimi = s.ParaBirimi,
                Tarih = s.OlusturmaTarihi,
                MusteriAdi = _context.Kullanicilar
                    .Where(k => k.Id == s.KullaniciId)
                    .Select(k => k.Ad + " " + k.Soyad)
                    .FirstOrDefault(),
                FirmaUnvani = s.FirmaId == null
                    ? null
                    : _context.Firmalar.Where(f => f.Id == s.FirmaId).Select(f => f.Unvan).FirstOrDefault(),
                KalemSayisi = s.Kalemler.Count
            })
            .ToListAsync();

        // Durum makinesi bellekte çalışır; panel hangi butonları göstereceğini buradan bilir.
        foreach (var kayit in kayitlar)
            kayit.IzinliGecisler = [.. SiparisDurumMakinesi.IzinliGecisler(kayit.Durum)];

        return kayitlar;
    }

    public async Task<bool> SiparisDurumGuncelleAsync(SiparisDurumGuncelleDto dto, long islemiYapanKullaniciId)
    {
        var siparis = await _context.Siparisler.FirstOrDefaultAsync(s => s.Id == dto.SiparisId);
        if (siparis is null) return false;

        var mevcut = siparis.Durum;

        // Önceki sürüm her geçişe izin veriyordu: teslim edilmiş bir sipariş
        // "ödeme bekliyor"a geri alınabiliyordu.
        if (mevcut == dto.YeniDurum)
            throw new IsKuraliIhlaliException($"Sipariş zaten '{mevcut}' durumunda.");

        if (!SiparisDurumMakinesi.GecisGecerliMi(mevcut, dto.YeniDurum))
        {
            var izinliler = SiparisDurumMakinesi.IzinliGecisler(mevcut);
            var izinliMetin = izinliler.Count == 0 ? "yok (uç durum)" : string.Join(", ", izinliler);
            throw new IsKuraliIhlaliException(
                $"'{mevcut}' durumundan '{dto.YeniDurum}' durumuna geçilemez. İzinli geçişler: {izinliMetin}.");
        }

        // İptal/iade edilen siparişte stok geri verilir.
        if (dto.YeniDurum is SiparisDurumu.IptalEdildi or SiparisDurumu.IadeEdildi)
            await StoklariGeriVerAsync(siparis.Id);

        siparis.Durum = dto.YeniDurum;

        _context.SiparisDurumGecmisleri.Add(new SiparisDurumGecmisi
        {
            SiparisId = siparis.Id,
            OncekiDurum = mevcut,
            YeniDurum = dto.YeniDurum,
            DegistirenKullaniciId = islemiYapanKullaniciId,
            Aciklama = "Yönetici tarafından güncellendi."
        });

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Sipariş iptal/iade edildiğinde düşülen stoğu geri ekler.
    /// Bu olmadan iptal edilen her sipariş stoğu kalıcı olarak eksiltiyordu.
    /// </summary>
    private async Task StoklariGeriVerAsync(long siparisId)
    {
        var kalemler = await _context.SiparisKalemleri
            .Where(k => k.SiparisId == siparisId)
            .ToListAsync();

        foreach (var kalem in kalemler)
        {
            var ambalaj = await _context.UrunAmbalajlari.FirstOrDefaultAsync(a => a.Id == kalem.UrunAmbalajId);
            if (ambalaj is not null)
                ambalaj.StokMiktari += kalem.Miktar;
        }
    }

    // -----------------------------------------------------------------------
    // Kullanıcı rolleri
    // -----------------------------------------------------------------------

    public async Task<bool> KullaniciRolGuncelleAsync(KullaniciRolGuncelleDto dto)
    {
        var kullanici = await _context.Kullanicilar.FirstOrDefaultAsync(k => k.Id == dto.KullaniciId);
        if (kullanici is null) return false;

        if (!Enum.IsDefined(typeof(KullaniciRolu), dto.Rol))
            throw new IsKuraliIhlaliException($"Geçersiz rol değeri: {dto.Rol}");

        var yeniRol = (KullaniciRolu)dto.Rol;

        // Sistemde en az bir admin kalmalı; aksi hâlde panele kimse giremez.
        if (kullanici.Rol == KullaniciRolu.Admin && yeniRol != KullaniciRolu.Admin)
        {
            var kalanAdmin = await _context.Kullanicilar
                .CountAsync(k => k.Rol == KullaniciRolu.Admin && k.Id != kullanici.Id);

            if (kalanAdmin == 0)
                throw new IsKuraliIhlaliException("Sistemdeki son yönetici hesabının rolü değiştirilemez.");
        }

        kullanici.Rol = yeniRol;
        await _context.SaveChangesAsync();
        return true;
    }

    // -----------------------------------------------------------------------
    // İçerik
    // -----------------------------------------------------------------------

    public async Task<List<BlogYazisiDto>> BlogYazilariGetirAsync()
    {
        return await _context.BlogYazilari
            .AsNoTracking()
            .OrderByDescending(b => b.Id)
            .Select(b => new BlogYazisiDto
            {
                Id = b.Id,
                Baslik = b.Baslik,
                Slug = b.Slug,
                Ozet = b.Ozet,
                IcerikHtml = b.IcerikHtml,
                KapakGorselUrl = b.KapakGorselUrl,
                Kategori = b.Kategori,
                YayinTarihi = b.YayinTarihi ?? b.OlusturmaTarihi
            })
            .ToListAsync();
    }

    public async Task<BlogYazisiDto> BlogYazisiEkleAsync(BlogYazisiEkleDto dto)
    {
        if (await _context.BlogYazilari.AnyAsync(b => b.Slug == dto.Slug))
            throw new IsKuraliIhlaliException("Bu slug ile bir yazı zaten var.");

        var yazi = new BlogYazisi
        {
            Baslik = dto.Baslik,
            Slug = dto.Slug,
            Ozet = dto.Ozet,
            IcerikHtml = dto.IcerikHtml,
            KapakGorselUrl = dto.KapakGorselUrl,
            Kategori = dto.Kategori,
            YayinTarihi = DateTimeOffset.UtcNow
        };

        _context.BlogYazilari.Add(yazi);
        await _context.SaveChangesAsync();

        return new BlogYazisiDto
        {
            Id = yazi.Id,
            Baslik = yazi.Baslik,
            Slug = yazi.Slug,
            Ozet = yazi.Ozet,
            IcerikHtml = yazi.IcerikHtml,
            KapakGorselUrl = yazi.KapakGorselUrl,
            Kategori = yazi.Kategori,
            YayinTarihi = yazi.YayinTarihi
        };
    }
}
