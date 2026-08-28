using System.Text.Json;
using Bogus;
using Cevik.Alan.Icerik;
using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Katalog;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using Cevik.Altyapi.Veritabani.Seed.Katalog;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Cevik.Altyapi.Veritabani.Seed;

/// <summary>
/// Katalog seed'i.
///
/// Ürün verisi, Özdisan ürün listelerinden açıkça oluşturulan sürümlenmiş yerel anlık
/// görüntüden gelir. Canlı site uygulama çalışırken taranmaz; aynı 12.000 gerçek MPN,
/// görsel, veri sayfası, stok ve fiyat bilgisi her kurulumda deterministik yüklenir.
/// </summary>
public class CevikDataSeeder
{
    private const int TohumDegeri = 20260820; // Deterministik: her kurulumda aynı katalog

    private readonly CevikDbContext _context;
    private readonly ILogger<CevikDataSeeder> _logger;
    private readonly IConfiguration _yapilandirma;
    private readonly OzdisanKatalogEsitleyici _ozdisanKatalogEsitleyici;

    public CevikDataSeeder(
        CevikDbContext context,
        ILogger<CevikDataSeeder> logger,
        IConfiguration yapilandirma,
        OzdisanKatalogEsitleyici ozdisanKatalogEsitleyici)
    {
        _context = context;
        _logger = logger;
        _yapilandirma = yapilandirma;
        _ozdisanKatalogEsitleyici = ozdisanKatalogEsitleyici;
    }

