using Cevik.Alan.Kurallar;
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

        foreach (var kalem in kalemler)
        {
            var ambalaj = kalem.UrunAmbalaji;

            // Kademe seçimi domain kuralına devredildi: aralığı KAPSAYAN kademe
            // seçilir, müşteri grubuna özel fiyat liste fiyatını ezer ve
            // geçerlilik tarihleri dikkate alınır. Önceki sürüm yalnızca
            // "MinMiktar <= miktar" olan sonuncuyu alıyordu; MaxMiktar,
            // müşteri grubu ve tarih alanları hiç okunmuyordu.
            var kademe = FiyatKademesiSecici.Sec(ambalaj.FiyatKademeleri, kalem.Miktar, musteriGrubuId);
            var birimFiyat = kademe?.BirimFiyat ?? 0m;
            var satirToplami = Math.Round(birimFiyat * kalem.Miktar, 4, MidpointRounding.AwayFromZero);

            dto.Kalemler.Add(new SepetKalemDto
            {
                KalemId = kalem.Id,
                UrunId = ambalaj.UrunId,
                UrunKodu = ambalaj.Urun.UreticiUrunKodu,
                KisaAciklama = ambalaj.Urun.KisaAciklama,
                UrunAmbalajId = ambalaj.Id,
                SatistakiKatsayi = ambalaj.KatlamaMiktari,
                Miktar = kalem.Miktar,
                BirimFiyat = birimFiyat,
                ToplamFiyat = satirToplami
            });

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

    public async Task<SepetDto?> SepetGetirAsync(long? kullaniciId, string? oturumAnahtari)
    {
        var sepet = await SepetBulVeyaOlusturAsync(kullaniciId, oturumAnahtari);
        return await DtoyaCevirAsync(sepet, await MusteriGrubuGetirAsync(kullaniciId));
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
