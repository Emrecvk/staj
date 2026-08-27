using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;
using Cevik.Alan.Teklif;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Kimlik.Dto;
using Cevik.Uygulama.Teklif.Dto;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Cevik.EntegrasyonTestleri;

/// <summary>
/// Teklif modülünün yetki ve iş kuralı sınırları.
///
/// Mevcut uçtan uca test mutlu yolu kapsıyordu; burada Görev 7'nin istediği
/// yetki denetimi, geçerlilik tarihi ve geçersiz geçiş senaryoları var.
/// </summary>
[Collection("Api")]
public class TeklifYetkiVeKuralTestleri
{
    private readonly CevikUygulamaFabrikasi _fabrika;

    public TeklifYetkiVeKuralTestleri(CevikUygulamaFabrikasi fabrika) => _fabrika = fabrika;

    // -----------------------------------------------------------------------
    // Yetki
    // -----------------------------------------------------------------------

    [Fact]
    public async Task BaskaMusterinin_Teklifi_Goruntulenemez()
    {
        var (sahipIstemci, sahipId) = await OturumAcAsync(KullaniciRolu.Musteri);
        var (yabanciIstemci, _) = await OturumAcAsync(KullaniciRolu.Musteri);

        var teklifId = await TeklifOlusturAsync(sahipId, TeklifDurumu.Yeni);

        var yanit = await yabanciIstemci.GetAsync($"/api/teklif/{teklifId}");

        yanit.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task BaskaMusterinin_Teklifi_KabulEdilemez()
    {
        var (_, sahipId) = await OturumAcAsync(KullaniciRolu.Musteri);
        var (yabanciIstemci, _) = await OturumAcAsync(KullaniciRolu.Musteri);

        var teklifId = await TeklifOlusturAsync(sahipId, TeklifDurumu.MusteriOnayiBekliyor);

        var yanit = await yabanciIstemci.PostAsync($"/api/teklif/{teklifId}/kabul", null);

        yanit.StatusCode.Should().NotBe(HttpStatusCode.OK,
            "bir musteri baskasinin teklifini kabul edememeli");

        var durum = await Veritabanindan(db => db.TeklifTalepleri
            .Where(t => t.Id == teklifId).Select(t => t.Durum).FirstAsync());

        durum.Should().Be(TeklifDurumu.MusteriOnayiBekliyor, "durum degismemis olmali");
    }

    [Fact]
    public async Task Musteri_YonetimFiyatlandirmaUcuna_Erisemez()
    {
        var (musteriIstemci, musteriId) = await OturumAcAsync(KullaniciRolu.Musteri);
        var teklifId = await TeklifOlusturAsync(musteriId, TeklifDurumu.Yeni);

        var yanit = await musteriIstemci.PutAsJsonAsync(
            $"/api/yonetim/teklifler/{teklifId}/fiyatlandir",
            new TeklifFiyatlandirDto { GecerlilikTarihi = DateTimeOffset.UtcNow.AddDays(7) });

        yanit.StatusCode.Should().Be(HttpStatusCode.Forbidden,
            "fiyatlandirma yalnizca Admin ve SatisTemsilcisi rollerine acik");
    }

    [Fact]
    public async Task SatisTemsilcisi_Fiyatlandirabilir()
    {
        var (temsilciIstemci, _) = await OturumAcAsync(KullaniciRolu.SatisTemsilcisi);
        var (_, musteriId) = await OturumAcAsync(KullaniciRolu.Musteri);

        // Fiyatlandirma once "incelemeye alma" adimini bekler; dogru akis budur.
        var (teklifId, kalemId) = await TeklifKalemliOlusturAsync(
            musteriId, TeklifDurumu.Inceleniyor, kalemliMi: true);

        var yanit = await temsilciIstemci.PutAsJsonAsync(
            $"/api/yonetim/teklifler/{teklifId}/fiyatlandir",
            new TeklifFiyatlandirDto
            {
                GecerlilikTarihi = DateTimeOffset.UtcNow.AddDays(7),
                Kalemler = new Dictionary<long, TeklifKalemiGuncelleDto>
                {
                    [kalemId] = new() { TeklifEdilenMiktar = 100, TeklifEdilenBirimFiyat = 2.5m, ParaBirimi = "USD" },
                },
            });

        yanit.StatusCode.Should().Be(HttpStatusCode.NoContent, await yanit.Content.ReadAsStringAsync());
    }

    // -----------------------------------------------------------------------
    // Durum makinesi ve geçerlilik
    // -----------------------------------------------------------------------

    [Fact]
    public async Task ReddedilenTeklif_SipariseCevrilemez()
    {
        var (musteriIstemci, musteriId) = await OturumAcAsync(KullaniciRolu.Musteri);
        var teklifId = await TeklifOlusturAsync(musteriId, TeklifDurumu.Reddedildi, kalemliMi: true);

        var yanit = await musteriIstemci.PostAsync($"/api/teklif/{teklifId}/siparis", null);

        yanit.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);

        var siparisVar = await Veritabanindan(db => db.Siparisler
            .AnyAsync(s => s.KaynakTeklifId == teklifId));
        siparisVar.Should().BeFalse();
    }

