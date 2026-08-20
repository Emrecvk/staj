using System;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Cevik.Alan.Fiyatlama;
using Cevik.Altyapi.Fiyatlama.ArkaPlan;
using Cevik.Altyapi.Katalog.ArkaPlan;
using Cevik.Uygulama.Katalog.Dto;
using Cevik.Uygulama.Ortak.Arayuzler;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Microsoft.Extensions.Hosting;

namespace Cevik.EntegrasyonTestleri;

[Collection("SiralamaGerektirmeyenler")]
public class ArkaPlanIsleriTestleri : IClassFixture<CevikUygulamaFabrikasi>
{
    private readonly CevikUygulamaFabrikasi _fabrika;

    public ArkaPlanIsleriTestleri(CevikUygulamaFabrikasi fabrika)
    {
        _fabrika = fabrika;
    }

    [Fact]
    public async Task TcmbDovizGuncelleyici_Kurlari_Veritabanina_Yazar()
    {
        using var scope = _fabrika.Services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<TcmbDovizGuncelleyiciBackgroundService>>();
        var backgroundService = new TcmbDovizGuncelleyiciBackgroundService(_fabrika.Services, logger);

        // Arka plan görevini kısa süreli başlat
        var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));
        await backgroundService.StartAsync(cts.Token);
        
        // Bir süre bekle
        await Task.Delay(500);

        var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
        var bugun = DateTime.UtcNow.Date;
        
        var usdKur = await db.DovizKurlari.FirstOrDefaultAsync(k => k.ParaBirimi == "USD" && k.Tarih == bugun);
        
        usdKur.Should().NotBeNull();
        usdKur!.Alis.Should().Be(34.1234m); // Sahte istemciden geldi
    }

    [Fact]
    public async Task StokBildirim_Olusturma_Ve_Isleyici_Calismasi()
    {
        var client = _fabrika.CreateClient();
        
        // 1. Yeni bir stok bildirim talebi oluştur (AmbalajId 1 varsayımı ile)
        var dto = new StokBildirimTalebiDto { Eposta = "test_stok@cevik.com", IstenenMiktar = 10 };
        var response = await client.PostAsJsonAsync("/api/katalog/urunler/ambalajlar/1/stok-bildirimi", dto);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Aynı e-postayla ikinci kayıt conflict dönmeli
        var conflictResponse = await client.PostAsJsonAsync("/api/katalog/urunler/ambalajlar/1/stok-bildirimi", dto);
        conflictResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);

        // 2. Ambalajın stoğunu güncelle (Talebi karşılayacak şekilde 20 adet)
        using var scope = _fabrika.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
        var ambalaj = await db.UrunAmbalajlari.FindAsync(1L);
        ambalaj!.StokMiktari = 20;
        await db.SaveChangesAsync();

        // 3. StokBildirimIsleyiciBackgroundService çalıştırılır
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<StokBildirimIsleyiciBackgroundService>>();
        var bildirimServisi = new StokBildirimIsleyiciBackgroundService(_fabrika.Services, logger);
        
        var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));
        await bildirimServisi.StartAsync(cts.Token);
        await Task.Delay(500);

        // 4. Doğrulama: BildirildiMi true olmalı
        var guncellenmisBildirim = await db.StokBildirimleri
            .FirstOrDefaultAsync(sb => sb.Eposta == "test_stok@cevik.com");
            
        guncellenmisBildirim.Should().NotBeNull();
        guncellenmisBildirim!.BildirildiMi.Should().BeTrue();
    }
}
