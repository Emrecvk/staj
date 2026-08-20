using System.Net;
using System.Text.Json;
using FluentAssertions;

namespace Cevik.EntegrasyonTestleri;

/// <summary>
/// Swagger/OpenAPI duman testleri.
///
/// Neden var: swagger.json üretimi uzun süre HTTP 500 döndü ve kimse fark etmedi.
/// Sebep Swashbuckle ile Microsoft.OpenApi arasındaki sürüm uyumsuzluğuydu
/// (<c>MissingMethodException: IOpenApiRequestBody.get_Content()</c>). Derleme
/// başarılıydı, uygulama açılıyordu, yalnızca doküman üretimi patlıyordu —
/// yani bu hatayı yalnızca ucu gerçekten çağıran bir test yakalayabilir.
///
/// Paket sürümleri yükseltilirken bu testler kırılırsa, Directory.Packages.props
/// içindeki Microsoft.OpenApi pini Swashbuckle'ın beklediği bandın dışına çıkmış
/// demektir.
/// </summary>
[Collection("Api")]
public class SwaggerTestleri
{
    private readonly HttpClient _istemci;

    public SwaggerTestleri(CevikUygulamaFabrikasi fabrika) => _istemci = fabrika.CreateClient();

    [Fact]
    public async Task SwaggerJson_200_Doner()
    {
        var yanit = await _istemci.GetAsync("/swagger/v1/swagger.json");

        yanit.StatusCode.Should().Be(HttpStatusCode.OK,
            "swagger.json üretimi paket uyumsuzluğunda 500 dönüyordu");
    }

    [Fact]
    public async Task SwaggerUI_200_Doner()
    {
        var yanit = await _istemci.GetAsync("/swagger/index.html");

        yanit.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task SwaggerJson_GecerliOpenApiBelgesi()
    {
        using var belge = JsonDocument.Parse(await _istemci.GetStringAsync("/swagger/v1/swagger.json"));
        var kok = belge.RootElement;

        kok.TryGetProperty("openapi", out var surum).Should().BeTrue("belge OpenAPI sürümünü bildirmeli");
        surum.GetString().Should().StartWith("3.");

        kok.GetProperty("info").GetProperty("title").GetString().Should().Be("CEVIK Elektronik API");
        kok.TryGetProperty("paths", out _).Should().BeTrue();
    }

    [Fact]
    public async Task SwaggerJson_TumControllerlariIceriyor()
    {
        using var belge = JsonDocument.Parse(await _istemci.GetStringAsync("/swagger/v1/swagger.json"));
        var yollar = belge.RootElement.GetProperty("paths")
            .EnumerateObject()
            .Select(p => p.Name)
            .ToList();

        yollar.Should().NotBeEmpty();

        // Her ana modülden en az bir uç dokümana girmeli; biri kaybolursa
        // ApiExplorer o controller'ı görmüyor demektir.
        yollar.Should().Contain(y => y.StartsWith("/api/Katalog"), "katalog uçları");
        yollar.Should().Contain(y => y.StartsWith("/api/Kimlik"), "kimlik uçları");
        yollar.Should().Contain(y => y.StartsWith("/api/Sepet"), "sepet uçları");
        yollar.Should().Contain(y => y.StartsWith("/api/Siparis"), "sipariş uçları");
        yollar.Should().Contain(y => y.StartsWith("/api/Teklif"), "teklif uçları");
        yollar.Should().Contain(y => y.StartsWith("/api/Yonetim"), "yönetim uçları");
    }

    [Fact]
    public async Task SwaggerJson_BearerGuvenlikSemasiTanimli()
    {
        // "Authorize" düğmesinin görünmesinin şartı: securitySchemes içinde tanım olması.
        using var belge = JsonDocument.Parse(await _istemci.GetStringAsync("/swagger/v1/swagger.json"));

        var semalar = belge.RootElement
            .GetProperty("components")
            .GetProperty("securitySchemes");

        semalar.TryGetProperty("Bearer", out var bearer).Should().BeTrue(
            "Authorize düğmesi Bearer şeması tanımlıysa görünür");

        bearer.GetProperty("type").GetString().Should().Be("apiKey");
        bearer.GetProperty("in").GetString().Should().Be("header");
        bearer.GetProperty("name").GetString().Should().Be("Authorization");

        // Kullanıcıya "Bearer <token>" biçimini söyleyen açıklama.
        bearer.GetProperty("description").GetString().Should().Contain("Bearer ");
    }

    [Fact]
    public async Task SwaggerJson_GuvenlikGereksinimiUygulanmis()
    {
        using var belge = JsonDocument.Parse(await _istemci.GetStringAsync("/swagger/v1/swagger.json"));
        var kok = belge.RootElement;

        // Şema tanımlı olsa bile "security" gereksinimi yoksa Swagger UI
        // token'ı isteklere eklemez; ikisi birlikte gerekir.
        //
        // Swashbuckle, SwaggerGenOptions üzerindeki AddSecurityRequirement'ı
        // BELGE KÖKÜNE yazar. OpenAPI'de kök seviyesindeki security, kendi
        // security'sini tanımlamayan tüm operasyonlara uygulanır — yani
        // operasyon başına tekrar edilmesi gerekmez. Testi her iki yerleşimi
        // de kabul edecek şekilde yazıyoruz ki Swashbuckle davranışını
        // değiştirirse test yanlış alarm vermesin.
        var koktekiGereksinim =
            kok.TryGetProperty("security", out var kokSecurity)
            && kokSecurity.EnumerateArray().Any(e => e.TryGetProperty(Sema, out _));

        var operasyondakiGereksinim = kok.GetProperty("paths")
            .EnumerateObject()
            .SelectMany(yol => yol.Value.EnumerateObject())
            .Where(op => op.Value.ValueKind == JsonValueKind.Object)
            .Any(op => op.Value.TryGetProperty("security", out var g)
                    && g.EnumerateArray().Any(e => e.TryGetProperty(Sema, out _)));

        (koktekiGereksinim || operasyondakiGereksinim).Should().BeTrue(
            "Bearer güvenlik gereksinimi ya belge kökünde ya da operasyonlarda bulunmalı; "
            + "yoksa Authorize ile girilen token isteklere eklenmez");
    }

    private const string Sema = "Bearer";
}
