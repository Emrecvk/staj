using System.Text.Json;
using Bogus;
using Cevik.Alan.Icerik;
using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Katalog;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Cevik.Altyapi.Veritabani.Seed;

/// <summary>
/// Sentetik katalog üreticisi.
///
/// Kasıtlı olarak ozdisan.com'dan veri KAZINMAZ; yalnızca veri yapısı taklit edilir
/// (PLANLAMA.md 3 - "Veri nereden gelecek"). Üretilen kodlar, üretici adları ve
/// parametre değerleri gerçek komponent ailelerinin desenini izler ki
/// arama ve parametrik filtre özellikleri gösterilebilsin.
/// </summary>
public class CevikDataSeeder
{
    private const int UrunSayisi = 5000;
    private const int TohumDegeri = 20260820; // Deterministik: her kurulumda aynı katalog

    private readonly CevikDbContext _context;
    private readonly ILogger<CevikDataSeeder> _logger;
    private readonly IConfiguration _yapilandirma;

    public CevikDataSeeder(CevikDbContext context, ILogger<CevikDataSeeder> logger, IConfiguration yapilandirma)
    {
        _context = context;
        _logger = logger;
        _yapilandirma = yapilandirma;
    }

    public async Task SeedAsync()
    {
        await YoneticiHesabiOlusturAsync();
        await DovizKurlariniEkleAsync();
        await OrnekIcerikEkleAsync();

        if (await _context.Kategoriler.AnyAsync())
        {
            _logger.LogInformation("Katalog zaten dolu, ürün seed işlemi atlanıyor.");
            return;
        }

        _logger.LogInformation("Katalog üretiliyor...");

        var ozellikler = await OzellikTanimlariniEkleAsync();
        var (yapraklar, kategoriOzellikHaritasi) = await KategorileriEkleAsync(ozellikler);
        var ureticiler = await UreticileriEkleAsync();

        await UrunleriUretAsync(yapraklar, kategoriOzellikHaritasi, ureticiler, ozellikler);

        _logger.LogInformation("Katalog seed işlemi tamamlandı.");
    }

    // -----------------------------------------------------------------------
    // Yönetici hesabı
    // -----------------------------------------------------------------------

    /// <summary>
    /// Yönetici hesabı yapılandırmadan okunan parola ile oluşturulur.
    ///
    /// Önceki sürümde admin yetkisi "e-posta admin@cevik.com mu?" kontrolüyle
    /// veriliyordu; bu, o adresle kayıt olan herkesi yönetici yapan bir arka kapıydı.
    /// Artık rol veritabanındaki alandan gelir ve bu hesap tek seferlik seed edilir.
    /// </summary>
    private async Task YoneticiHesabiOlusturAsync()
    {
        var eposta = (_yapilandirma["Yonetici:Eposta"] ?? "admin@cevik.local").ToLowerInvariant();
        var parola = _yapilandirma["Yonetici:Parola"];

        if (string.IsNullOrWhiteSpace(parola))
        {
            _logger.LogWarning(
                "Yonetici:Parola yapılandırılmamış — yönetici hesabı oluşturulmadı. " +
                "Admin uçlarını kullanmak için bu ayarı girin.");
            return;
        }

        if (await _context.Kullanicilar.AnyAsync(k => k.Eposta == eposta))
            return;

        var hesap = new Kullanici
        {
            Ad = "Sistem",
            Soyad = "Yöneticisi",
            Eposta = eposta,
            SifreHash = new PasswordHasher<Kullanici>().HashPassword(null!, parola),
            Rol = KullaniciRolu.Admin,
            EpostaDogrulandiMi = true
        };

        _context.Kullanicilar.Add(hesap);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Yönetici hesabı oluşturuldu: {Eposta}", eposta);
    }

