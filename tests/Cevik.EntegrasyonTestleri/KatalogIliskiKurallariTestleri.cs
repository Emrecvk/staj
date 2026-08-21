using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Cevik.Alan.Ortak;
using Cevik.Uygulama.Kimlik.Dto;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Cevik.EntegrasyonTestleri;

/// <summary>
/// İlişkili ürün kuralları (Görev 5).
///
/// Muadil ilişkisinin çift yönlü olması servis katmanında garanti ediliyordu
/// ama hiç test edilmemişti; ürün detayındaki ilişkili ürün grupları da
/// doğrulanmamıştı.
/// </summary>
[Collection("Api")]
public class KatalogIliskiKurallariTestleri
{
    private const short Muadil = 1;
    private const short Benzer = 2;
    private const short BirlikteKullanilan = 4;

    private readonly CevikUygulamaFabrikasi _fabrika;
    private readonly HttpClient _istemci;

    private static readonly JsonSerializerOptions JsonAyarlari = new(JsonSerializerDefaults.Web);

    public KatalogIliskiKurallariTestleri(CevikUygulamaFabrikasi fabrika)
    {
        _fabrika = fabrika;
        _istemci = fabrika.CreateClient();
    }

    [Fact]
    public async Task MuadilIliskisi_CiftYonlu_Kurulur()
    {
        var (a, b) = await IkiUrunAsync();
        var admin = await AdminIstemcisiAsync();

        var yanit = await admin.PostAsJsonAsync($"/api/yonetim/urun/{a}/iliskili",
            new { iliskiliUrunId = b, tip = Muadil, sira = 0 });
        yanit.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Yalnizca A→B degil, B→A da olusmali: kullanici hangi urunden bakarsa
        // baksin muadili gormeli.
        var ileri = await IliskiVarMiAsync(a, b, Muadil);
        var geri = await IliskiVarMiAsync(b, a, Muadil);

        ileri.Should().BeTrue();
        geri.Should().BeTrue("muadil iliskisi cift yonlu olmali");
    }

    [Fact]
    public async Task MuadilDisindakiIliskiler_TekYonlu_Kalir()
    {
        var (a, b) = await IkiUrunAsync();
        var admin = await AdminIstemcisiAsync();

        await admin.PostAsJsonAsync($"/api/yonetim/urun/{a}/iliskili",
            new { iliskiliUrunId = b, tip = BirlikteKullanilan, sira = 0 });

        (await IliskiVarMiAsync(a, b, BirlikteKullanilan)).Should().BeTrue();
        (await IliskiVarMiAsync(b, a, BirlikteKullanilan)).Should().BeFalse(
            "yalnizca muadil cift yonludur; 'birlikte kullanilan' yonlu bir iliskidir");
    }

    [Fact]
    public async Task AyniIliski_IkinciKezEklenince_Cogalmaz()
    {
        var (a, b) = await IkiUrunAsync();
        var admin = await AdminIstemcisiAsync();

        await admin.PostAsJsonAsync($"/api/yonetim/urun/{a}/iliskili",
            new { iliskiliUrunId = b, tip = Benzer, sira = 0 });
        await admin.PostAsJsonAsync($"/api/yonetim/urun/{a}/iliskili",
            new { iliskiliUrunId = b, tip = Benzer, sira = 0 });

        var adet = await _fabrika.Veritabaniyla(db => db.IliskiliUrunler
            .CountAsync(i => i.UrunId == a && i.IliskiliUrunId == b && i.IliskiTipi == IliskiTipi.Benzer));

        adet.Should().Be(1);
    }

