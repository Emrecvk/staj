using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using Cevik.Alan.Siparis;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Siparis.Arayuzler;
using Cevik.Uygulama.Siparis.Dto;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Altyapi.Siparis.Servisler;

public class SepetServisi : ISepetServisi
{
    private readonly CevikDbContext _context;

    public SepetServisi(CevikDbContext context) => _context = context;

    // -----------------------------------------------------------------------
    // Sepet bulma / oluşturma / birleştirme
    // -----------------------------------------------------------------------

    /// <summary>
    /// Kullanıcının sepetini bulur; giriş yapılmışsa misafir sepetini
    /// kullanıcı sepetiyle BİRLEŞTİRİR.
    ///
    /// Plan bu adımı açıkça uyarı olarak işaretlemişti (PLANLAMA.md 5.5):
    /// birleştirme yapılmazsa kullanıcı giriş yaptığı anda sepeti "kaybolur".
    /// Önceki sürümde bu mantık hiç yoktu.
    /// </summary>
    private async Task<Sepet> SepetBulVeyaOlusturAsync(long? kullaniciId, string? oturumAnahtari)
    {
        var oturum = string.IsNullOrWhiteSpace(oturumAnahtari) ? null : oturumAnahtari;

        Sepet? kullaniciSepeti = null;
        if (kullaniciId is > 0)
        {
            kullaniciSepeti = await _context.Sepetler
                .Include(s => s.Kalemler)
                .FirstOrDefaultAsync(s => s.KullaniciId == kullaniciId);
        }

        Sepet? misafirSepeti = null;
        if (oturum is not null)
        {
            misafirSepeti = await _context.Sepetler
                .Include(s => s.Kalemler)
                .FirstOrDefaultAsync(s => s.OturumAnahtari == oturum && s.KullaniciId == null);
        }

        // Giriş yapıldı ve elde bir misafir sepeti var → birleştir.
        if (kullaniciId is > 0 && misafirSepeti is not null)
        {
            if (kullaniciSepeti is null)
            {
                // Kullanıcının sepeti yoksa misafir sepetini devral.
                misafirSepeti.KullaniciId = kullaniciId;
                misafirSepeti.SonIslemTarihi = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();
                return misafirSepeti;
            }

            if (misafirSepeti.Id != kullaniciSepeti.Id)
            {
                foreach (var misafirKalem in misafirSepeti.Kalemler.ToList())
                {
                    var mevcut = kullaniciSepeti.Kalemler
                        .FirstOrDefault(k => k.UrunAmbalajId == misafirKalem.UrunAmbalajId);

                    // Aynı ürün iki sepette de varsa miktarlar TOPLANIR.
                    if (mevcut is not null)
                        mevcut.Miktar += misafirKalem.Miktar;
                    else
                        kullaniciSepeti.Kalemler.Add(new SepetKalemi
                        {
                            SepetId = kullaniciSepeti.Id,
                            UrunAmbalajId = misafirKalem.UrunAmbalajId,
                            Miktar = misafirKalem.Miktar
                        });

                    _context.SepetKalemleri.Remove(misafirKalem);
                }

                _context.Sepetler.Remove(misafirSepeti);
                kullaniciSepeti.SonIslemTarihi = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();
            }

            return kullaniciSepeti;
        }

        if (kullaniciSepeti is not null) return kullaniciSepeti;
        if (misafirSepeti is not null) return misafirSepeti;

        var yeni = new Sepet
        {
            KullaniciId = kullaniciId is > 0 ? kullaniciId : null,
            OturumAnahtari = oturum ?? Guid.NewGuid().ToString("N"),
            ParaBirimi = "USD",
            SonIslemTarihi = DateTimeOffset.UtcNow
        };

        _context.Sepetler.Add(yeni);
        await _context.SaveChangesAsync();
        return yeni;
    }

    // -----------------------------------------------------------------------
    // Okuma
    // -----------------------------------------------------------------------