    [Fact]
    public async Task SuresiDolmusTeklif_KabulEdilemez()
    {
        var (musteriIstemci, musteriId) = await OturumAcAsync(KullaniciRolu.Musteri);

        // Geçerlilik tarihi geçmişte kalan bir teklif.
        var teklifId = await TeklifOlusturAsync(
            musteriId, TeklifDurumu.MusteriOnayiBekliyor,
            gecerlilikTarihi: DateTimeOffset.UtcNow.AddDays(-1));

        var yanit = await musteriIstemci.PostAsync($"/api/teklif/{teklifId}/kabul", null);

        yanit.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity,
            "gecerlilik tarihi gecmis teklif kabul edilememeli");

        var durum = await Veritabanindan(db => db.TeklifTalepleri
            .Where(t => t.Id == teklifId).Select(t => t.Durum).FirstAsync());

        durum.Should().NotBe(TeklifDurumu.KabulEdildi);
    }

    [Fact]
    public async Task MusteriRet_TeklifiReddedildiDurumunaGecirir()
    {
        var (musteriIstemci, musteriId) = await OturumAcAsync(KullaniciRolu.Musteri);
        var teklifId = await TeklifOlusturAsync(musteriId, TeklifDurumu.MusteriOnayiBekliyor);

        var yanit = await musteriIstemci.PostAsync($"/api/teklif/{teklifId}/red", null);
        yanit.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var durum = await Veritabanindan(db => db.TeklifTalepleri
            .Where(t => t.Id == teklifId).Select(t => t.Durum).FirstAsync());

        durum.Should().Be(TeklifDurumu.Reddedildi);
    }

    [Fact]
    public async Task KabulEdilmemisTeklif_SipariseCevrilemez()
    {
        var (musteriIstemci, musteriId) = await OturumAcAsync(KullaniciRolu.Musteri);

        // Fiyatlandirilmis ama musteri henuz kabul etmemis.
        var teklifId = await TeklifOlusturAsync(musteriId, TeklifDurumu.MusteriOnayiBekliyor, kalemliMi: true);

        var yanit = await musteriIstemci.PostAsync($"/api/teklif/{teklifId}/siparis", null);

        yanit.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity,
            "yalnizca kabul edilmis teklif siparise donusebilir");
    }

    // -----------------------------------------------------------------------
    // Yardımcılar
    // -----------------------------------------------------------------------

    private Task<T> Veritabanindan<T>(Func<CevikDbContext, Task<T>> islem) => _fabrika.Veritabaniyla(islem);

    private async Task<(long TeklifId, long KalemId)> TeklifKalemliOlusturAsync(
        long kullaniciId,
        TeklifDurumu durum,
        DateTimeOffset? gecerlilikTarihi = null,
        bool kalemliMi = false)
    {
        using var scope = _fabrika.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CevikDbContext>();

        var kullanici = await db.Kullanicilar.FindAsync(kullaniciId);
        var urunId = await db.Urunler.OrderBy(u => u.Id).Select(u => u.Id).FirstAsync();

        var teklif = new TeklifTalebi
        {
            TalepNo = $"TK-{Guid.NewGuid():N}"[..12],
            KullaniciId = kullaniciId,
            FirmaId = kullanici!.FirmaId,
            Durum = durum,
            GecerlilikTarihi = gecerlilikTarihi,
        };

        if (kalemliMi)
        {
            teklif.Kalemler.Add(new TeklifKalemi
            {
                UrunId = urunId,
                Miktar = 100,
                TeklifEdilenMiktar = 100,
                TeklifEdilenBirimFiyat = 1.5m,
                ParaBirimi = "USD",
            });
        }

        db.TeklifTalepleri.Add(teklif);
        await db.SaveChangesAsync();

        // Kalem kimliği burada okunur; ayrı bir sorgu global filtrelere takılabiliyor.
        return (teklif.Id, teklif.Kalemler.FirstOrDefault()?.Id ?? 0);
    }

    private async Task<long> TeklifOlusturAsync(
        long kullaniciId,
        TeklifDurumu durum,
        DateTimeOffset? gecerlilikTarihi = null,
        bool kalemliMi = false)
    {
        var (teklifId, _) = await TeklifKalemliOlusturAsync(kullaniciId, durum, gecerlilikTarihi, kalemliMi);
        return teklifId;
    }

    private async Task<(HttpClient Client, long UserId)> OturumAcAsync(KullaniciRolu rol)
    {
        var istemci = _fabrika.CreateClient();

        var eposta = $"tky_{rol}_{Guid.NewGuid():N}@test.com".ToLowerInvariant();
        const string sifre = "Sifre.123";

        (await istemci.PostAsJsonAsync("/api/kimlik/kayit", new
        {
            ad = rol.ToString(), soyad = "Test", eposta, telefon = "05551234567", sifre,
        })).EnsureSuccessStatusCode();

        long kullaniciId;
        using (var scope = _fabrika.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CevikDbContext>();
            var kullanici = await db.Kullanicilar.FirstAsync(k => k.Eposta == eposta);

            // Her kullanıcı KENDİ firmasına bağlanır; ortak firma paylaşımı
            // yetki testlerini anlamsız kılardı.
            var firma = new Firma
            {
                Unvan = $"Test Firması {Guid.NewGuid():N}"[..24],
                VergiNo = Random.Shared.Next(1000000000, int.MaxValue).ToString(),
                VergiDairesi = "Test",
                OnayDurumu = FirmaOnayDurumu.Onaylandi,
            };
            db.Firmalar.Add(firma);
            await db.SaveChangesAsync();

            kullanici.Rol = rol;
            kullanici.EpostaDogrulandiMi = true;
            kullanici.FirmaId = firma.Id;
            kullanici.FirmaYetkilisiMi = true;
            await db.SaveChangesAsync();
            kullaniciId = kullanici.Id;
        }

        var giris = await istemci.PostAsJsonAsync("/api/kimlik/giris", new { eposta, sifre });
        giris.EnsureSuccessStatusCode();

        var token = await giris.Content.ReadFromJsonAsync<TokenDto>(
            new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web));

        istemci.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token!.AccessToken);

        // Token alindiktan SONRA rol veritabaninda geri alinir.
        // Yetkilendirme JWT talebinden okunur, veritabanindan degil; boylece
        // istemci bu test boyunca yetkili kalir ama kalici bir Admin kaydi
        // birakmayiz. GuvenlikTestleri "sistemde tek yonetici olmali" diye
        // dogruluyor ve testler ayni veritabanini paylasiyor.
        if (rol == KullaniciRolu.Admin)
        {
            using var scope = _fabrika.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            var kullanici = await db.Kullanicilar.FirstAsync(k => k.Eposta == eposta);
            kullanici.Rol = KullaniciRolu.Musteri;
            await db.SaveChangesAsync();
        }

        return (istemci, kullaniciId);
    }
}
