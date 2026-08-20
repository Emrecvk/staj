using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Siparis.Arayuzler;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Cevik.Altyapi.Fiyatlama.Servisler;

/// <summary>
/// Kuru <c>doviz_kurlari</c> tablosundan okur.
///
/// Tablo TCMB'den günlük beslenecek şekilde tasarlandı (PLANLAMA.md 5.3);
/// o arka plan servisi henüz yok, bu yüzden seed ile başlangıç kurları yazılıyor.
/// İstenen günün kuru yoksa en son bilinen kur kullanılır — tatil günlerinde
/// TCMB kur yayınlamaz, bu normal bir durumdur.
/// </summary>
public class DovizKuruServisi : IDovizKuruServisi
{
    private readonly CevikDbContext _context;
    private readonly ILogger<DovizKuruServisi> _logger;

    public DovizKuruServisi(CevikDbContext context, ILogger<DovizKuruServisi> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<decimal> KurGetirAsync(string kaynakParaBirimi, string hedefParaBirimi, DateOnly? tarih = null)
    {
        var kaynak = kaynakParaBirimi.ToUpperInvariant();
        var hedef = hedefParaBirimi.ToUpperInvariant();

        if (kaynak == hedef) return 1m;

        // DateOnly.ToDateTime() Kind=Unspecified üretir; Npgsql ise
        // "timestamp with time zone" kolonuna yalnızca UTC yazılmasına izin verir.
        // Kind belirtilmezse sorgu ArgumentException ile patlar.
        var gun = tarih is null
            ? DateTime.UtcNow.Date
            : DateTime.SpecifyKind(tarih.Value.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);

        // Kurlar TRY tabanlı tutulur: 1 USD = 34,12 TRY gibi.
        var kaynakKuru = await TryKarsiligiGetirAsync(kaynak, gun);
        var hedefKuru = await TryKarsiligiGetirAsync(hedef, gun);

        if (kaynakKuru is null || hedefKuru is null || hedefKuru == 0)
        {
            _logger.LogWarning(
                "{Kaynak}->{Hedef} için kur bulunamadı, 1 kabul edildi. Tutar hesabı eksik olabilir.",
                kaynak, hedef);
            return 1m;
        }

        return kaynakKuru.Value / hedefKuru.Value;
    }

    /// <summary>1 birim <paramref name="paraBirimi"/> kaç TRY eder?</summary>
    private async Task<decimal?> TryKarsiligiGetirAsync(string paraBirimi, DateTime gun)
    {
        if (paraBirimi == "TRY") return 1m;

        var kur = await _context.DovizKurlari
            .AsNoTracking()
            .Where(k => k.ParaBirimi == paraBirimi && k.Tarih <= gun)
            .OrderByDescending(k => k.Tarih)
            .FirstOrDefaultAsync();

        // Satış kuru: müşteriden tahsilat yaparken bankanın uyguladığı kur.
        return kur?.Satis;
    }
}