    [Fact]
    public async Task Urun_KendisiyleIliskilendirilemez()
    {
        var (a, _) = await IkiUrunAsync();
        var admin = await AdminIstemcisiAsync();

        var yanit = await admin.PostAsJsonAsync($"/api/yonetim/urun/{a}/iliskili",
            new { iliskiliUrunId = a, tip = Muadil, sira = 0 });

        yanit.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task UrunDetayi_IliskiliUrunGruplariniDoner()
    {
        var (a, b) = await IkiUrunAsync();
        var admin = await AdminIstemcisiAsync();

        await admin.PostAsJsonAsync($"/api/yonetim/urun/{a}/iliskili",
            new { iliskiliUrunId = b, tip = Muadil, sira = 0 });

        var detay = await _istemci.GetFromJsonAsync<JsonElement>($"/api/katalog/urunler/{a}", JsonAyarlari);

        // Dort grup da cevapta bulunmali; muadil dolu olmali.
        foreach (var grup in new[] { "muadiller", "benzerUrunler", "parametrikUrunler", "birlikteKullanilanlar" })
            detay.TryGetProperty(grup, out _).Should().BeTrue($"{grup} alani urun detayinda olmali");

        var muadiller = detay.GetProperty("muadiller").EnumerateArray().ToList();
        muadiller.Should().ContainSingle();
        muadiller[0].GetProperty("id").GetInt64().Should().Be(b);
    }

    [Fact]
    public async Task IliskiSilme_MuadildeCiftYonluKaldirir()
    {
        var (a, b) = await IkiUrunAsync();
        var admin = await AdminIstemcisiAsync();

        await admin.PostAsJsonAsync($"/api/yonetim/urun/{a}/iliskili",
            new { iliskiliUrunId = b, tip = Muadil, sira = 0 });

        var silme = await admin.DeleteAsync($"/api/yonetim/urun/{a}/iliskili/{b}/{Muadil}");
        silme.StatusCode.Should().Be(HttpStatusCode.NoContent);

        (await IliskiVarMiAsync(a, b, Muadil)).Should().BeFalse();
        (await IliskiVarMiAsync(b, a, Muadil)).Should().BeFalse(
            "cift yonlu kurulan iliski cift yonlu kaldirilmali; aksi halde tek tarafli artik kayit kalir");
    }

    [Fact]
    public async Task IliskiEkleme_MusteriRolune_Kapali()
    {
        var (a, b) = await IkiUrunAsync();
        var musteri = await MusteriIstemcisiAsync();

        var yanit = await musteri.PostAsJsonAsync($"/api/yonetim/urun/{a}/iliskili",
            new { iliskiliUrunId = b, tip = Muadil, sira = 0 });

        yanit.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    // -----------------------------------------------------------------------

    private Task<bool> IliskiVarMiAsync(long urunId, long iliskiliId, short tip) =>
        _fabrika.Veritabaniyla(db => db.IliskiliUrunler
            .AnyAsync(i => i.UrunId == urunId
                        && i.IliskiliUrunId == iliskiliId
                        && i.IliskiTipi == (IliskiTipi)tip));

    /// <summary>Testler arası çakışmayı önlemek için her seferinde yeni ürün çifti.</summary>
    private async Task<(long A, long B)> IkiUrunAsync()
    {
        using var scope = _fabrika.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();

        var kategoriId = await db.Kategoriler.Where(k => k.YaprakMi).Select(k => k.Id).FirstAsync();
        var ureticiId = await db.Ureticiler.Select(u => u.Id).FirstAsync();

        var urunler = Enumerable.Range(0, 2).Select(_ =>
        {
            var kod = $"REL-{Guid.NewGuid():N}"[..16].ToUpperInvariant();
            return new Cevik.Alan.Katalog.Urun
            {
                KategoriId = kategoriId,
                UreticiId = ureticiId,
                UreticiUrunKodu = kod,
                NormalizeKod = Cevik.Alan.Kurallar.UrunKoduNormalizeleyici.Normalize(kod),
                KisaAciklama = "Iliski testi urunu",
                Aktif = true,
            };
        }).ToList();

        db.Urunler.AddRange(urunler);
        await db.SaveChangesAsync();

        return (urunler[0].Id, urunler[1].Id);
    }

    private Task<HttpClient> AdminIstemcisiAsync() => RolluIstemciAsync(KullaniciRolu.Admin);
    private Task<HttpClient> MusteriIstemcisiAsync() => RolluIstemciAsync(KullaniciRolu.Musteri);

    private async Task<HttpClient> RolluIstemciAsync(KullaniciRolu rol)
    {
        var istemci = _fabrika.CreateClient();

        var eposta = $"iliski_{rol}_{Guid.NewGuid():N}@test.com".ToLowerInvariant();
        const string sifre = "Sifre.123";

        (await istemci.PostAsJsonAsync("/api/kimlik/kayit", new
        {
            ad = rol.ToString(), soyad = "Test", eposta, telefon = "05551234567", sifre,
        })).EnsureSuccessStatusCode();

        if (rol != KullaniciRolu.Musteri)
        {
            using var scope = _fabrika.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            var kullanici = await db.Kullanicilar.FirstAsync(k => k.Eposta == eposta);
            kullanici.Rol = rol;
            await db.SaveChangesAsync();
        }

        var giris = await istemci.PostAsJsonAsync("/api/kimlik/giris", new { eposta, sifre });
        giris.EnsureSuccessStatusCode();

        var token = await giris.Content.ReadFromJsonAsync<TokenDto>(JsonAyarlari);
        istemci.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token!.AccessToken);

        // Token alindiktan SONRA rol veritabaninda geri alinir.
        // Yetkilendirme JWT talebinden okunur, veritabanindan degil; boylece
        // istemci bu test boyunca yetkili kalir ama kalici bir Admin kaydi
        // birakmayiz. GuvenlikTestleri "sistemde tek yonetici olmali" diye
        // dogruluyor ve testler ayni veritabanini paylasiyor.
        if (rol != KullaniciRolu.Musteri)
        {
            using var scope = _fabrika.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            var kullanici = await db.Kullanicilar.FirstAsync(k => k.Eposta == eposta);
            kullanici.Rol = KullaniciRolu.Musteri;
            await db.SaveChangesAsync();
        }

        return istemci;
    }
}