    /// <summary>
    /// Başlangıç döviz kurları. Gerçekte TCMB'den günlük çeken bir arka plan
    /// servisi besleyecek (PLANLAMA.md 5.3); şimdilik sabit bir başlangıç
    /// satırı yazıyoruz ki sipariş tutarları 1:1 kurla hesaplanmasın.
    /// </summary>
    private async Task DovizKurlariniEkleAsync()
    {
        if (await _context.DovizKurlari.AnyAsync()) return;

        var bugun = DateTime.UtcNow.Date;

        _context.DovizKurlari.AddRange(
            new DovizKuru { Tarih = bugun, ParaBirimi = "USD", Alis = 41.20m, Satis = 41.45m },
            new DovizKuru { Tarih = bugun, ParaBirimi = "EUR", Alis = 48.10m, Satis = 48.40m });

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Public CMS uçlarının test edilebilmesi için yayınlanmış ve taslak içerik.
    /// Katalog dolu olsa bile bir kez çalışır.
    /// </summary>
    private async Task OrnekIcerikEkleAsync()
    {
        if (await _context.BlogYazilari.AnyAsync()) return;

        var simdi = DateTimeOffset.UtcNow;

        _context.BlogYazilari.AddRange(
            new BlogYazisi
            {
                Baslik = "RoHS uyumluluğu rehberi",
                Slug = "rohs-uyumlulugu-rehberi",
                Ozet = "Elektronik komponentlerde RoHS belgesinin anlamı.",
                IcerikHtml = "<p>RoHS, belirli zararlı maddelerin kullanımını kısıtlar.</p>",
                Kategori = "Rehber",
                YayinTarihi = simdi.AddDays(-3)
            },
            new BlogYazisi
            {
                Baslik = "Taslak yazı",
                Slug = "taslak-yazi",
                Ozet = "Henüz yayınlanmamış içerik.",
                IcerikHtml = "<p>Bu yazı public uçta görünmemeli.</p>",
                Kategori = "Taslak",
                YayinTarihi = null
            });

        _context.Duyurular.AddRange(
            new Duyuru
            {
                Baslik = "Kargo kampanyası",
                Icerik = "Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir.",
                Sira = 1,
                BaslangicTarihi = simdi.AddDays(-1),
                BitisTarihi = simdi.AddDays(30)
            },
            new Duyuru
            {
                Baslik = "Süresi dolmuş duyuru",
                Icerik = "Bu duyuru public listede olmamalı.",
                Sira = 99,
                BaslangicTarihi = simdi.AddDays(-30),
                BitisTarihi = simdi.AddDays(-1)
            });

        _context.Bannerlar.AddRange(
            new Banner
            {
                Konum = "anasayfa-ust",
                GorselUrl = "/gorseller/banner/anasayfa.svg",
                LinkUrl = "/kampanyalar",
                Sira = 1,
                Aktif = true
            },
            new Banner
            {
                Konum = "anasayfa-ust",
                GorselUrl = "/gorseller/banner/pasif.svg",
                Sira = 2,
                Aktif = false
            });

        _context.Sayfalar.AddRange(
            new Sayfa
            {
                Slug = "hakkimizda",
                BaslikTr = "Hakkımızda",
                BaslikEn = "About Us",
                IcerikHtmlTr = "<p>ÇEVİK Elektronik komponent tedarikçisidir.</p>",
                IcerikHtmlEn = "<p>CEVIK Electronics is a component distributor.</p>",
                SeoBaslik = "Hakkımızda | ÇEVİK",
                YayindaMi = true
            },
            new Sayfa
            {
                Slug = "taslak-sayfa",
                BaslikTr = "Taslak",
                BaslikEn = "Draft",
                IcerikHtmlTr = "<p>Yayında değil.</p>",
                IcerikHtmlEn = "<p>Not published.</p>",
                YayindaMi = false
            });

        _context.SikSorulanSorular.AddRange(
            new SikSorulanSoru
            {
                Soru = "Kargo ücreti nasıl hesaplanır?",
                Cevap = "Belirlenen eşiğin altındaki siparişlere sabit kargo ücreti eklenir.",
                Sira = 1
            },
            new SikSorulanSoru
            {
                Soru = "Fiyatlar hangi para birimindedir?",
                Cevap = "Katalog fiyatları USD'dir; TRY ve EUR dönüşümü güncel kura göredir.",
                Sira = 2
            });

        await _context.SaveChangesAsync();
    }

    // -----------------------------------------------------------------------
    // Katalog
    // -----------------------------------------------------------------------

    private async Task<Dictionary<string, OzellikTanimi>> OzellikTanimlariniEkleAsync()
    {
        var tanimlar = KatalogSablonlari.Ozellikler.Select(o => new OzellikTanimi
        {
            Kod = o.Kod,
            AdTr = o.AdTr,
            AdEn = o.AdEn,
            VeriTipi = o.VeriTipi,
            Birim = o.Birim,
            GosterimTipi = o.GosterimTipi,
            FiltrelenebilirMi = true,
            SiralanabilirMi = o.VeriTipi == OzellikVeriTipi.Sayi
        }).ToList();

        _context.OzellikTanimlari.AddRange(tanimlar);
        await _context.SaveChangesAsync();

        return tanimlar.ToDictionary(t => t.Kod);
    }

    private async Task<(List<(Kategori Kategori, KatalogSablonlari.KategoriSablonu Sablon)> Yapraklar,
                       Dictionary<int, string[]> KategoriOzellikleri)>
        KategorileriEkleAsync(Dictionary<string, OzellikTanimi> ozellikler)
    {
        var yapraklar = new List<(Kategori, KatalogSablonlari.KategoriSablonu)>();
        var kategoriOzellikleri = new Dictionary<int, string[]>();
        var kokSira = 1;

        foreach (var kokSablon in KatalogSablonlari.Agac)
        {
            var kok = new Kategori
            {
                AdTr = kokSablon.AdTr,
                AdEn = kokSablon.AdEn,
                SlugTr = kokSablon.Slug,
                SlugEn = kokSablon.Slug,
                Yol = "0", // Id atandıktan sonra düzeltilir
                Seviye = 0,
                Sira = kokSira++,
                YaprakMi = false,
                SeoBaslik = $"{kokSablon.AdTr} | ÇEVİK Elektronik",
                SeoAciklama = $"{kokSablon.AdTr} kategorisindeki tüm ürünler, güncel stok ve kademeli fiyatlarla."
            };

            _context.Kategoriler.Add(kok);
            await _context.SaveChangesAsync();

            // ltree yolu id tabanlıdır: "1", "1.5", "1.5.12"
            kok.Yol = kok.Id.ToString();
            await _context.SaveChangesAsync();

            var altSira = 1;
            foreach (var altSablon in kokSablon.Altlar)
            {
                var alt = new Kategori
                {
                    UstKategoriId = kok.Id,
                    AdTr = altSablon.AdTr,
                    AdEn = altSablon.AdEn,
                    SlugTr = altSablon.Slug,
                    SlugEn = altSablon.Slug,
                    Yol = "0",
                    Seviye = 1,
                    Sira = altSira++,
                    YaprakMi = true,
                    SeoBaslik = $"{altSablon.AdTr} | ÇEVİK Elektronik",
                    SeoAciklama = $"{altSablon.AdTr} ürünlerini parametrik filtrelerle arayın.",
                    SeoIcerikHtml = $"<p>{altSablon.AdTr} kategorisinde " +
                                    $"{string.Join(", ", altSablon.Ureticiler.Select(u => u.Ad))} gibi üreticilerin ürünlerini " +
                                    "teknik parametrelerine göre filtreleyerek bulabilirsiniz.</p>"
                };

                _context.Kategoriler.Add(alt);
                await _context.SaveChangesAsync();

                alt.Yol = $"{kok.Id}.{alt.Id}";
                await _context.SaveChangesAsync();

                // Kategoriye ait filtre tanımları — facet paneli doğrudan buradan üretilir.
                var sira = 1;
                foreach (var ozellikKodu in altSablon.OzellikKodlari)
                {
                    if (!ozellikler.TryGetValue(ozellikKodu, out var tanim)) continue;

                    _context.KategoriOzellikleri.Add(new KategoriOzelligi
                    {
                        KategoriId = alt.Id,
                        OzellikTanimId = tanim.Id,
                        Sira = sira++,
                        ZorunluMu = sira <= 3
                    });
                }

                await _context.SaveChangesAsync();

                yapraklar.Add((alt, altSablon));
                kategoriOzellikleri[alt.Id] = altSablon.OzellikKodlari;
            }
        }

        return (yapraklar, kategoriOzellikleri);
    }

    private async Task<Dictionary<string, Uretici>> UreticileriEkleAsync()
    {
        // Üreticiler şablonlardaki gerçek marka adlarından toplanır; böylece
        // "Üretici" facet'i anlamlı olur. Aynı marka birden çok kategoride
        // geçtiği için ada göre tekilleştiriyoruz.
        var adlar = KatalogSablonlari.Agac
            .SelectMany(k => k.Altlar)
            .SelectMany(a => a.Ureticiler)
            .Select(u => u.Ad)
            .Distinct()
            .OrderBy(a => a)
            .ToList();

        var rastgele = new Randomizer(TohumDegeri);

        var ureticiler = adlar.Select(ad => new Uretici
        {
            Ad = ad,
            Slug = SlugUret(ad),
            WebSitesi = $"https://www.{SlugUret(ad)}.com",
            YetkiliDistributorMu = rastgele.Bool(0.4f),
            Aktif = true
        }).ToList();

        _context.Ureticiler.AddRange(ureticiler);
        await _context.SaveChangesAsync();

        return ureticiler.ToDictionary(u => u.Ad);
    }

    private async Task UrunleriUretAsync(
        List<(Kategori Kategori, KatalogSablonlari.KategoriSablonu Sablon)> yapraklar,
        Dictionary<int, string[]> kategoriOzellikleri,
        Dictionary<string, Uretici> ureticiler,
        Dictionary<string, OzellikTanimi> ozellikler)
    {
        // Tek Faker örneği + sabit tohum: deterministik ve hızlı.
        // Önceki sürüm döngü içinde 5000 kez new Faker() yapıyordu.
        var f = new Faker("tr") { Random = new Randomizer(TohumDegeri) };
        var ozellikSozlugu = KatalogSablonlari.Ozellikler.ToDictionary(o => o.Kod);

        var kullanilanKodlar = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var urunBasinaKategori = UrunSayisi / yapraklar.Count;

        var toplam = 0;

        foreach (var (kategori, sablon) in yapraklar)
        {
            // Üretici ile kod ön eki BİRLİKTE seçilir: STM32F… kodlu parçanın
            // üreticisi STMicroelectronics olmalı. Önceki sürüm ön eki kategoriden,
            // üreticiyi ayrı rastgele seçtiği için "Texas Instruments üretimi
            // STM32F766" gibi tutarsız kayıtlar oluşuyordu.
            var kategoriUreticileri = sablon.Ureticiler
                .Where(u => ureticiler.ContainsKey(u.Ad))
                .Select(u => (Varlik: ureticiler[u.Ad], u.KodOnEki))
                .ToList();

            for (var i = 0; i < urunBasinaKategori; i++)
            {
                var secim = f.PickRandom(kategoriUreticileri);
                var uretici = secim.Varlik;

                // Bu ürünün parametre değerlerini önce seç: ürün açıklaması
                // ve kodu bunlardan türetilir (gerçek kataloglarda da öyledir).
                var secilenOzellikler = new Dictionary<string, string>();
                foreach (var kod in sablon.OzellikKodlari)
                {
                    if (!ozellikSozlugu.TryGetValue(kod, out var sablonOzellik)) continue;
                    // Her ürün her parametreye sahip olmasın — gerçek katalog da eksiktir.
                    if (f.Random.Bool(0.12f)) continue;

                    secilenOzellikler[kod] = f.PickRandom(sablonOzellik.Degerler);
                }

                var mpn = BenzersizKodUret(f, secim.KodOnEki, kullanilanKodlar);

                var urun = new Urun
                {
                    KategoriId = kategori.Id,
                    UreticiId = uretici.Id,
                    UreticiUrunKodu = mpn,
                    NormalizeKod = UrunKoduNormalizeleyici.Normalize(mpn),
                    KisaAciklama = AciklamaUret(sablon, secilenOzellikler, ozellikSozlugu),
                    // TrimEnd ile Türkçe çoğul eki kırpma denemesi "LED'ler" -> "LED'"
                    // gibi bozuk çıktılar veriyordu; kategori adını olduğu gibi kullanıyoruz.
                    DetayliAciklamaTr = f.Random.Bool(0.7f)
                        ? $"{uretici.Ad} üretimi, {sablon.AdTr} kategorisinde yer alan komponent. " +
                          "Endüstriyel uygulamalarda yaygın olarak kullanılır. RoHS uyumludur."
                        : null,
                    DetayliAciklamaEn = f.Random.Bool(0.7f)
                        ? $"{uretici.Ad} component in the {sablon.AdEn} category. " +
                          "Widely used in industrial applications. RoHS compliant."
                        : null,
                    AnaGorselUrl = $"/gorseller/komponent/{sablon.Slug}.svg",
                    GorselTemsiliMi = true, // Sentetik katalog: tüm görseller temsilidir
                    RohsDurumu = f.Random.WeightedRandom(
                        [RohsDurumu.Belgeli, RohsDurumu.Belgesiz, RohsDurumu.Bilinmiyor],
                        [0.85f, 0.10f, 0.05f]),
                    UrunDurumu = f.Random.WeightedRandom(
                        [UrunDurumu.Aktif, UrunDurumu.YeniTasarimaOnerilmez, UrunDurumu.OmruSonu, UrunDurumu.KullanimdanKalkti],
                        [0.82f, 0.09f, 0.06f, 0.03f]),
                    MontajTipi = f.Random.WeightedRandom([MontajTipi.Smt, MontajTipi.Tht], [0.8f, 0.2f]),
                    KampanyaliMi = f.Random.Bool(0.08f),
                    GoruntulenmeSayisi = f.Random.Int(0, 12000),
                    UreticiTeslimSuresiHaftaMin = (short)f.Random.Int(1, 6),
                    Aktif = true
                };
                urun.UreticiTeslimSuresiHaftaMax = (short)(urun.UreticiTeslimSuresiHaftaMin + f.Random.Int(1, 6));

                // JSONB okuma kopyası — anahtar olarak KOD kullanılır.
                // Önceki sürüm görünen adı (AdTr) anahtar yapıyordu; filtre API'si
                // kodla çalıştığı için iki taraf birbirini tutmuyordu.
                urun.OzelliklerJson = JsonSerializer.Serialize(secilenOzellikler);

                _context.Urunler.Add(urun);

                // EAV tarafı — filtreleme ve facet sayaçları buradan çalışır.
                foreach (var (kod, deger) in secilenOzellikler)
                {
                    if (!ozellikler.TryGetValue(kod, out var tanim)) continue;

                    _context.UrunOzellikDegerleri.Add(new UrunOzellikDegeri
                    {
                        Urun = urun,
                        OzellikTanimId = tanim.Id,
                        DegerMetin = deger,
                        DegerSayi = SayiyaCevir(deger),
                        HamDeger = deger
                    });
                }

                AmbalajVeFiyatEkle(f, urun);
                DokumanEkle(f, urun);

                toplam++;
                if (toplam % 500 == 0)
                {
                    await _context.SaveChangesAsync();
                    _context.ChangeTracker.Clear();
                    _logger.LogInformation("{Toplam} ürün üretildi...", toplam);
                }
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Toplam {Toplam} ürün üretildi.", toplam);
    }

    /// <summary>
    /// Ürüne 1-3 ambalaj varyantı ve her birine kademeli fiyat ekler.
    ///
    /// Önceki sürüm ürün başına TEK ambalaj üretiyordu; oysa "aynı ürünün
    /// Tape&amp;Reel / Tube / Tray varyantları farklı MOQ ve fiyata sahiptir"
    /// bu projenin ayırt edici özelliklerinden biri (PLANLAMA.md 5.3).
    /// </summary>
    private void AmbalajVeFiyatEkle(Faker f, Urun urun)
    {
        var ambalajSayisi = f.Random.WeightedRandom([1, 2, 3], [0.35f, 0.45f, 0.20f]);
        var secilenler = f.Random.ListItems(KatalogSablonlari.AmbalajSecenekleri.ToList(), ambalajSayisi);

        // Taban birim fiyat: pasif komponentler kuruşun altında olabilir,
        // bu yüzden numeric(18,6) kullanıyoruz (PLANLAMA.md 5.3 uyarısı).
        var tabanFiyat = Math.Round(f.Random.Decimal(0.008m, 145m), 6);

        var ilkMi = true;
        foreach (var secim in secilenler)
        {
            var stokVar = f.Random.Bool(0.72f);

            var ambalaj = new UrunAmbalaji
            {
                Urun = urun,
                AmbalajTipi = secim.Tip,
                Ad = secim.Ad,
                Mpq = secim.Mpq,
                Moq = secim.Moq,
                KatlamaMiktari = secim.Katlama,
                // Stok ADET cinsinden gerçekçi bir aralıktan üretilir, sonra
                // katlama miktarının üstüne yuvarlanır. Önceden "1..40 × katlama"
                // yazıyordu; Cut Tape (katlama=1) ambalajlarına en fazla 40 adet
                // stok düşüyor ve bu ambalajlar pratikte satın alınamıyordu.
                StokMiktari = stokVar
                    ? SiparisMiktarKurali.YukariYuvarla(f.Random.Int(250, 40_000), secim.Katlama)
                    : 0,
                GelecekStokMiktari = f.Random.Bool(0.25f)
                    ? SiparisMiktarKurali.YukariYuvarla(f.Random.Int(500, 20_000), secim.Katlama)
                    : 0,
                VarsayilanMi = ilkMi
            };

            if (ambalaj.GelecekStokMiktari > 0)
                ambalaj.GelecekStokTarihi = DateTime.UtcNow.Date.AddDays(f.Random.Int(14, 120));

            // Büyük ambalajda birim fiyat düşer.
            var ambalajCarpani = secim.Tip switch
            {
                AmbalajTipi.TapeReel => 0.88m,
                AmbalajTipi.OzelReel => 0.93m,
                AmbalajTipi.CutTape => 1.15m,
                _ => 1.00m
            };

            var birim = Math.Round(tabanFiyat * ambalajCarpani, 6);

            ambalaj.FiyatKademeleri =
            [
                new FiyatKademesi { UrunAmbalaji = ambalaj, MinMiktar = 1,    MaxMiktar = 49,   BirimFiyat = birim,                        ParaBirimi = "USD" },
                new FiyatKademesi { UrunAmbalaji = ambalaj, MinMiktar = 50,   MaxMiktar = 249,  BirimFiyat = Math.Round(birim * 0.90m, 6), ParaBirimi = "USD" },
                new FiyatKademesi { UrunAmbalaji = ambalaj, MinMiktar = 250,  MaxMiktar = 999,  BirimFiyat = Math.Round(birim * 0.82m, 6), ParaBirimi = "USD" },
                new FiyatKademesi { UrunAmbalaji = ambalaj, MinMiktar = 1000, MaxMiktar = null, BirimFiyat = Math.Round(birim * 0.71m, 6), ParaBirimi = "USD" }
            ];

            _context.UrunAmbalajlari.Add(ambalaj);
            _context.FiyatKademeleri.AddRange(ambalaj.FiyatKademeleri);

            ilkMi = false;
        }
    }

    private void DokumanEkle(Faker f, Urun urun)
    {
        if (!f.Random.Bool(0.75f)) return;

        _context.UrunDokumanlari.Add(new UrunDokumani
        {
            Urun = urun,
            Tip = DokumanTipi.Datasheet,
            Baslik = $"{urun.UreticiUrunKodu} Datasheet",
            Url = $"/belgeler/{urun.NormalizeKod}.pdf",
            Dil = "en",
            DosyaBoyutuKb = f.Random.Int(180, 4200)
        });
    }

    // -----------------------------------------------------------------------
    // Yardımcılar
    // -----------------------------------------------------------------------

    /// <summary>
    /// "STM32F103C8T6" desenine benzer, kategori içinde benzersiz üretici ürün kodu.
    /// Benzersizlik şart: (uretici_id, uretici_urun_kodu) üzerinde UNIQUE index var.
    /// </summary>
    private static string BenzersizKodUret(Faker f, string onEk, HashSet<string> kullanilanlar)
    {
        const string harfler = "ABCDEFGHJKLMNPRSTUVWXYZ";

        for (var deneme = 0; deneme < 40; deneme++)
        {
            var kod = onEk
                    + f.Random.Int(100, 999)
                    + f.Random.Char(harfler[0], harfler[^1])
                    + f.Random.Int(1, 9)
                    + f.PickRandom("T", "K", "N", "R", "");

            if (kullanilanlar.Add(kod)) return kod;
        }

        // Son çare: sayaç ekleyerek garanti benzersiz yap.
        var yedek = $"{onEk}{f.Random.Int(1000, 9999)}-{kullanilanlar.Count}";
        kullanilanlar.Add(yedek);
        return yedek;
    }

    /// <summary>
    /// "IC-32F103C MCU 32BIT 64KB FLASH 48LQFP" tarzı teknik, kısaltmalı açıklama.
    ///
    /// Değerler ADIYLA seçilir (kategori şablonundaki AciklamaOzellikKodlari sırasına
    /// göre) ve birimi de yazılır. Önceki sürüm sözlükteki ilk üç değeri sabit bir
    /// kalıba yerleştiriyordu; bu yüzden "FLASH 8" yazıp aslında frekansı basmak
    /// gibi yanlış etiketli açıklamalar üretiyordu.
    /// </summary>
    private static string AciklamaUret(
        KatalogSablonlari.KategoriSablonu sablon,
        Dictionary<string, string> ozellikler,
        Dictionary<string, KatalogSablonlari.OzellikSablonu> ozellikSozlugu)
    {
        var parcalar = new List<string> { sablon.AciklamaOnEki };

        foreach (var kod in sablon.AciklamaOzellikKodlari)
        {
            if (!ozellikler.TryGetValue(kod, out var deger)) continue;

            // Sayısal parametrelerde birim değerin içinde değildir; ekliyoruz.
            var birim = ozellikSozlugu.TryGetValue(kod, out var tanim) ? tanim.Birim : null;
            var yazim = birim is not null && !deger.Contains(birim, StringComparison.OrdinalIgnoreCase)
                ? $"{deger}{birim}"
                : deger;

            parcalar.Add(yazim);
        }

        // Yalnızca tip ön eki büyük harfe çevrilir. Tüm metni büyütmek
        // "0.22 µF" birimini "0.22 ΜF" (Yunanca büyük Mu) yapıyor ve
        // "10 kΩ" gibi birimlerin okunuşunu bozuyordu.
        parcalar[0] = parcalar[0].ToUpperInvariant();
        return string.Join(" ", parcalar);
    }

    /// <summary>
    /// "72", "10 kΩ", "±5%", "2.0 - 3.6 V" gibi metinlerden sayısal değeri çıkarır.
    /// Sayısal aralık filtresi ve sıralama bu kolona bağlıdır; çıkarılamayan
    /// değerlerde null döner ve yalnızca metin filtresi çalışır.
    /// </summary>
    private static decimal? SayiyaCevir(string deger)
    {
        var temiz = new string(deger
            .TakeWhile(c => char.IsDigit(c) || c == '.' || c == ',' || c == '-' || c == '±' || c == ' ')
            .Where(c => char.IsDigit(c) || c == '.')
            .ToArray());

        return decimal.TryParse(temiz, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out var sonuc)
            ? sonuc
            : null;
    }

    private static string SlugUret(string metin)
    {
        var kucuk = metin.ToLowerInvariant()
            .Replace("ç", "c").Replace("ğ", "g").Replace("ı", "i")
            .Replace("ö", "o").Replace("ş", "s").Replace("ü", "u")
            .Replace("&", "ve");

        var sonuc = new string(kucuk.Select(c => char.IsLetterOrDigit(c) ? c : '-').ToArray());

        while (sonuc.Contains("--")) sonuc = sonuc.Replace("--", "-");
        return sonuc.Trim('-');
    }
}
