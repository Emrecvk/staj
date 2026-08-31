using Cevik.Altyapi.Icerik.Servisler;
using Cevik.Altyapi.Bom.Servisler;
using Cevik.Altyapi.Katalog.Servisler;
using Cevik.Altyapi.Kimlik.Servisler;
using Cevik.Altyapi.Siparis.Servisler;
using Cevik.Altyapi.Teklif.Servisler;
using Cevik.Altyapi.Veritabani;
using Cevik.Altyapi.Veritabani.Seed;
using Cevik.Altyapi.Yonetim.Servisler;
using Cevik.Uygulama.Icerik.Arayuzler;
using Cevik.Uygulama.Bom.Arayuzler;
using Cevik.Uygulama.Katalog.Arayuzler;
using Cevik.Uygulama.Kimlik.Arayuzler;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Ortak.Arayuzler;
using Cevik.Altyapi.Ortak.Servisler;
using Cevik.Uygulama.Siparis.Arayuzler;
using Cevik.Uygulama.Teklif.Arayuzler;
using Cevik.Uygulama.Yonetim.Arayuzler;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Yapilandirma
//
// ONEMLI: yapilandirma degerleri burada DOGRUDAN okunmaz.
// builder.Configuration'i en ust seviyede okumak, sonradan eklenen
// yapilandirma kaynaklarini (ornegin entegrasyon testinin Testcontainers
// baglanti dizesi) kaciriyor; token'i ureten servis IOptions'tan guncel
// degeri alirken dogrulayan middleware eski degerde kaliyor ve her istek
// 401 donuyordu. Bu yuzden tum okumalar IOptions / IServiceProvider
// uzerinden, yani nihai yapilandirmadan yapiliyor.
// ---------------------------------------------------------------------------
builder.Services.AddOptions<JwtAyarlari>()
    .BindConfiguration(JwtAyarlari.BolumAdi)
    .Validate(ayarlar => ayarlar.GecerliMi(out _), "Jwt yapilandirmasi gecersiz.")
    .ValidateOnStart();

builder.Services.AddOptions<TicariAyarlar>().BindConfiguration(TicariAyarlar.BolumAdi);

// ---------------------------------------------------------------------------
// Servisler
// ---------------------------------------------------------------------------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddProblemDetails();

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Cevik.Uygulama.Kimlik.Validations.KullaniciGirisDtoValidator>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CEVIK Elektronik API",
        Version = "v1",
        Description = "Elektronik komponent katalogu, parametrik filtre, sepet, siparis ve teklif API'si. "
                    + "Korumali uclari denemek icin once /api/Kimlik/giris ile token alin, "
                    + "ardindan sagdaki Authorize dugmesini kullanin."
    });

    // JWT Bearer yetkilendirmesi — Swagger arayuzunde "Authorize" dugmesini acar.
    //
    // Bilerek ApiKey semasi kullaniliyor (Http/bearer degil): boylece kutuya
    // token'in tamami "Bearer eyJ..." bicminde yapistirilir. Http/bearer
    // semasinda Swagger UI on eki kendisi ekler ve "Bearer " yazan kullanicinin
    // istegi "Bearer Bearer eyJ..." olarak gidip 401 alir.
    // Not: BearerFormat yalnizca http/bearer semasinda serilestirilir,
    // apiKey semasinda yok sayilir — bu yuzden bilerek set edilmiyor.
    c.AddSecurityDefinition(GuvenlikSemasi, new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Scheme = "Bearer",
        Description = "Token'i 'Bearer ' on ekiyle birlikte girin.\n\nOrnek: Bearer eyJhbGciOiJIUzI1NiIs..."
    });

    // Swashbuckle 10 + Microsoft.OpenApi 2.x: gereksinim, dokumani alan bir
    // fabrika ile verilir ve sema referansi ayri bir tiptir.
    c.AddSecurityRequirement(dokuman => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference(GuvenlikSemasi, dokuman), new List<string>() }
    });
});