    public async Task SeedAsync()
    {
        await YoneticiHesabiOlusturAsync();
        await DovizKurlariniEkleAsync();
        await OrnekIcerikEkleAsync();

        if (!await _context.Kategoriler.AnyAsync())
        {
            var ozellikler = await OzellikTanimlariniEkleAsync();
            var kategoriler = await KategorileriEkleAsync(ozellikler);

            // Şablon katalogu Özdisan anlık görüntüsünün YERİNE değil, YANINDA
            // durur. Yalnızca bu yol UrunOzellikDegerleri (EAV) satırlarını ve
            // aynı ürünün birden fazla ambalaj varyantını üretiyor; parametrik
            // filtre paneli ile ambalaj karşılaştırması bu verilere dayanıyor.
            //
            // Bir ara bu iki çağrı devre dışı bırakılmış, metotlar kodda öksüz
            // kalmıştı (derleyici uyarı vermez). Sonuç: urun_ozellik_degerleri
            // tablosu boş kaldı, filtre paneli tüm katalogda sessizce çalışmaz
            // hale geldi ve hiçbir ürünün ikinci ambalajı kalmadı.
            var ureticiler = await UreticileriEkleAsync();
            await UrunleriUretAsync(kategoriler, ureticiler, ozellikler);
        }

        await _ozdisanKatalogEsitleyici.EsitleAsync();

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
        var simdi = DateTimeOffset.UtcNow;

        // Her içerik kümesini bağımsız ekle. Blog tablosunun dolu olması SSS,
        // sayfa veya banner tablolarının da dolu olduğu anlamına gelmez. Önceki
        // toplu erken çıkış bu tablolardan biri eksikken seed'i tamamen atlıyor,
        // /api/icerik/sss ucunun kalıcı olarak boş dönmesine neden oluyordu.
        if (!await _context.BlogYazilari.AnyAsync())
        {
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
        }

        if (!await _context.Duyurular.AnyAsync())
        {
            _context.Duyurular.AddRange(
                new Duyuru
                {
                    Baslik = "Çevik Elektronik kampanyası",
                    Icerik = "Güncel kampanyalarımızı keşfedin.",
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
        }

        // Banner seed'i kaldırıldı: ürettiği iki kayıt da kırıktı — GorselUrl
        // olmayan bir dosyayı (public/gorseller/ dizini hiç yok), LinkUrl ise
        // olmayan bir /kampanyalar rotasını gösteriyordu. Vitrinde de banner
        // basan bir bileşen yok. Gerçek banner ihtiyacı doğduğunda görsel ve
        // hedef sayfa hazırken eklenmeli.

        if (!await _context.Sayfalar.AnyAsync())
        {
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
        }

        if (!await _context.SikSorulanSorular.AnyAsync(s => s.KategoriId == null))
        {
            _context.SikSorulanSorular.AddRange(
                new SikSorulanSoru
                {
                    Soru = "Fiyat ve stok bilgisi nasıl talep edilir?",
                    Cevap = "Ürün sayfasından ilgili ambalajın güncel stok ve fiyat bilgilerini inceleyebilir, toplu alımlar için Teklif İste sayfasından resmi teklif oluşturabilirsiniz.",
                    Sira = 1
                },
                new SikSorulanSoru
                {
                    Soru = "Minimum sipariş miktarı (MOQ) nedir?",
                    Cevap = "MOQ, seçtiğiniz ambalaj için verilebilecek en düşük sipariş miktarıdır. Ürün ve ambalaja göre değişir; sepet miktarı MPQ ve katlama kuralına uygun olmalıdır.",
                    Sira = 2
                },
                new SikSorulanSoru
                {
                    Soru = "BOM listesini nasıl gönderebilirim?",
                    Cevap = "BOM aracına parça numarası ve miktar içeren listenizi yapıştırabilir veya dosya olarak yükleyebilirsiniz. Eşleşen ürünleri kontrol ettikten sonra teklif sürecine aktarabilirsiniz.",
                    Sira = 3
                },
                new SikSorulanSoru
                {
                    Soru = "Toplu alım ve proje fiyatı alabilir miyim?",
                    Cevap = "Evet. Teklif İste sayfasında ürünleri, miktarları ve varsa proje notunuzu paylaşarak satış ekibinden kurumsal teklif talep edebilirsiniz.",
                    Sira = 4
                },
                new SikSorulanSoru
                {
                    Soru = "Siparişimi nereden takip edebilirim?",
                    Cevap = "Hesabınıza giriş yaptıktan sonra Profil > Siparişlerim bölümünden sipariş durumunu ve sipariş satırlarını görüntüleyebilirsiniz.",
                    Sira = 5
                },
                new SikSorulanSoru
                {
                    Soru = "Kurumsal hesap nasıl açılır?",
                    Cevap = "Kurumsal kayıt formunda firma ve yetkili bilgilerinizi iletebilirsiniz. Başvurunuz onaylandıktan sonra kurumsal satın alma özellikleri hesabınıza açılır.",
                    Sira = 6
                },
                new SikSorulanSoru
                {
                    Soru = "Ürün belgelerine ve teknik verilere nasıl ulaşırım?",
                    Cevap = "Ürün detay sayfasındaki teknik dokümanlar bölümünden mevcut veri sayfası ve diğer ürün belgelerine ulaşabilirsiniz.",
                    Sira = 7
                },
                new SikSorulanSoru
                {
                    Soru = "Muadil ürün seçimi için destek veriyor musunuz?",
                    Cevap = "Evet. Ürün sayfasındaki muadil ve parametrik ürünleri inceleyebilir, kritik teknik gereksinimleriniz için iletişim sayfasından FAE desteğine ulaşabilirsiniz.",
                    Sira = 8
                },
                new SikSorulanSoru
                {
                    Soru = "Teslimat süresi nasıl belirlenir?",
                    Cevap = "Teslimat süresi ürünün mevcut ve gelecek stok durumuna, sipariş miktarına ve seçilen teslimat yöntemine göre belirlenir. Kesin planlama sipariş veya teklif aşamasında paylaşılır.",
                    Sira = 9
                },
                new SikSorulanSoru
                {
                    Soru = "Kart bilgilerim sisteminizde saklanıyor mu?",
                    Cevap = "Hayır. Kart bilgileri doğrudan ödeme sağlayıcısının güvenli altyapısına iletilir; Çevik Elektronik API'si kart numarası, son kullanma tarihi veya güvenlik kodunu almaz ve saklamaz.",
                    Sira = 10
                });
        }

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

    /// <summary>
    /// Kategori ağacını kurar ve her yaprak için filtre panelinin parametre listesini yazar.
    /// Dönüş, parçaların <c>KategoriSlug</c> alanıyla eşleşen slug tabanlı sözlüktür.
    /// </summary>
    private async Task<Dictionary<string, (Kategori Kategori, KatalogSablonlari.KategoriSablonu Sablon)>>
        KategorileriEkleAsync(Dictionary<string, OzellikTanimi> ozellikler)
    {
        var yapraklar = new Dictionary<string, (Kategori, KatalogSablonlari.KategoriSablonu)>(StringComparer.Ordinal);
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
                    SeoIcerikHtml =
                        $"<p>{altSablon.AdTr} kategorisindeki ürünleri " +
                        string.Join(", ", altSablon.OzellikKodlari
                            .Where(ozellikler.ContainsKey)
                            .Take(4)
                            .Select(k => ozellikler[k].AdTr)) +
                        " gibi teknik parametrelere göre filtreleyerek bulabilirsiniz.</p>"
                };

                _context.Kategoriler.Add(alt);
                await _context.SaveChangesAsync();

                alt.Yol = $"{kok.Id}.{alt.Id}";
                await _context.SaveChangesAsync();

                // Kategoriye ait filtre tanımları — facet paneli doğrudan buradan üretilir.
                var sira = 1;
                foreach (var ozellikKodu in altSablon.OzellikKodlari)
                {
                    if (!ozellikler.TryGetValue(ozellikKodu, out var tanim))
                        throw new InvalidOperationException(
                            $"'{altSablon.Slug}' kategorisi tanımsız '{ozellikKodu}' parametresine referans veriyor.");

                    _context.KategoriOzellikleri.Add(new KategoriOzelligi
                    {
                        KategoriId = alt.Id,
                        OzellikTanimId = tanim.Id,
                        Sira = sira++,
                        ZorunluMu = sira <= 3
                    });
                }

                await _context.SaveChangesAsync();

                yapraklar[altSablon.Slug] = (alt, altSablon);
            }
        }

        _logger.LogInformation("{Kok} ana kategori, {Yaprak} alt kategori eklendi.",
            KatalogSablonlari.Agac.Length, yapraklar.Count);

        return yapraklar;
    }