    private async Task<SepetDto> DtoyaCevirAsync(Sepet sepet, int? musteriGrubuId)
    {
        var kalemler = await _context.SepetKalemleri
            .Where(k => k.SepetId == sepet.Id)
            .Include(k => k.UrunAmbalaji).ThenInclude(a => a.Urun)
            .Include(k => k.UrunAmbalaji).ThenInclude(a => a.FiyatKademeleri)
            .AsNoTracking()
            .ToListAsync();

        var dto = new SepetDto
        {
            SepetId = sepet.Id,
            OturumAnahtari = sepet.OturumAnahtari,
            ParaBirimi = sepet.ParaBirimi,
            GenelToplam = 0
        };

        var varsayilanIskonto = musteriGrubuId is null
            ? 0m
            : await _context.MusteriGruplari
                .Where(g => g.Id == musteriGrubuId.Value)
                .Select(g => g.VarsayilanIskontoYuzdesi)
                .FirstOrDefaultAsync();

        var urunIdleri = kalemler.Select(k => k.UrunAmbalaji.UrunId).Distinct().ToList();
        var kategoriIdleri = kalemler.Select(k => k.UrunAmbalaji.Urun.KategoriId).Distinct().ToList();
        var ureticiIdleri = kalemler.Select(k => k.UrunAmbalaji.Urun.UreticiId).Distinct().ToList();
        var simdi = DateTimeOffset.UtcNow;
        var etkinIndirimler = await _context.Indirimler
            .AsNoTracking()
            .Where(i => i.Aktif && i.BaslangicTarihi <= simdi && i.BitisTarihi >= simdi)
            .Where(i =>
                (i.HedefTipi == IndirimHedefTipi.Urun && urunIdleri.Contains(i.HedefId))
                || (i.HedefTipi == IndirimHedefTipi.Kategori && kategoriIdleri.Contains((int)i.HedefId))
                || (i.HedefTipi == IndirimHedefTipi.Uretici && ureticiIdleri.Contains((int)i.HedefId))
                || (i.HedefTipi == IndirimHedefTipi.MusteriGrubu
                    && musteriGrubuId != null
                    && i.HedefId == musteriGrubuId.Value))
            .ToListAsync();

        foreach (var kalem in kalemler)
        {
            var ambalaj = kalem.UrunAmbalaji;

            // Kademe seçimi domain kuralına devredildi: aralığı KAPSAYAN kademe
            // seçilir, müşteri grubuna özel fiyat liste fiyatını ezer ve
            // geçerlilik tarihleri dikkate alınır. Önceki sürüm yalnızca
            // "MinMiktar <= miktar" olan sonuncuyu alıyordu; MaxMiktar,
            // müşteri grubu ve tarih alanları hiç okunmuyordu.
            var kademe = FiyatKademesiSecici.Sec(ambalaj.FiyatKademeleri, kalem.Miktar, musteriGrubuId);
            var listeBirimFiyati = kademe?.BirimFiyat ?? 0m;
            var urunIndirimleri = etkinIndirimler.Where(i =>
                (i.HedefTipi == IndirimHedefTipi.Urun && i.HedefId == ambalaj.UrunId)
                || (i.HedefTipi == IndirimHedefTipi.Kategori && i.HedefId == ambalaj.Urun.KategoriId)
                || (i.HedefTipi == IndirimHedefTipi.Uretici && i.HedefId == ambalaj.Urun.UreticiId)
                || (i.HedefTipi == IndirimHedefTipi.MusteriGrubu && i.HedefId == musteriGrubuId));
            var indirim = IndirimHesabi.Uygula(
                listeBirimFiyati,
                kalem.Miktar,
                varsayilanIskonto,
                urunIndirimleri);
            var satirToplami = ParaHesabi.Yuvarla(indirim.BirimFiyat * kalem.Miktar);

            dto.Kalemler.Add(new SepetKalemDto
            {
                KalemId = kalem.Id,
                UrunId = ambalaj.UrunId,
                UrunKodu = ambalaj.Urun.UreticiUrunKodu,
                KisaAciklama = ambalaj.Urun.KisaAciklama,
                AnaGorselUrl = ambalaj.Urun.AnaGorselUrl,
                UrunAmbalajId = ambalaj.Id,
                SatistakiKatsayi = ambalaj.KatlamaMiktari,
                Miktar = kalem.Miktar,
                ListeBirimFiyati = listeBirimFiyati,
                BirimFiyat = indirim.BirimFiyat,
                IndirimTutari = indirim.SatirIndirimTutari,
                ToplamFiyat = satirToplami
            });

            dto.AraToplam += ParaHesabi.Yuvarla(listeBirimFiyati * kalem.Miktar);
            dto.IndirimTutari += indirim.SatirIndirimTutari;
            dto.GenelToplam += satirToplami;

            if (kademe is not null)
                dto.ParaBirimi = kademe.ParaBirimi;
        }

        return dto;
    }