// ---------------------------------------------------------------------------
// Forwarded headers
//
// GUVENLIK: KnownProxies/KnownIPNetworks BOSALTILMAZ.
// Bosaltmak, X-Forwarded-For basligini HER kaynaktan kabul etmek demektir.
// Oran sinirlayici istemciyi RemoteIpAddress'e gore bolumlendirdigi icin,
// saldirgan her istekte sahte bir X-Forwarded-For gondererek kendine yeni bir
// bolum acar ve giris ucundaki 5/dk limitini sinirsiz kez atlar.
//
// Guvenilen proxy'ler yapilandirmadan okunur. Hicbiri tanimli degilse
// ASP.NET Core'un varsayilani gecerli olur (yalnizca loopback guvenilir),
// yani disaridan gelen forwarded basliklari yok sayilir.
// ---------------------------------------------------------------------------
builder.Services.AddOptions<ForwardedHeadersOptions>()
    .Configure<IConfiguration>((options, yapilandirma) =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

        // Yalnizca gelistirme ve test icin kacis kapisi: uretimde ACILMAMALIDIR.
        if (yapilandirma.GetValue<bool>("ForwardedHeaders:TumProxylereGuven"))
        {
            options.KnownIPNetworks.Clear();
            options.KnownProxies.Clear();
            return;
        }

        var proxyler = yapilandirma.GetSection("ForwardedHeaders:GuvenilenProxyler").Get<string[]>() ?? [];
        foreach (var proxy in proxyler)
            if (System.Net.IPAddress.TryParse(proxy, out var ip))
                options.KnownProxies.Add(ip);

        var aglar = yapilandirma.GetSection("ForwardedHeaders:GuvenilenAglar").Get<string[]>() ?? [];
        foreach (var ag in aglar)
        {
            var parcalar = ag.Split('/');
            if (parcalar.Length == 2
                && System.Net.IPAddress.TryParse(parcalar[0], out var agAdresi)
                && int.TryParse(parcalar[1], out var uzunluk))
            {
                options.KnownIPNetworks.Add(new System.Net.IPNetwork(agAdresi, uzunluk));
            }
        }
    });

builder.Services.AddCors();
builder.Services.AddOptions<Microsoft.AspNetCore.Cors.Infrastructure.CorsOptions>()
    .Configure<IConfiguration, IHostEnvironment>((options, yapilandirma, ortam) =>
{
    var izinliKokenler = yapilandirma.GetSection("Cors:IzinliKokenler").Get<string[]>() ?? [];

    // Uretimde localhost'a geri dusmek yok: yanlis yapilandirilmis bir dagitim
    // sessizce gelistirme kokenini kabul etmektense acikca durmalidir.
    if (izinliKokenler.Length == 0)
    {
        if (!ortam.IsDevelopment())
            throw new InvalidOperationException(
                "Cors:IzinliKokenler uretim ortaminda tanimlanmalidir.");

        izinliKokenler = ["http://localhost:3000"];
    }

    options.AddPolicy("FrontendCorsPolicy", policy =>
        policy.WithOrigins(izinliKokenler)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .WithExposedHeaders("X-Session-Key")); // Misafir sepeti anahtari
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();

// Token DOGRULAMA parametreleri, token URETEN servisle AYNI IOptions
// ornegini kullanir. Iki taraf ayri ayri yapilandirma okudugunda
// (farkli issuer/audience/anahtar) tum girisler sessizce bozuluyordu.
builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<JwtAyarlari>>((secenekler, jwt) =>
    {
        var ayarlar = jwt.Value;

        secenekler.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(ayarlar.Key)),
            ValidateIssuer = true,
            ValidIssuer = ayarlar.Issuer,
            ValidateAudience = true,
            ValidAudience = ayarlar.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Rol adlari Cevik.Alan.Ortak.KullaniciRolu enum'undan gelir.
    options.AddPolicy("YonetimErisimi", p => p.RequireRole("Admin"));
    options.AddPolicy("IcerikErisimi", p => p.RequireRole("Admin", "Editor"));
    options.AddPolicy("SatisErisimi", p => p.RequireRole("Admin", "SatisTemsilcisi"));
});

// Baglanti dizesi IServiceProvider uzerinden, yani nihai yapilandirmadan okunur.
builder.Services.AddDbContext<CevikDbContext>((sp, options) =>
{
    var yapilandirma = sp.GetRequiredService<IConfiguration>();
    var baglantiDizesi = yapilandirma.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection yapilandirilmamis.");

    options.UseNpgsql(baglantiDizesi, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))
           .UseSnakeCaseNamingConvention();

    // Gelistirmede FK/constraint hatalarinda hangi degerin patladigini gormek sart.
    // Uretimde kapali: parametre degerleri loglara sizmamali.
    var ortam = sp.GetRequiredService<IHostEnvironment>();
    if (ortam.IsDevelopment())
    {
        options.EnableDetailedErrors();
        options.EnableSensitiveDataLogging();
    }
});

builder.Services.AddStackExchangeRedisCache(_ => { });
builder.Services.AddOptions<Microsoft.Extensions.Caching.StackExchangeRedis.RedisCacheOptions>()
    .Configure<IConfiguration>((options, yapilandirma) =>
    {
        options.Configuration = yapilandirma.GetConnectionString("Redis") ?? "localhost:6379";
        options.InstanceName = "Cevik_";
    });