    /// <summary>
    /// Üreticiler <see cref="UreticiKatalogu"/>'ndan gelir: gerçek marka adı, web adresi
    /// ve ülke. Yetkili distribütörlük rozeti sabittir — önceki sürümde rastgele
    /// atanıyordu ve her kurulumda farklı markalara "yetkili distribütör" yazıyordu.
    /// </summary>
    private async Task<Dictionary<string, Uretici>> UreticileriEkleAsync()
    {
        var ureticiler = UreticiKatalogu.Hepsi.Select(u => new Uretici
        {
            Ad = u.Ad,
            Slug = SlugUret(u.Ad),
            WebSitesi = $"https://www.{u.Alan}",
            Aciklama = $"{u.Aciklama} Merkez: {u.Ulke}.",
            YetkiliDistributorMu = u.YetkiliDistributor,
            Aktif = true
        }).ToList();

        _context.Ureticiler.AddRange(ureticiler);
        await _context.SaveChangesAsync();

        _logger.LogInformation("{Sayi} üretici eklendi.", ureticiler.Count);

        return ureticiler.ToDictionary(u => u.Ad, StringComparer.Ordinal);
    }

    /// <summary>
    /// Parça katalogundaki her MPN için bir <see cref="Urun"/> satırı yazar.
    ///
    /// Teknik alanlar parçadan olduğu gibi kopyalanır; yalnızca ticari alanlar
    /// (fiyat, stok, teslim süresi, görüntülenme) sabit tohumlu rastgeleyle üretilir.
    /// </summary>
    private async Task UrunleriUretAsync(
        Dictionary<string, (Kategori Kategori, KatalogSablonlari.KategoriSablonu Sablon)> kategoriler,
        Dictionary<string, Uretici> ureticiler,
        Dictionary<string, OzellikTanimi> ozellikler)
    {
        // Tek Faker örneği + sabit tohum: deterministik ve hızlı.
        var f = new Faker("tr") { Random = new Randomizer(TohumDegeri) };
        var toplam = 0;

        foreach (var parca in ParcaKatalogu.Tumu)
        {
            var (kategori, sablon) = kategoriler[parca.KategoriSlug];
            var uretici = ureticiler[parca.UreticiAd];

            var urun = new Urun
            {
                KategoriId = kategori.Id,
                UreticiId = uretici.Id,
                UreticiUrunKodu = parca.Mpn,
                NormalizeKod = UrunKoduNormalizeleyici.Normalize(parca.Mpn),
                KisaAciklama = parca.Aciklama,
                DetayliAciklamaTr =
                    $"{uretici.Ad} üretimi {parca.Mpn}. {sablon.AdTr} kategorisinde yer alır. " +
                    "Teknik parametreleri üreticinin veri sayfasıyla uyumludur, RoHS uyumludur.",
                DetayliAciklamaEn =
                    $"{parca.Mpn} manufactured by {uretici.Ad}, listed under {sablon.AdEn}. " +
                    "Parameters follow the manufacturer datasheet. RoHS compliant.",
                // Gerçek dosya sağlanana kadar istemciye 404 üreten bir yol vermeyiz.
                AnaGorselUrl = null,
                GorselTemsiliMi = true,
                RohsDurumu = f.Random.WeightedRandom(
                    [RohsDurumu.Belgeli, RohsDurumu.Belgesiz, RohsDurumu.Bilinmiyor],
                    [0.94f, 0.03f, 0.03f]),
                UrunDurumu = f.Random.WeightedRandom(
                    [UrunDurumu.Aktif, UrunDurumu.YeniTasarimaOnerilmez, UrunDurumu.OmruSonu, UrunDurumu.KullanimdanKalkti],
                    [0.90f, 0.06f, 0.03f, 0.01f]),
                MontajTipi = parca.Montaj,
                KampanyaliMi = f.Random.Bool(0.06f),
                GoruntulenmeSayisi = f.Random.Int(0, 12_000),
                UreticiTeslimSuresiHaftaMin = (short)f.Random.Int(1, 6),
                Aktif = true
            };

            urun.UreticiTeslimSuresiHaftaMax = (short)(urun.UreticiTeslimSuresiHaftaMin + f.Random.Int(1, 6));

            // JSONB okuma kopyası — anahtar olarak parametre KODU kullanılır;
            // filtre API'si de kodla çalışır.
            urun.OzelliklerJson = JsonSerializer.Serialize(
                parca.Ozellikler.ToDictionary(o => o.Kod, o => o.Deger));

            _context.Urunler.Add(urun);

            // EAV tarafı — filtreleme ve facet sayaçları buradan çalışır.
            foreach (var ozellik in parca.Ozellikler)
            {
                var tanim = ozellikler[ozellik.Kod];

                _context.UrunOzellikDegerleri.Add(new UrunOzellikDegeri
                {
                    Urun = urun,
                    OzellikTanimId = tanim.Id,
                    DegerMetin = ozellik.Deger,
                    // Sayısal karşılık yalnızca parametre SAYI tipinde ilan edilmişse yazılır
                    // ve değeri parçanın kendisi verir. İki tuzak birden var:
                    //  - Metin tipli parametrede metinden sayı çıkarmak yanıltıcıdır:
                    //    "1/10 W" -> 1 ve "1 W" -> 1 aynı sayıya düşer, "0603" -> 603 olur.
                    //  - Sayısal parametrede metinden çıkarmak ölçeği kaybettirir:
                    //    "100 nF" ile "100 pF" ikisi de 100 olur.
                    DegerSayi = tanim.VeriTipi == OzellikVeriTipi.Sayi
                        ? ozellik.Sayi ?? SayiyaCevir(ozellik.Deger)
                        : null,
                    HamDeger = ozellik.Deger
                });
            }

            AmbalajVeFiyatEkle(f, urun, sablon);

            toplam++;
            if (toplam % 1000 == 0)
            {
                await _context.SaveChangesAsync();
                _context.ChangeTracker.Clear();
                _logger.LogInformation("{Toplam} ürün yazıldı...", toplam);
            }
        }

        await _context.SaveChangesAsync();
        _context.ChangeTracker.Clear();

        _logger.LogInformation("Toplam {Toplam} ürün yazıldı.", toplam);
    }

