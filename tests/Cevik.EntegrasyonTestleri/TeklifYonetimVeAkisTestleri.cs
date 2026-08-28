using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Cevik.Alan.Ortak;
using Cevik.Alan.Teklif;
using Cevik.Uygulama.Kimlik.Dto;
using Cevik.Uygulama.Teklif.Dto;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Cevik.EntegrasyonTestleri;

[Collection("Api")]
public class TeklifYonetimVeAkisTestleri
{
    private readonly CevikUygulamaFabrikasi _fabrika;

    public TeklifYonetimVeAkisTestleri(CevikUygulamaFabrikasi fabrika)
    {
        _fabrika = fabrika;
    }

    /// <summary>
    /// Register → patch role in DB → login → return authenticated client + userId
    /// </summary>
    private async Task<(System.Net.Http.HttpClient Client, long UserId)> OturumAcAsync(KullaniciRolu rol)
    {
        var client = _fabrika.CreateClient();

        var eposta = $"teklif_{rol}_{Guid.NewGuid():N}@test.com".ToLowerInvariant();
        var sifre = "Sifre.123";

        // 1. Kayıt
        var kayitYanit = await client.PostAsJsonAsync("/api/kimlik/kayit", new KullaniciKayitDto
        {
            Ad = rol.ToString(),
            Soyad = "Test",
            Eposta = eposta,
            Telefon = "05551234567",
            Sifre = sifre
        });
        kayitYanit.EnsureSuccessStatusCode();

        // 2. Rolü DB'de güncelle
        long userId;
        using (var scope = _fabrika.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            var user = await db.Kullanicilar.FirstAsync(u => u.Eposta == eposta);
            
            var firma = await db.Firmalar.FirstOrDefaultAsync();
            if (firma == null)
            {
                firma = new Cevik.Alan.Kimlik.Firma
                {
                    Unvan = "Test Firması",
                    VergiNo = "1234567890",
                    VergiDairesi = "Test",
                    OnayDurumu = FirmaOnayDurumu.Onaylandi
                };
                db.Firmalar.Add(firma);
                await db.SaveChangesAsync();
            }

            user.Rol = rol;
            user.EpostaDogrulandiMi = true;
            user.FirmaId = firma.Id;
            await db.SaveChangesAsync();
            userId = user.Id;
        }

        // 3. Giriş
        var girisYanit = await client.PostAsJsonAsync("/api/kimlik/giris", new KullaniciGirisDto
        {
            Eposta = eposta,
            Sifre = sifre
        });
        girisYanit.EnsureSuccessStatusCode();
        var tokenDto = await girisYanit.Content.ReadFromJsonAsync<TokenDto>();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokenDto!.AccessToken);

        // Koleksiyon fixture'ı artık tüm entegrasyon sınıflarınca paylaşılıyor.
        // JWT rol talebini aldıktan sonra geçici Admin kaydını müşteri rolüne
        // döndürerek sonraki güvenlik testlerine kalıcı durum bırakma.
        if (rol == KullaniciRolu.Admin)
        {
            using var scope = _fabrika.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            var user = await db.Kullanicilar.FirstAsync(u => u.Eposta == eposta);
            user.Rol = KullaniciRolu.Musteri;
            await db.SaveChangesAsync();
        }