builder.Services.AddScoped<CevikDataSeeder>();
builder.Services.AddScoped<OzdisanKatalogEsitleyici>();
builder.Services.AddScoped<IEpostaServisi, SahteEpostaServisi>();
builder.Services.AddScoped<IKatalogServisi, KatalogServisi>();
builder.Services.AddScoped<IStokBildirimServisi, StokBildirimServisi>();
builder.Services.AddScoped<IMalzemeListesiServisi, MalzemeListesiServisi>();
builder.Services.AddScoped<IPublicIcerikServisi, PublicIcerikServisi>();
builder.Services.AddScoped<IKimlikServisi, KimlikServisi>();
builder.Services.AddScoped<IProfilServisi, ProfilServisi>();
builder.Services.AddScoped<ISepetServisi, SepetServisi>();
// Sipariş kurma adımları (numara, MOQ doğrulama, stok düşümü, KDV, kargo,
// adres snapshot) hem sepet hem teklif yolunda aynı örnekten geçsin.
builder.Services.AddScoped<SiparisKurucu>();
builder.Services.AddScoped<ISiparisServisi, SiparisServisi>();
builder.Services.AddScoped<IDovizKuruServisi, Cevik.Altyapi.Fiyatlama.Servisler.DovizKuruServisi>();
builder.Services.AddScoped<ITeklifServisi, TeklifServisi>();

// Odeme. Saglayici degistirilebilir arayuz arkasinda: gercek saglayiciya
// (iyzico/PayTR/Stripe) gecerken yalnizca bu kayit degisir.
builder.Services.AddScoped<Cevik.Uygulama.Odemeler.Arayuzler.IOdemeSaglayicisi,
    Cevik.Altyapi.Odemeler.Servisler.SandboxOdemeSaglayicisi>();
builder.Services.AddScoped<Cevik.Uygulama.Odemeler.Arayuzler.IOdemeServisi,
    Cevik.Altyapi.Odemeler.Servisler.OdemeServisi>();
builder.Services.AddScoped<ITeklifYonetimServisi, Cevik.Altyapi.Teklif.Servisler.TeklifYonetimServisi>();
builder.Services.AddScoped<IYonetimServisi, YonetimServisi>();
builder.Services.AddScoped<IKatalogYonetimServisi, KatalogYonetimServisi>();

// E-Posta / Bildirim
builder.Services.AddScoped<Cevik.Uygulama.Ortak.Arayuzler.IBildirimServisi, Cevik.Altyapi.Ortak.Servisler.EpostaBildirimServisi>();

// TCMB Döviz Kur
builder.Services.AddHttpClient<Cevik.Altyapi.Fiyatlama.Servisler.ITcmbIstemcisi, Cevik.Altyapi.Fiyatlama.Servisler.TcmbIstemcisi>();
builder.Services.AddHostedService<Cevik.Altyapi.Fiyatlama.ArkaPlan.TcmbDovizGuncelleyiciBackgroundService>();

// Stok Bildirim
builder.Services.AddHostedService<Cevik.Altyapi.Katalog.ArkaPlan.StokBildirimIsleyiciBackgroundService>();

// ---------------------------------------------------------------------------
// Health Checks
//
// Baglanti dizeleri FABRIKA ile verilir. Daha once dogrudan
// builder.Configuration'dan okunuyordu; bu, dosyanin basindaki kurali cigniyor
// ve saglik kontrolu entegrasyon testinde Testcontainers'in baglanti dizesi
// yerine appsettings'teki yerel adrese bakiyordu — /saglik her testte 503
// donuyordu. Fabrika, nihai yapilandirmadan okur.
// ---------------------------------------------------------------------------
builder.Services.AddHealthChecks()
    .AddNpgSql(
        sp => sp.GetRequiredService<IConfiguration>().GetConnectionString("DefaultConnection")
              ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection yapilandirilmamis."),
        name: "postgresql")
    .AddRedis(
        sp => sp.GetRequiredService<IConfiguration>().GetConnectionString("Redis") ?? "localhost:6379",
        name: "redis");

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            // GEÇICI ÖNLEM — asıl sorun bu limit değil, kimin "bir IP" sayıldığı.
            //
            // Frontend, tüm sayfa render'ları için API'ye SUNUCU TARAFINDAN
            // (Next.js SSR) istek atıyor; forwarded header güveni kurulmadığı
            // için (bkz. AGENTS.md — ileri header'lara körü körüne güvenilmez)
            // context.Connection.RemoteIpAddress her zaman frontend
            // container'ının TEK docker-network adresidir. Yani bu limit
            // "ziyaretçi başına" değil, SİTE GENELİNDE ortak bir kovadır: bir
            // kullanıcının birkaç sekmede gezinmesi bile (her sayfa birden
            // fazla SSR çağrısı yapıyor) diğer TÜM ziyaretçileri 429'a düşürür.
            //
            // Kalıcı çözüm, frontend'i güvenilir bir proxy olarak tanımlayıp
            // gerçek istemci IP'sini X-Forwarded-For ile taşımaktır; bu,
            // güven sınırını genişleten ayrı bir karardır ve burada tek
            // başına yapılmadı. Limit şimdilik yalnızca kaçak döngüye karşı
            // bir güvenlik ağı olacak kadar yükseltildi.
            PermitLimit = 1000,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });

    options.AddPolicy("Auth", context =>
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

var app = builder.Build();

app.UseForwardedHeaders();

// ---------------------------------------------------------------------------
// Migration + seed
// ---------------------------------------------------------------------------
if (!app.Configuration.GetValue<bool>("Baslangic:MigrationAtla"))
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<CevikDbContext>();
    await context.Database.MigrateAsync();

    var seeder = scope.ServiceProvider.GetRequiredService<CevikDataSeeder>();
    await seeder.SeedAsync();
}

