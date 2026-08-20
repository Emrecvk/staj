using Cevik.Alan.Fiyatlama;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Ortak.Arayuzler;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Cevik.Altyapi.Katalog.ArkaPlan;

public class StokBildirimIsleyiciBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<StokBildirimIsleyiciBackgroundService> _logger;
    private readonly TimeSpan _periyot = TimeSpan.FromMinutes(15);

    public StokBildirimIsleyiciBackgroundService(IServiceProvider serviceProvider, ILogger<StokBildirimIsleyiciBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<CevikDbContext>();
                var bildirimServisi = scope.ServiceProvider.GetRequiredService<IBildirimServisi>();

                // Bildirilmeyenleri ve UrunAmbalaji'nda stogu pozitif olanlari cek
                var bekleyenBildirimler = await dbContext.StokBildirimleri
                    .Include(sb => sb.UrunAmbalaji)
                    .ThenInclude(ua => ua.Urun)
                    .Where(sb => !sb.BildirildiMi && sb.UrunAmbalaji.StokMiktari > 0)
                    .ToListAsync(stoppingToken);

                foreach (var bildirim in bekleyenBildirimler)
                {
                    // Urun stoğu istenen miktarı karşılıyor mu? (Eğer istenen miktar 0'sa sadece stoğa girmesi yeterli)
                    if (bildirim.UrunAmbalaji.StokMiktari >= bildirim.IstenenMiktar)
                    {
                        var kime = bildirim.Eposta ?? (bildirim.KullaniciId.HasValue ? await GetKullaniciEposta(dbContext, bildirim.KullaniciId.Value) : null);
                        
                        if (!string.IsNullOrEmpty(kime))
                        {
                            var konu = $"Stok Bildirimi: {bildirim.UrunAmbalaji.Urun.UreticiUrunKodu}";
                            var icerik = $"Beklediğiniz ürün stoklarımıza girmiştir. Mevcut stok: {bildirim.UrunAmbalaji.StokMiktari}";
                            
                            await bildirimServisi.EpostaGonderAsync(kime, konu, icerik);
                        }

                        bildirim.BildirildiMi = true;
                    }
                }

                if (bekleyenBildirimler.Any())
                {
                    await dbContext.SaveChangesAsync(stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "StokBildirimIsleyiciBackgroundService çalışırken hata oluştu.");
            }

            await Task.Delay(_periyot, stoppingToken);
        }
    }

    private async Task<string?> GetKullaniciEposta(CevikDbContext context, long kullaniciId)
    {
        var kullanici = await context.Kullanicilar.FindAsync(kullaniciId);
        return kullanici?.Eposta;
    }
}
