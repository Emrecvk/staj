using Cevik.Alan.Fiyatlama;
using Cevik.Altyapi.Fiyatlama.Servisler;
using Cevik.Altyapi.Veritabani;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Cevik.Altyapi.Fiyatlama.ArkaPlan;

public class TcmbDovizGuncelleyiciBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TcmbDovizGuncelleyiciBackgroundService> _logger;
    private readonly TimeSpan _periyot = TimeSpan.FromHours(4); // Her 4 saatte bir

    public TcmbDovizGuncelleyiciBackgroundService(IServiceProvider serviceProvider, ILogger<TcmbDovizGuncelleyiciBackgroundService> logger)
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
                var tcmbClient = scope.ServiceProvider.GetRequiredService<ITcmbIstemcisi>();
                var dbContext = scope.ServiceProvider.GetRequiredService<CevikDbContext>();

                _logger.LogInformation("TCMB kurları güncelleniyor...");
                var kurlar = await tcmbClient.KurlariGetirAsync();

                if (kurlar.Any())
                {
                    var bugun = DateTime.UtcNow.Date;

                    foreach (var kvp in kurlar)
                    {
                        var paraBirimi = kvp.Key;
                        var (alis, satis) = kvp.Value;

                        var mevcutKur = await dbContext.DovizKurlari
                            .FirstOrDefaultAsync(k => k.ParaBirimi == paraBirimi && k.Tarih == bugun, stoppingToken);

                        if (mevcutKur == null)
                        {
                            dbContext.DovizKurlari.Add(new DovizKuru
                            {
                                Tarih = bugun,
                                ParaBirimi = paraBirimi,
                                Alis = alis,
                                Satis = satis
                            });
                        }
                        else
                        {
                            mevcutKur.Alis = alis;
                            mevcutKur.Satis = satis;
                        }
                    }

                    await dbContext.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("TCMB kurları başarıyla güncellendi.");
                }
                else
                {
                    _logger.LogWarning("TCMB'den kurlar boş döndü. (Ağ hatası veya parse hatası olabilir)");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "TcmbDovizGuncelleyiciBackgroundService çalışırken bir hata oluştu.");
            }

            await Task.Delay(_periyot, stoppingToken);
        }
    }
}