// ---------------------------------------------------------------------------
// Istek hatti
// ---------------------------------------------------------------------------

// Is kurali ihlallerini 500 yerine anlamli HTTP koduna cevir.
app.UseExceptionHandler(hataHatti =>
{
    hataHatti.Run(async context =>
    {
        var istisna = context.Features.Get<IExceptionHandlerFeature>()?.Error;

        var (durumKodu, baslik) = istisna switch
        {
            IsKuraliIhlaliException => (StatusCodes.Status422UnprocessableEntity, "Is kurali ihlali"),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Kayit bulunamadi"),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Yetkisiz islem"),
            DbUpdateConcurrencyException => (StatusCodes.Status409Conflict, "Kayit baska bir islem tarafindan degistirildi"),
            DbUpdateException => (StatusCodes.Status409Conflict, "Veritabani kisiti nedeniyle islem tamamlanamadi"),
            _ => (StatusCodes.Status500InternalServerError, "Beklenmeyen bir hata olustu")
        };

        // Is kurali ihlalinin MESAJI kullanici icin yazilmistir ("Stokta
        // yalnizca 340 adet var. Daha fazlasi icin fiyat ve stok talebi
        // olusturabilirsiniz.") ve uretimde de gorunmelidir; yutulursa
        // kullanici sepete neden ekleyemedigini asla ogrenemez. Yigin izini
        // tasiyan tam dokum (ToString) yalnizca gelistirmede ve yalnizca
        // beklenmeyen istisnalar icin verilir.
        var detay = istisna switch
        {
            IsKuraliIhlaliException => istisna.Message,
            _ => app.Environment.IsDevelopment() ? istisna?.ToString() : null
        };

        context.Response.StatusCode = durumKodu;
        await context.Response.WriteAsJsonAsync(new Microsoft.AspNetCore.Mvc.ProblemDetails
        {
            Status = durumKodu,
            Title = baslik,
            Detail = detay
        });
    });
});

if (app.Configuration.GetValue<bool>("TestOrtami"))
{
    app.MapGet("/api/test-hata", () => { throw new Exception("Cok gizli sistem hatasi: DB SIFRESI=123"); });
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else if (app.Configuration.GetValue("HttpsRedirection:Etkin", true))
{
    // TLS uygulamada sonlandırılıyorsa açık kalır. Yalnız HTTP dinleyen
    // container dağıtımında compose bu seçeneği kapatır.
    app.UseHttpsRedirection();
}

app.UseCors("FrontendCorsPolicy");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Hangi bagimliligin dustugunu govdede bildirir; duz "Unhealthy" metni
// PostgreSQL mi Redis mi diye ayirt etmeyi imkansiz kiliyordu.
app.MapHealthChecks("/saglik", new HealthCheckOptions
{
    ResponseWriter = async (context, rapor) =>
    {
        context.Response.ContentType = "application/json; charset=utf-8";
        await context.Response.WriteAsJsonAsync(new
        {
            durum = rapor.Status.ToString(),
            toplamSureMs = rapor.TotalDuration.TotalMilliseconds,
            kontroller = rapor.Entries.Select(e => new
            {
                ad = e.Key,
                durum = e.Value.Status.ToString(),
                sureMs = e.Value.Duration.TotalMilliseconds,
                // Hata ayrintisi yalnizca gelistirmede: uretimde baglanti
                // dizesi ve sunucu adi sizabilir.
                hata = app.Environment.IsDevelopment() ? e.Value.Exception?.Message : null
            })
        });
    }
});

app.Run();

/// <summary>Entegrasyon testlerinin WebApplicationFactory ile baglanabilmesi icin.</summary>
public partial class Program
{
    /// <summary>Swagger guvenlik semasinin adi — tanim ve gereksinim ayni degeri kullanmali.</summary>
    public const string GuvenlikSemasi = "Bearer";
}