        return (client, userId);
    }

    [Fact]
    public async Task TeklifAkisi_UctanUca_Basarili()
    {
        // Oturumları aç
        var (adminClient, _) = await OturumAcAsync(KullaniciRolu.Admin);
        var (musteriClient, musteriId) = await OturumAcAsync(KullaniciRolu.Musteri);

        // ── 1. DB'ye doğrudan teklif ekle ──
        //
        // Teklif kalemi GERÇEK bir ambalaja bağlanır ve müşteriye adres
        // tanımlanır: siparişe dönüşüm artık MOQ/katlama doğruluyor, stok
        // düşüyor ve adres snapshot'ı alıyor. Önceki sürüm ambalajsız kalem
        // ve adressiz müşteriyle sipariş üretiyordu — sevk edilemez bir
        // sipariş ve stoktan düşülmemiş bir satış demekti.
        long teklifId;
        long ambalajId;
        int stokOncesi;
        using (var scope = _fabrika.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            var musteriKullanici = await db.Kullanicilar.FindAsync(musteriId);

            var ambalaj = await db.UrunAmbalajlari
                .Where(a => a.Moq == 1 && a.KatlamaMiktari == 1 && a.StokMiktari >= 500)
                .OrderBy(a => a.Id)
                .FirstAsync();
            ambalajId = ambalaj.Id;
            stokOncesi = (int)ambalaj.StokMiktari;

            db.Adresler.Add(new Cevik.Alan.Kimlik.Adres
            {
                KullaniciId = musteriId,
                Tip = AdresTipi.Teslimat,
                Baslik = "Merkez",
                AdSoyad = "Teklif Test",
                Il = "İstanbul",
                Ilce = "Kadıköy",
                AcikAdres = "Test Mah. 1. Sk. No:1",
                VarsayilanMi = true
            });

            var teklif = new TeklifTalebi
            {
                TalepNo = "TK-" + Guid.NewGuid().ToString()[..8],
                KullaniciId = musteriId,
                FirmaId = musteriKullanici!.FirmaId,
                Durum = TeklifDurumu.Yeni,
                MusteriNotu = "Fiyat istiyorum",
                Kalemler = new List<TeklifKalemi>
                {
                    new()
                    {
                        UrunId = ambalaj.UrunId,
                        UrunAmbalajId = ambalaj.Id,
                        Miktar = 100,
                        HedefBirimFiyat = 1.5m
                    }
                }
            };
            db.TeklifTalepleri.Add(teklif);
            await db.SaveChangesAsync();
            teklifId = teklif.Id;
        }

        // ── 2. Admin: İncelemeye al ──
        var inceleYanit = await adminClient.PostAsync($"/api/yonetim/teklifler/{teklifId}/incele", null);
        inceleYanit.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // ── 3. Admin: Fiyatlandır ──
        long kalemId;
        using (var scope = _fabrika.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            var t = await db.TeklifTalepleri.Include(x => x.Kalemler).FirstAsync(x => x.Id == teklifId);
            kalemId = t.Kalemler.First().Id;
        }

        var fiyatlandirDto = new TeklifFiyatlandirDto
        {
            GecerlilikTarihi = DateTimeOffset.UtcNow.AddDays(7),
            TemsilciNotu = "Özel fiyat",
            Kalemler = new Dictionary<long, TeklifKalemiGuncelleDto>
            {
                [kalemId] = new()
                {
                    TeklifEdilenMiktar = 100,
                    TeklifEdilenBirimFiyat = 1.2m,
                    ParaBirimi = "USD",
                    TeklifEdilenTeslimSuresiGun = 14,
                    SatisTemsilcisiNotu = "Stokta var"
                }
            }
        };
        var fiyatYanit = await adminClient.PutAsJsonAsync($"/api/yonetim/teklifler/{teklifId}/fiyatlandir", fiyatlandirDto);
        fiyatYanit.StatusCode.Should().Be(HttpStatusCode.NoContent, await fiyatYanit.Content.ReadAsStringAsync());

        // ── 4. Müşteri: Detay gör + Kabul et ──
        var detay = await musteriClient.GetFromJsonAsync<TeklifDetayDto>($"/api/teklif/{teklifId}");
        detay.Should().NotBeNull();
        detay!.Durum.Should().Be(TeklifDurumu.MusteriOnayiBekliyor);
        detay.Kalemler.First().TeklifEdilenBirimFiyat.Should().Be(1.2m);

        var kabulYanit = await musteriClient.PostAsync($"/api/teklif/{teklifId}/kabul", null);
        kabulYanit.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // ── 5. Müşteri: Siparişe dönüştür ──
        var siparisYanit = await musteriClient.PostAsync($"/api/teklif/{teklifId}/siparis", null);
        siparisYanit.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // ── 6. İkinci kez dönüştürme → 422 ──
        var siparisYanit2 = await musteriClient.PostAsync($"/api/teklif/{teklifId}/siparis", null);
        siparisYanit2.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);

        // ── 7. DB doğrulama ──
        using (var scope = _fabrika.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            var teklifDb = await db.TeklifTalepleri.FindAsync(teklifId);
            teklifDb!.Durum.Should().Be(TeklifDurumu.SipariseDonusturuldu);

            var siparis = await db.Siparisler
                .Include(s => s.Kalemler)
                .FirstOrDefaultAsync(s => s.KaynakTeklifId == teklifId);
            siparis.Should().NotBeNull();
            siparis!.Kalemler.Should().NotBeEmpty();
            siparis.Kalemler.First().BirimFiyat.Should().Be(1.2m);
            siparis.Kalemler.First().UrunKoduSnapshot.Should().NotBeNullOrEmpty();

            // Teklif yolu, sepet yoluyla AYNI kurallardan geçmeli.
            siparis.SiparisNo.Should().StartWith("SIP-",
                "teklif dönüşümü de ortak sipariş numarası şemasını kullanmalı");
            siparis.KdvTutari.Should().BeGreaterThan(0, "KDV hesaplanmalı");
            siparis.GenelToplam.Should().BeGreaterThan(siparis.AraToplam,
                "genel toplam KDV ve kargoyu içermeli");
            siparis.FaturaAdresiJson.Should().NotBe("{}", "adres snapshot'ı alınmalı");
            siparis.Kalemler.First().AmbalajAdiSnapshot.Should().NotBe("Varsayılan",
                "gerçek ambalaj adı snapshot'lanmalı");

            var stokSonrasi = await db.UrunAmbalajlari
                .Where(a => a.Id == ambalajId)
                .Select(a => a.StokMiktari)
                .FirstAsync();
            stokSonrasi.Should().Be(stokOncesi - 100,
                "teklif siparişe dönüşünce stok düşmeli — önceki sürüm hiç düşürmüyordu");
        }
    }

    [Fact]
    public async Task GecersizDurumGecisi_Reddedilir()
    {
        var (musteriClient, musteriId) = await OturumAcAsync(KullaniciRolu.Musteri);

        // "Yeni" durumdaki teklife kabul gönder → başarısız olmalı
        long teklifId;
        using (var scope = _fabrika.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<Cevik.Altyapi.Veritabani.CevikDbContext>();
            var musteriKullanici = await db.Kullanicilar.FindAsync(musteriId);

            var teklif = new TeklifTalebi
            {
                TalepNo = "TK-INVALID-" + Guid.NewGuid().ToString()[..6],
                KullaniciId = musteriId,
                FirmaId = musteriKullanici!.FirmaId,
                Durum = TeklifDurumu.Yeni
            };
            db.TeklifTalepleri.Add(teklif);
            await db.SaveChangesAsync();
            teklifId = teklif.Id;
        }

        // Yeni → Kabul deniyor (geçersiz geçiş)
        var kabulYanit = await musteriClient.PostAsync($"/api/teklif/{teklifId}/kabul", null);
        kabulYanit.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);

        // Yeni → Siparişe dönüştür (geçersiz geçiş)
        var siparisYanit = await musteriClient.PostAsync($"/api/teklif/{teklifId}/siparis", null);
        siparisYanit.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }
}