    /// <summary>
    /// Ürüne kategorisine uygun ambalaj varyantları ve her birine kademeli fiyat ekler.
    ///
    /// Ambalaj profili kategoriden gelir: çip direnç 5000'lik makarada, DIN ray güç
    /// kaynağı kutuda tek satılır. Fiyat da kategorinin bandından çekilir — önceki
    /// sürüm tüm katalog için tek bir 0.008–145 USD aralığı kullandığından 90 USD'lik
    /// direnç ve 1 sentlik güç kaynağı üretiyordu.
    /// </summary>
    private void AmbalajVeFiyatEkle(Faker f, Urun urun, KatalogSablonlari.KategoriSablonu sablon)
    {
        var secenekler = KatalogSablonlari.AmbalajlarProfilBazli[sablon.Ambalaj];

        var ambalajSayisi = Math.Min(secenekler.Length,
            f.Random.WeightedRandom([1, 2, 3], [0.30f, 0.48f, 0.22f]));

        // İlk seçenek her zaman varsayılan olsun ki "makarasız direnç" gibi bir
        // durum oluşmasın; kalanlar rastgele seçilir.
        var secilenler = new List<KatalogSablonlari.AmbalajSecenegi> { secenekler[0] };
        secilenler.AddRange(f.Random.ListItems(secenekler.Skip(1).ToList(), ambalajSayisi - 1));

        var tabanFiyat = LogAralikFiyat(f, sablon.FiyatMin, sablon.FiyatMax);

        var ilkMi = true;
        foreach (var secim in secilenler)
        {
            var stokVar = f.Random.Bool(0.74f);

            // Stok ADET cinsinden gerçekçi bir aralıktan üretilir, sonra katlama
            // miktarının üstüne yuvarlanır. Pahalı ürünlerde adet doğal olarak azdır.
            var ustSinir = tabanFiyat switch
            {
                < 0.05m => 250_000,
                < 1m => 40_000,
                < 10m => 6_000,
                < 50m => 800,
                _ => 150
            };

            var ambalaj = new UrunAmbalaji
            {
                Urun = urun,
                AmbalajTipi = secim.Tip,
                Ad = secim.Ad,
                Mpq = secim.Mpq,
                Moq = secim.Moq,
                KatlamaMiktari = secim.Katlama,
                StokMiktari = stokVar
                    ? SiparisMiktarKurali.YukariYuvarla(
                        f.Random.Int(Math.Max(secim.Moq, ustSinir / 40), Math.Max(secim.Moq * 2, ustSinir)),
                        secim.Katlama)
                    : 0,
                GelecekStokMiktari = f.Random.Bool(0.22f)
                    ? SiparisMiktarKurali.YukariYuvarla(
                        f.Random.Int(secim.Moq, Math.Max(secim.Moq * 2, ustSinir / 2)), secim.Katlama)
                    : 0,
                VarsayilanMi = ilkMi
            };

            if (ambalaj.GelecekStokMiktari > 0)
                ambalaj.GelecekStokTarihi = DateTime.UtcNow.Date.AddDays(f.Random.Int(14, 120));

            // Büyük ambalajda birim fiyat düşer, kesme bantta artar.
            var ambalajCarpani = secim.Tip switch
            {
                AmbalajTipi.TapeReel => 0.86m,
                AmbalajTipi.OzelReel => 0.92m,
                AmbalajTipi.Tray => 0.95m,
                AmbalajTipi.Tube => 0.97m,
                AmbalajTipi.CutTape => 1.18m,
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

    /// <summary>
    /// Fiyatı bandın logaritmik ölçeğinden çeker. Düz uniform dağılım, 0.0015–0.28 USD
    /// gibi iki buçuk kademelik bir bantta ürünlerin yarısını üst uca yığardı; gerçek
    /// katalogda ucuz parça çok, pahalı parça azdır.
    /// </summary>
    private static decimal LogAralikFiyat(Faker f, decimal min, decimal max)
    {
        var altSinir = Math.Log((double)min);
        var ustSinir = Math.Log((double)max);
        var deger = Math.Exp(altSinir + f.Random.Double() * (ustSinir - altSinir));

        return Math.Round((decimal)deger, 6);
    }

    // -----------------------------------------------------------------------
    // Yardımcılar
    // -----------------------------------------------------------------------

    /// <summary>
    /// "72", "10 kΩ", "±%5", "2.0 - 3.6 V" gibi metinlerden sayısal değeri çıkarır.
    /// Yalnızca parçanın kendi sayısal değeri verilmemişse devreye girer.
    /// </summary>
    private static decimal? SayiyaCevir(string deger)
    {
        var temiz = new string(deger
            .TakeWhile(c => char.IsDigit(c) || c == '.' || c == ',' || c == '-' || c == '±' || c == '%' || c == ' ')
            .Where(c => char.IsDigit(c) || c == '.')
            .ToArray());

        return decimal.TryParse(temiz, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out var sonuc)
            ? sonuc
            : null;
    }

    internal static string SlugUret(string metin)
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