    private async Task<int?> MusteriGrubuGetirAsync(long? kullaniciId)
    {
        if (kullaniciId is not > 0) return null;

        return await _context.Kullanicilar
            .Where(k => k.Id == kullaniciId)
            .Select(k => k.Firma != null ? k.Firma.MusteriGrubuId : null)
            .FirstOrDefaultAsync();
    }

    /// <summary>
    /// Sepeti OKUR; yoksa oluşturmaz.
    ///
    /// Önceki sürüm okuma yolunda da <c>SepetBulVeyaOlusturAsync</c> çağırıyordu:
    /// <c>X-Session-Key</c> göndermeyen her anonim <c>GET /api/Sepet</c> isteği
    /// veritabanına kalıcı bir <c>Sepetler</c> satırı yazıyordu. Oran sınırı da
    /// olmadığı için bu sınırsız satır büyümesi demekti; frontend sorunu bilip
    /// çağrıyı atlayarak maskeliyordu. GET yan etkisiz olmalı — sepet ilk kalem
    /// eklendiğinde <c>SepeteEkleAsync</c> içinde oluşturulur.
    /// </summary>
    public async Task<SepetDto?> SepetGetirAsync(long? kullaniciId, string? oturumAnahtari)
    {
        var sepet = await SepetBulAsync(kullaniciId, oturumAnahtari);

        if (sepet is null)
            return new SepetDto
            {
                SepetId = 0,
                OturumAnahtari = null,
                ParaBirimi = "USD",
                GenelToplam = 0
            };

        return await DtoyaCevirAsync(sepet, await MusteriGrubuGetirAsync(kullaniciId));
    }

    /// <summary>Var olan sepeti bulur; yoksa null döner, satır YAZMAZ.</summary>
    private async Task<Sepet?> SepetBulAsync(long? kullaniciId, string? oturumAnahtari)
    {
        var oturum = string.IsNullOrWhiteSpace(oturumAnahtari) ? null : oturumAnahtari;

        if (kullaniciId is > 0)
        {
            // Giriş yapmış kullanıcı elinde DOLU bir misafir sepetiyle geldiyse
            // birleştirme okuma yolunda da yapılmalı; bu, veri kaybını önleyen
            // kasıtlı bir yazmadır. Misafir sepeti YOKSA hiçbir şey yazılmaz.
            if (oturum is not null
                && await _context.Sepetler.AnyAsync(s => s.OturumAnahtari == oturum && s.KullaniciId == null))
            {
                return await SepetBulVeyaOlusturAsync(kullaniciId, oturum);
            }

            return await _context.Sepetler
                .Include(s => s.Kalemler)
                .FirstOrDefaultAsync(s => s.KullaniciId == kullaniciId);
        }

        if (oturum is null) return null;

        return await _context.Sepetler
            .Include(s => s.Kalemler)
            .FirstOrDefaultAsync(s => s.OturumAnahtari == oturum && s.KullaniciId == null);
    }

    // -----------------------------------------------------------------------
    // Yazma
    // -----------------------------------------------------------------------

