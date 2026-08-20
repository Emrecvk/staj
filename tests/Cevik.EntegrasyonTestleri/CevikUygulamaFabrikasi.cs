using Cevik.Altyapi.Veritabani;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Testcontainers.PostgreSql;

namespace Cevik.EntegrasyonTestleri;

/// <summary>
/// Gerçek PostgreSQL üzerinde çalışan test sunucusu.
///
/// InMemory sağlayıcı yerine Testcontainers kullanıyoruz çünkü bu projede
/// test edilmesi gereken şeylerin çoğu Postgres'e özgü: ILIKE + trigram araması,
/// ltree yolu, jsonb ve xmin eşzamanlılık jetonu. InMemory bunların hiçbirini
/// çalıştırmaz; yeşil test yanlış bir güven verir.
///
/// Redis ise bellek içi IDistributedCache ile değiştirilir — testin harici bir
/// servise bağlı olması gerekmiyor, önbellek davranışı yine de doğrulanabiliyor.
/// </summary>
public class CevikUygulamaFabrikasi : WebApplicationFactory<Program>, IAsyncLifetime
{
    public const string YoneticiEpostasi = "admin@cevik.test";
    public const string YoneticiParolasi = "Test.Admin.2026";

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .WithDatabase("cevik_test")
        .WithUsername("cevik")
        .WithPassword("test_parolasi")
        .Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, yapilandirma) =>
            yapilandirma.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = _postgres.GetConnectionString(),
                ["Jwt:Key"] = "TEST_ORTAMI_ICIN_EN_AZ_32_KARAKTERLIK_ANAHTAR",
                ["Jwt:Issuer"] = "CevikApi",
                ["Jwt:Audience"] = "CevikWeb",
                ["Jwt:GecerlilikDakika"] = "60",
                ["Ticari:KdvOrani"] = "20",
                ["Ticari:AnaParaBirimi"] = "TRY",
                ["Ticari:UcretsizKargoEsigi"] = "1000",
                ["Ticari:KargoUcreti"] = "50",
                ["Cors:IzinliKokenler:0"] = "https://test.cevik.com",
                ["TestOrtami"] = "true",
                ["Yonetici:Eposta"] = YoneticiEpostasi,
                ["Yonetici:Parola"] = YoneticiParolasi
            }));

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IDistributedCache>();
            services.AddDistributedMemoryCache();
        });
    }

    Task IAsyncLifetime.InitializeAsync() => _postgres.StartAsync();

    // WebApplicationFactory.DisposeAsync ValueTask döndürdüğü için
    // IAsyncLifetime'ın Task döndüren üyesi ACIK arayüz olarak uygulanır.
    async Task IAsyncLifetime.DisposeAsync()
    {
        await base.DisposeAsync();
        await _postgres.DisposeAsync();
    }

    /// <summary>Test içinden doğrudan veritabanına bakmak için.</summary>
    public async Task<T> Veritabaniyla<T>(Func<CevikDbContext, Task<T>> islem)
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<CevikDbContext>();
        return await islem(context);
    }
}

/// <summary>Konteyner bir kez ayağa kalksın, tüm test sınıfları paylaşsın.</summary>
[CollectionDefinition("Api")]
public class ApiKoleksiyonu : ICollectionFixture<CevikUygulamaFabrikasi>;
