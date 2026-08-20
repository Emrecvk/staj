using Cevik.Altyapi.Katalog.Servisler;
using Cevik.Altyapi.Kimlik.Servisler;
using Cevik.Altyapi.Siparis.Servisler;
using Cevik.Altyapi.Teklif.Servisler;
using Cevik.Altyapi.Veritabani;
using Cevik.Altyapi.Veritabani.Seed;
using Cevik.Altyapi.Yonetim.Servisler;
using Cevik.Uygulama.Katalog.Arayuzler;
using Cevik.Uygulama.Kimlik.Arayuzler;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Siparis.Arayuzler;
using Cevik.Uygulama.Teklif.Arayuzler;
using Cevik.Uygulama.Yonetim.Arayuzler;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Security.Claims;
using System.Text;

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
    .Bind(builder.Configuration.GetSection(JwtAyarlari.BolumAdi))
    .Validate(ayarlar => ayarlar.GecerliMi(out _), "Jwt yapilandirmasi gecersiz.")
    .ValidateOnStart();

builder.Services.Configure<TicariAyarlar>(builder.Configuration.GetSection(TicariAyarlar.BolumAdi));

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
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CEVIK Elektronik API", Version = "v1" });

    // Swagger arayuzunden korumali uclari deneyebilmek icin Bearer destegi
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT token degerini Bearer on eki OLMADAN yapistirin."
    });
    // Swashbuckle 10 + Microsoft.OpenApi 2.x: gereksinim, dokumani alan bir
    // fabrika ile verilir ve sema referansi ayri bir tiptir.
    c.AddSecurityRequirement(dokuman => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer", dokuman), new List<string>() }
    });
});

builder.Services.AddCors(options =>
{
    // Kokenler lambda icinde okunur; boylece nihai yapilandirmadan gelir.
    var izinliKokenler = builder.Configuration.GetSection("Cors:IzinliKokenler").Get<string[]>()
        ?? ["http://localhost:3000"];

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

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    options.InstanceName = "Cevik_";
});

builder.Services.AddScoped<CevikDataSeeder>();
builder.Services.AddScoped<IKatalogServisi, KatalogServisi>();
builder.Services.AddScoped<IKimlikServisi, KimlikServisi>();
builder.Services.AddScoped<IProfilServisi, ProfilServisi>();
builder.Services.AddScoped<ISepetServisi, SepetServisi>();
builder.Services.AddScoped<ISiparisServisi, SiparisServisi>();
builder.Services.AddScoped<IDovizKuruServisi, Cevik.Altyapi.Fiyatlama.Servisler.DovizKuruServisi>();
builder.Services.AddScoped<ITeklifServisi, TeklifServisi>();
builder.Services.AddScoped<IYonetimServisi, YonetimServisi>();

var app = builder.Build();

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
            _ => (StatusCodes.Status500InternalServerError, "Beklenmeyen bir hata olustu")
        };

        context.Response.StatusCode = durumKodu;
        await context.Response.WriteAsJsonAsync(new
        {
            baslik,
            // Ayrintiyi yalnizca beklenen hatalarda gonder; 500'de ic detay sizdirma.
            detay = durumKodu == StatusCodes.Status500InternalServerError ? null : istisna?.Message,
            durumKodu
        });
    });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Container icinde yalnizca HTTP dinleniyor; yonlendirme gelistirmede
    // Swagger'i kirdigi icin uretim disinda kapali.
    app.UseHttpsRedirection();
}

app.UseCors("FrontendCorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/saglik", () => Results.Ok(new { durum = "ayakta", zaman = DateTimeOffset.UtcNow }));

app.Run();

/// <summary>Entegrasyon testlerinin WebApplicationFactory ile baglanabilmesi icin.</summary>
public partial class Program;