    public async Task<SepetDto> SepeteEkleAsync(long? kullaniciId, string? oturumAnahtari, SepeteEkleDto dto)
    {
        var ambalaj = await _context.UrunAmbalajlari
            .Include(a => a.Urun)
            .FirstOrDefaultAsync(a => a.Id == dto.UrunAmbalajId)
            ?? throw new KeyNotFoundException("Ürün ambalajı bulunamadı.");

        if (!ambalaj.Urun.Aktif)
            throw new IsKuraliIhlaliException("Bu ürün satışa kapalı.");

        var sepet = await SepetBulVeyaOlusturAsync(kullaniciId, oturumAnahtari);

        var mevcutKalem = await _context.SepetKalemleri
            .FirstOrDefaultAsync(k => k.SepetId == sepet.Id && k.UrunAmbalajId == dto.UrunAmbalajId);

        var hedefMiktar = (mevcutKalem?.Miktar ?? 0) + dto.Miktar;

        MiktarVeStokDogrula(hedefMiktar, ambalaj);

        if (mevcutKalem is not null)
            mevcutKalem.Miktar = hedefMiktar;
        else
            _context.SepetKalemleri.Add(new SepetKalemi
            {
                SepetId = sepet.Id,
                UrunAmbalajId = dto.UrunAmbalajId,
                Miktar = hedefMiktar
            });

        sepet.SonIslemTarihi = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();

        return await DtoyaCevirAsync(sepet, await MusteriGrubuGetirAsync(kullaniciId));
    }

    public async Task<SepetDto?> SepetGuncelleAsync(long? kullaniciId, string? oturumAnahtari, SepetGuncelleDto dto)
    {
        var sepet = await SepetBulVeyaOlusturAsync(kullaniciId, oturumAnahtari);

        var kalem = await _context.SepetKalemleri
            .Include(k => k.UrunAmbalaji).ThenInclude(a => a.Urun)
            .FirstOrDefaultAsync(k => k.Id == dto.KalemId && k.SepetId == sepet.Id);

        if (kalem is null)
            throw new KeyNotFoundException("Sepet kalemi bulunamadı.");

        if (dto.YeniMiktar <= 0)
        {
            _context.SepetKalemleri.Remove(kalem);
        }
        else
        {
            MiktarVeStokDogrula(dto.YeniMiktar, kalem.UrunAmbalaji);
            kalem.Miktar = dto.YeniMiktar;
        }

        sepet.SonIslemTarihi = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();

        return await DtoyaCevirAsync(sepet, await MusteriGrubuGetirAsync(kullaniciId));
    }

    public async Task<SepetDto?> SepettenCikarAsync(long? kullaniciId, string? oturumAnahtari, long kalemId)
    {
        var sepet = await SepetBulVeyaOlusturAsync(kullaniciId, oturumAnahtari);

        var kalem = await _context.SepetKalemleri
            .FirstOrDefaultAsync(k => k.Id == kalemId && k.SepetId == sepet.Id);

        if (kalem is not null)
        {
            _context.SepetKalemleri.Remove(kalem);
            sepet.SonIslemTarihi = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
        }

        return await DtoyaCevirAsync(sepet, await MusteriGrubuGetirAsync(kullaniciId));
    }

    public async Task<bool> SepetiBosaltAsync(long? kullaniciId, string? oturumAnahtari)
    {
        var sepet = await SepetBulVeyaOlusturAsync(kullaniciId, oturumAnahtari);

        var kalemler = await _context.SepetKalemleri
            .Where(k => k.SepetId == sepet.Id)
            .ToListAsync();

        if (kalemler.Count > 0)
        {
            _context.SepetKalemleri.RemoveRange(kalemler);
            await _context.SaveChangesAsync();
        }

        return true;
    }

    /// <summary>
    /// MOQ / katlama ve stok kontrolü. Sepete ekleme ve miktar güncelleme
    /// aynı kuralı kullanır; önceki sürümde hiçbiri kontrol edilmiyordu, bu
    /// yüzden 7 adet MOQ'su 1500 olan bir ürün sepete girebiliyor ve hata
    /// ancak sipariş anında ortaya çıkıyordu.
    /// </summary>
    private static void MiktarVeStokDogrula(int miktar, Cevik.Alan.Fiyatlama.UrunAmbalaji ambalaj)
    {
        var sonuc = SiparisMiktarKurali.Dogrula(miktar, ambalaj);
        if (!sonuc.Gecerli)
            throw new IsKuraliIhlaliException($"{sonuc.Hata} Önerilen miktar: {sonuc.OnerilenMiktar}.");

        if (ambalaj.StokMiktari < miktar)
            throw new IsKuraliIhlaliException(
                $"Stokta yalnızca {ambalaj.StokMiktari} adet var. Daha fazlası için fiyat ve stok talebi oluşturabilirsiniz.");
    }
}
