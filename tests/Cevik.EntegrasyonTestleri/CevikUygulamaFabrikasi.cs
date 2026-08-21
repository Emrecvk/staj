using Cevik.Altyapi.Veritabani;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Testcontainers.PostgreSql;
using Testcontainers.Redis;

namespace Cevik.EntegrasyonTestleri;

/// <summary>
/// Gerçek PostgreSQL üzerinde çalışan test sunucusu.
///
/// InMemory sağlayıcı yerine Testcontainers kullanıyoruz çünkü bu projede
/// test edilmesi gereken şeylerin çoğu Postgres'e özgü: ILIKE + trigram araması,
/// ltree yolu, jsonb ve xmin eşzamanlılık jetonu. InMemory bunların hiçbirini
/// çalıştırmaz; yeşil test yanlış bir güven verir.
///
/// Redis de gerçek konteyner olarak ayağa kalkar: /saglik ucu onu yokluyor ve
/// sahte bir sağlık kontrolü koymaktansa bağımlılığı gerçekten çalıştırmak doğru.
/// Dağıtık ÖNBELLEK yine bellek içi uygulamaya çevrilir; önbellek davranışı
/// böylece belirlenimci kalır.
/// </summary>
public class CevikUygulamaFabrikasi : WebApplicationFactory<Program>, IAsyncLifetime
{
    public const string YoneticiEpostasi = "admin@cevik.test";
    public const string YoneticiParolasi = "Test.Admin.2026";

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:17-alpine")
        .WithDatabase("cevik_test")
        .WithUsername("cevik")
        .WithPassword("test_parolasi")
        .Build();

    // Redis, onbellek icin kullanilmasa da /saglik ucu onu gercekten yokluyor.
    // Konteyner olmadan saglik kontrolu her testte 503 donuyordu; sahte bir
    // saglik kontrolu koymaktansa gercek bagimliligi ayaga kaldirmak dogru.
    private readonly RedisContainer _redis = new RedisBuilder("redis:7-alpine").Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, yapilandirma) =>
            yapilandirma.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = _postgres.GetConnectionString(),
                ["ConnectionStrings:Redis"] = _redis.GetConnectionString(),
                ["Jwt:Key"] = "TEST_ORTAMI_ICIN_EN_AZ_32_KARAKTERLIK_ANAHTAR",
                ["Jwt:Issuer"] = "CevikApi",
                ["Jwt:Audience"] = "CevikWeb",
                ["Jwt:GecerlilikDakika"] = "60",
                ["Ticari:KdvOrani"] = "20",
                ["Ticari:AnaParaBirimi"] = "TRY",
                ["Ticari:UcretsizKargoEsigi"] = "1000",
                ["Ticari:KargoUcreti"] = "50",
                ["Cors:IzinliKokenler:0"] = "https://test.cevik.com",
                // TestServer'da gercek bir uzak IP yok; oran sinirlayicinin
                // istemcileri ayirabilmesi icin testler X-Forwarded-For gonderir
                // ve bu bayrak o baslige guvenilmesini saglar.
                // URETIMDE ACILMAZ — bkz. Program.cs forwarded headers bolumu.
                ["ForwardedHeaders:TumProxylereGuven"] = "true",
                ["TestOrtami"] = "true",
                ["Yonetici:Eposta"] = YoneticiEpostasi,
                ["Yonetici:Parola"] = YoneticiParolasi
            }));

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IDistributedCache>();
            services.AddDistributedMemoryCache();

            // Background Job'ların test sürecini tıkamaması için sahte servisler ekliyoruz
            services.RemoveAll<Cevik.Altyapi.Fiyatlama.Servisler.ITcmbIstemcisi>();
            services.AddScoped<Cevik.Altyapi.Fiyatlama.Servisler.ITcmbIstemcisi, SahteTcmbIstemcisi>();

            services.RemoveAll<Cevik.Uygulama.Ortak.Arayuzler.IBildirimServisi>();
            services.AddScoped<Cevik.Uygulama.Ortak.Arayuzler.IBildirimServisi, SahteBildirimServisi>();
        });
    }

    protected override void ConfigureClient(HttpClient client)
    {
        base.ConfigureClient(client);
        // Cakismayan adres: ayni adrese dusen iki test oran sinirlama bolumunu
        // paylasip 429 aliyor ve kararsiz sekilde dusuyordu.
        client.DefaultRequestHeaders.Add("X-Forwarded-For", TestIstemciAdresi.Uret());
    }

    Task IAsyncLifetime.InitializeAsync() =>
        Task.WhenAll(_postgres.StartAsync(), _redis.StartAsync());

    // WebApplicationFactory.DisposeAsync ValueTask döndürdüğü için
    // IAsyncLifetime'ın Task döndüren üyesi ACIK arayüz olarak uygulanır.
    async Task IAsyncLifetime.DisposeAsync()
    {
        await base.DisposeAsync();
        await _postgres.DisposeAsync();
        await _redis.DisposeAsync();
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

public class SahteTcmbIstemcisi : Cevik.Altyapi.Fiyatlama.Servisler.ITcmbIstemcisi
{
    public Task<Dictionary<string, (decimal Alis, decimal Satis)>> KurlariGetirAsync()
    {
        return Task.FromResult(new Dictionary<string, (decimal Alis, decimal Satis)>
        {
            { "USD", (34.1234m, 34.1567m) },
            { "EUR", (38.1234m, 38.1567m) }
        });
    }
}

public class SahteBildirimServisi : Cevik.Uygulama.Ortak.Arayuzler.IBildirimServisi
{
    public Task EpostaGonderAsync(string kime, string konu, string icerik)
    {
        // Gönderilmiş gibi davran
        return Task.CompletedTask;
    }
}
