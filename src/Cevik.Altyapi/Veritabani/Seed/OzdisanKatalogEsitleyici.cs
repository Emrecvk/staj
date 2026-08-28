using System.Text.Json;
using System.Globalization;
using System.Text.RegularExpressions;
using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Katalog;
using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using Cevik.Altyapi.Veritabani.Seed.Katalog;
using Cevik.Uygulama.Ortak;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace Cevik.Altyapi.Veritabani.Seed;

/// <summary>
/// Sürümlenmiş Özdisan anlık görüntüsünü yerel katalogla eşitler.
/// Kaynakta bulunmayan ürün ve üreticiler hard-delete edilmez; sipariş ve sepet
/// bağları korunarak global sorgu filtresinin dışına alınır.
/// </summary>
public sealed class OzdisanKatalogEsitleyici
{
    private const string KaynakSistem = "Ozdisan";

    // Kaynak etiketi mevcut İngilizce adla birebir uyuşmuyorsa yalnızca anlamı
    // açık ve birimsiz biçimde aynı olan etiketler burada tutulur.
    private static readonly IReadOnlyDictionary<string, string> OzellikEtiketTakmaAdlari =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Package / Case"] = "kilif",
            ["Color"] = "renk",
            ["Power Dissipation"] = "guc_derecesi",
            ["Number of Circuits"] = "kanal_sayisi",
            ["Reverse Recovery Time (Trr)"] = "toparlanma_suresi",
            ["Rds On"] = "rds_on",
            ["Fet Type"] = "kanal_tipi",
            ["Voltage (Collector-Emitter)"] = "vce_max",
            ["Current (Ic)"] = "ic_max",
            ["Current (Ic) (25°C)"] = "ic_max",
            ["Current - DC Forward (If) (Max)"] = "ileri_akim",
            ["Forward Current (If)"] = "ileri_akim",
            ["Peak Repetitive Reverse Voltage (VRRM)"] = "ters_voltaj",
            ["Voltage (VRRM)"] = "ters_voltaj",
            // RF antenlerde bant "Frequency Range" adıyla geliyor; tanım
            // "Frequency Band". Takma ad olmadan anten kategorisi filtresiz kalıyor.
            ["Frequency Range"] = "frekans_bandi"
        };

    private readonly CevikDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly ILogger<OzdisanKatalogEsitleyici> _logger;

    public OzdisanKatalogEsitleyici(
        CevikDbContext context,
        IDistributedCache cache,
        ILogger<OzdisanKatalogEsitleyici> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task EsitleAsync(CancellationToken cancellationToken = default)
    {
        var katalog = OzdisanKatalogu.Guncel;

        // Kısa devre YALNIZCA bu kaynağın ürünlerine bakar.
        //
        // Önceki sürüm "başka kaynaktan aktif ürün var mı" ve "üretici sayısı
        // tam mı" diye de soruyordu. Admin panelinden tek bir ürün ya da
        // üretici eklendiğinde bu koşullar bozuluyor, tam senkron çalışıyor ve
        // katalogda karşılığı olmayan her şey — yani admin'in az önce eklediği
        // kayıt — soft-delete ediliyordu. Üstelik tüm stoklar dosyadaki
        // değere geri dönüyordu.
        var guncelUrunSayisi = await _context.Urunler.CountAsync(
            u => u.KaynakSistem == KaynakSistem && u.KaynakKatalogSurumu == katalog.Surum,
            cancellationToken);

        var ozellikTanimlari = await _context.OzellikTanimlari
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        var eslesebilenTanimIdleri = EslesebilenTanimIdleriniGetir(katalog, ozellikTanimlari);
        var eavBeklenenUrunSayisi = katalog.Urunler.Count(u =>
            u.Ozellikler.Keys.Any(etiket => OzellikTaniminiCoz(etiket, ozellikTanimlari) is not null));

        var eavYazilmisUrunSayisi = await _context.Urunler.CountAsync(
            u => u.KaynakSistem == KaynakSistem
                 && u.KaynakKatalogSurumu == katalog.Surum
                 && u.OzellikDegerleri.Any(d => eslesebilenTanimIdleri.Contains(d.OzellikTanimId)),
            cancellationToken);

        if (guncelUrunSayisi == katalog.UrunSayisi
            && eavYazilmisUrunSayisi >= eavBeklenenUrunSayisi)
        {
            _logger.LogInformation(
                "Özdisan katalogu zaten güncel: sürüm {Surum}, {Urun} ürün, {Uretici} üretici, {EavUrun} EAV ürün.",
                katalog.Surum,
                katalog.UrunSayisi,
                katalog.UreticiSayisi,
                eavYazilmisUrunSayisi);
            return;
        }

        var kategoriler = await _context.Kategoriler
            .Where(k => k.YaprakMi)
            .ToDictionaryAsync(k => k.SlugTr, StringComparer.Ordinal, cancellationToken);
        var eksikKategoriler = katalog.Urunler
            .Select(u => u.KategoriSlug)
            .Distinct(StringComparer.Ordinal)
            .Where(slug => !kategoriler.ContainsKey(slug))
            .ToArray();

        if (eksikKategoriler.Length > 0)
            throw new InvalidOperationException(
                $"Özdisan katalogu tanımsız kategorilere başvuruyor: {string.Join(", ", eksikKategoriler)}");

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        var ureticiler = await UreticileriEsitleAsync(katalog, cancellationToken);
        await UrunleriEsitleAsync(
            katalog, kategoriler, ureticiler, ozellikTanimlari, cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        // Herkese açık kategori ağacı YALNIZCA ürünü olan dalları içeriyor ve
        // 24 saat önbellekleniyor. Eşitleme hangi dalın dolu olduğunu
        // değiştirir; önbellek temizlenmezse menü bir gün boyunca eşitleme
        // ÖNCESİNİN ağacını gösterir. Boş kategorileri doldurduktan sonra menü
        // hâlâ eski 12 kategoriyi listeliyordu — geçersizleştirme yalnızca
        // yönetim panelindeki düzenlemelerde vardı.
        foreach (var anahtar in OnbellekAnahtarlari.KategoriAgaciAnahtarlari)
            await _cache.RemoveAsync(anahtar, cancellationToken);

        _logger.LogInformation(
            "Özdisan katalog eşitlemesi tamamlandı: sürüm {Surum}, {Urun} ürün, {Uretici} üretici.",
            katalog.Surum,
            katalog.UrunSayisi,
            katalog.UreticiSayisi);
    }

    private async Task<Dictionary<string, Uretici>> UreticileriEsitleAsync(
        OzdisanKatalogVerisi katalog,
        CancellationToken cancellationToken)
    {
        var tumUreticiler = await _context.Ureticiler
            .IgnoreQueryFilters()
            .ToListAsync(cancellationToken);
        var slugHaritasi = tumUreticiler
            .GroupBy(u => u.Slug, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);
        var kaynakUreticiAdlari = katalog.Urunler
            .Select(u => u.UreticiAd)
            .Distinct(StringComparer.Ordinal)
            .OrderBy(ad => ad, StringComparer.Create(new System.Globalization.CultureInfo("tr-TR"), true))
            .ToArray();
        var secilenKimlikler = new HashSet<int>();
        var sonuc = new Dictionary<string, Uretici>(StringComparer.Ordinal);

        foreach (var ad in kaynakUreticiAdlari)
        {
            var slug = CevikDataSeeder.SlugUret(ad);
            if (!slugHaritasi.TryGetValue(slug, out var uretici))
            {
                uretici = new Uretici
                {
                    Ad = ad,
                    Slug = slug,
                    Aciklama = $"Özdisan katalogunda yer alan {ad} ürünleri.",
                    YetkiliDistributorMu = false,
                    Aktif = true
                };
                _context.Ureticiler.Add(uretici);
                slugHaritasi[slug] = uretici;
            }

            var logo = katalog.Urunler
                .Where(u => u.UreticiAd == ad)
                .Select(u => u.UreticiLogoUrl)
                .FirstOrDefault(url => !string.IsNullOrWhiteSpace(url));

            uretici.Ad = ad;
            uretici.LogoUrl = logo ?? uretici.LogoUrl;
            uretici.Aktif = true;
            uretici.SilindiMi = false;
            sonuc[ad] = uretici;
        }

        await _context.SaveChangesAsync(cancellationToken);

        foreach (var uretici in sonuc.Values)
            secilenKimlikler.Add(uretici.Id);

        // Katalogda olmayan üreticiler PASİFE ALINMAZ.
        //
        // Önceki sürüm anlık görüntüde adı geçmeyen her üreticiyi
        // SilindiMi=true yapıyordu; şablon katalogundan gelen ve admin'in elle
        // eklediği tüm markalar her açılışta siliniyor, o markaların ürünleri
        // vitrinde markasız kalıyordu. Bir üreticinin gerçekten pasife
        // alınması ürün yönetiminin kararıdır, katalog senkronunun değil.
        await _context.SaveChangesAsync(cancellationToken);
        return sonuc;
    }

    private async Task UrunleriEsitleAsync(
        OzdisanKatalogVerisi katalog,
        IReadOnlyDictionary<string, Kategori> kategoriler,
        IReadOnlyDictionary<string, Uretici> ureticiler,
        IReadOnlyCollection<OzellikTanimi> ozellikTanimlari,
        CancellationToken cancellationToken)
    {
        // YALNIZCA bu kaynağın ürünleri yüklenir ve yalnızca onlar pasife
        // alınabilir. Şablon katalogundan gelen ve admin'in elle eklediği
        // ürünler senkronun kapsamı dışındadır.
        var mevcutUrunler = await _context.Urunler
            .IgnoreQueryFilters()
            .Where(u => u.KaynakSistem == KaynakSistem)
            .Include(u => u.UrunAmbalajlari)
                .ThenInclude(a => a.FiyatKademeleri)
            .Include(u => u.Dokumanlar)
            .Include(u => u.OzellikDegerleri)
            .AsSplitQuery()
            .ToListAsync(cancellationToken);

        var kaynakHaritasi = mevcutUrunler
            .Where(u => u.KaynakSistem == KaynakSistem && !string.IsNullOrWhiteSpace(u.KaynakKimligi))
            .GroupBy(u => u.KaynakKimligi!, StringComparer.Ordinal)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.Ordinal);
        var kodHaritasi = mevcutUrunler
            .GroupBy(u => (u.UreticiId, Kod: UrunKoduNormalizeleyici.Normalize(u.UreticiUrunKodu)))
            .ToDictionary(g => g.Key, g => g.First());

        // Aynı üreticinin aynı parça numarası şablon katalogunda da olabilir.
        // (UreticiId, UreticiUrunKodu) UNIQUE olduğu için ikinci bir satır
        // eklemek SaveChanges'i patlatır; bu yüzden kaynak dışı ürünler de
        // taranır ve çakışma varsa yeni satır AÇILMAZ, mevcut ürün bu kaynağa
        // devredilir. Yüklenen liste kaynağa daraltıldığından bu tarama ayrı
        // ve hafif bir projeksiyonla yapılır.
        var kaynakDisiEslesmeler = await _context.Urunler
            .IgnoreQueryFilters()
            .Where(u => u.KaynakSistem != KaynakSistem)
            .Select(u => new { u.Id, u.UreticiId, u.NormalizeKod })
            .ToListAsync(cancellationToken);

        var kaynakDisiKodHaritasi = kaynakDisiEslesmeler
            .GroupBy(u => (u.UreticiId, u.NormalizeKod))
            .ToDictionary(g => g.Key, g => g.First().Id);

        var eslesenUrunKimlikleri = new HashSet<long>();
        var eklenen = 0;
        var guncellenen = 0;

        foreach (var kaynak in katalog.Urunler)
        {
            var uretici = ureticiler[kaynak.UreticiAd];
            var normalizeKod = UrunKoduNormalizeleyici.Normalize(kaynak.Mpn);

            Urun? urun = null;
            kaynakHaritasi.TryGetValue(kaynak.KaynakKimligi, out urun);
            if (urun is null)
                kodHaritasi.TryGetValue((uretici.Id, normalizeKod), out urun);

            // Şablon katalogunda aynı parça varsa yeni satır açmak yerine onu devral.
            if (urun is null
                && kaynakDisiKodHaritasi.TryGetValue((uretici.Id, normalizeKod), out var devralinacakId))
            {
                urun = await _context.Urunler
                    .IgnoreQueryFilters()
                    .Include(u => u.UrunAmbalajlari).ThenInclude(a => a.FiyatKademeleri)
                    .Include(u => u.Dokumanlar)
                    .Include(u => u.OzellikDegerleri)
                    .FirstAsync(u => u.Id == devralinacakId, cancellationToken);

                mevcutUrunler.Add(urun);
                kodHaritasi[(uretici.Id, normalizeKod)] = urun;
            }

            if (urun is null)
            {
                urun = new Urun
                {
                    UreticiId = uretici.Id,
                    KategoriId = kategoriler[kaynak.KategoriSlug].Id,
                    UreticiUrunKodu = kaynak.Mpn,
                    NormalizeKod = normalizeKod,
                    KisaAciklama = kaynak.Aciklama
                };
                _context.Urunler.Add(urun);
                eklenen++;
            }
            else
            {
                guncellenen++;
            }

            UrunuGuncelle(urun, kaynak, katalog.Surum, uretici, kategoriler[kaynak.KategoriSlug]);
            OzellikleriGuncelle(urun, kaynak.Ozellikler, ozellikTanimlari);
            AmbalajiGuncelle(urun, kaynak.Ambalaj);
            DokumaniGuncelle(urun, kaynak);

            if (urun.Id != 0)
                eslesenUrunKimlikleri.Add(urun.Id);
        }

        var pasifeAlinan = 0;
        foreach (var urun in mevcutUrunler)
        {
            if (eslesenUrunKimlikleri.Contains(urun.Id))
                continue;

            urun.Aktif = false;
            urun.SilindiMi = true;
            pasifeAlinan++;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Ürün eşitleme sonucu: {Eklenen} eklendi, {Guncellenen} güncellendi, {Pasif} eski ürün pasife alındı.",
            eklenen,
            guncellenen,
            pasifeAlinan);
    }

    private static void OzellikleriGuncelle(
        Urun urun,
        IReadOnlyDictionary<string, string> kaynakOzellikleri,
        IReadOnlyCollection<OzellikTanimi> tanimlar)
    {
        // Birebir İngilizce ad eşleşmeleri alias'lardan önce gelir. Aynı tanıma
        // birden fazla kaynak etiketi düşerse ilk kesin eşleşme korunur.
        var eslesenler = new Dictionary<int, (OzellikTanimi Tanim, string Deger)>();
        foreach (var (etiket, deger) in kaynakOzellikleri)
        {
            if (string.IsNullOrWhiteSpace(deger))
                continue;

            var tanim = OzellikTaniminiCoz(etiket, tanimlar);

            if (tanim is not null && !eslesenler.ContainsKey(tanim.Id))
                eslesenler[tanim.Id] = (tanim, deger.Trim());
        }

        foreach (var (tanimId, eslesme) in eslesenler)
        {
            var satir = urun.OzellikDegerleri.FirstOrDefault(d => d.OzellikTanimId == tanimId);
            if (satir is null)
            {
                satir = new UrunOzellikDegeri
                {
                    Urun = urun,
                    OzellikTanimId = tanimId,
                    HamDeger = eslesme.Deger
                };
                urun.OzellikDegerleri.Add(satir);
            }

            satir.HamDeger = eslesme.Deger;
            satir.DegerMetin = eslesme.Deger;
            satir.DegerSayi = eslesme.Tanim.VeriTipi == OzellikVeriTipi.Sayi
                ? IlkSayiyiCoz(eslesme.Deger)
                : null;
            satir.DegerMin = null;
            satir.DegerMax = null;
        }

        // Kaynaktan DÜŞEN özelliklerin satırları silinmeli. Önceki sürüm yalnızca
        // upsert yapıyordu: bir ürünün özellik kümesi daraldığında eski satır
        // kalıcı oluyor ve filtre panelinde artık karşılığı olmayan bir değer
        // gösteriliyordu. Bu tabloya yalnızca bu eşitleyici yazar (yönetim
        // panelinde ürün özelliği düzenleme ucu yok), dolayısıyla eşleşmeyen
        // satırın sahibi de bu eşitleyicidir.
        var artikSatirlar = urun.OzellikDegerleri
            .Where(d => !eslesenler.ContainsKey(d.OzellikTanimId))
            .ToList();

        foreach (var artik in artikSatirlar)
            urun.OzellikDegerleri.Remove(artik);
    }

    private static List<int> EslesebilenTanimIdleriniGetir(
        OzdisanKatalogVerisi katalog,
        IReadOnlyCollection<OzellikTanimi> tanimlar) =>
        katalog.Urunler
            .SelectMany(u => u.Ozellikler.Keys)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(etiket => OzellikTaniminiCoz(etiket, tanimlar))
            .Where(t => t is not null)
            .Select(t => t!.Id)
            .Distinct()
            .ToList();

    private static OzellikTanimi? OzellikTaniminiCoz(
        string etiket,
        IReadOnlyCollection<OzellikTanimi> tanimlar)
    {
        var temizEtiket = etiket.Trim();
        var birebir = tanimlar.FirstOrDefault(t =>
            string.Equals(t.AdEn.Trim(), temizEtiket, StringComparison.OrdinalIgnoreCase));
        if (birebir is not null)
            return birebir;

        return OzellikEtiketTakmaAdlari.TryGetValue(temizEtiket, out var kod)
            ? tanimlar.FirstOrDefault(t => string.Equals(t.Kod, kod, StringComparison.OrdinalIgnoreCase))
            : null;
    }

    private static decimal? IlkSayiyiCoz(string deger)
    {
        var eslesme = Regex.Match(deger, @"[-+]?\d+(?:[.,]\d+)?", RegexOptions.CultureInvariant);
        if (!eslesme.Success)
            return null;

        return decimal.TryParse(
            eslesme.Value.Replace(',', '.'),
            NumberStyles.Number | NumberStyles.AllowLeadingSign,
            CultureInfo.InvariantCulture,
            out var sayi)
            ? sayi
            : null;
    }

    private static void UrunuGuncelle(
        Urun urun,
        OzdisanUrunKaydi kaynak,
        string katalogSurumu,
        Uretici uretici,
        Kategori kategori)
    {
        urun.UreticiId = uretici.Id;
        urun.KategoriId = kategori.Id;
        urun.UreticiUrunKodu = kaynak.Mpn;
        urun.NormalizeKod = UrunKoduNormalizeleyici.Normalize(kaynak.Mpn);
        urun.KisaAciklama = kaynak.Aciklama;
        urun.DetayliAciklamaTr =
            $"{uretici.Ad} {kaynak.Mpn}. Ürün bilgileri ve teknik değerler Özdisan katalogundan alınmıştır.";
        urun.DetayliAciklamaEn = kaynak.Aciklama;
        urun.AnaGorselUrl = kaynak.AnaGorselUrl;
        urun.GorselTemsiliMi = false;
        urun.KaynakSistem = KaynakSistem;
        urun.KaynakKimligi = kaynak.KaynakKimligi;
        urun.KaynakUrl = kaynak.KaynakUrl;
        urun.KaynakKatalogSurumu = katalogSurumu;
        urun.RohsDurumu = kaynak.Rohs ? RohsDurumu.Belgeli : RohsDurumu.Bilinmiyor;
        urun.MontajTipi = kaynak.Montaj switch
        {
            "SMT" => MontajTipi.Smt,
            "THT" => MontajTipi.Tht,
            _ => MontajTipi.Yok
        };
        urun.UrunDurumu = UrunDurumu.Aktif;
        urun.KampanyaliMi = false;
        urun.OzelliklerJson = JsonSerializer.Serialize(kaynak.Ozellikler);
        urun.Aktif = true;
        urun.SilindiMi = false;
    }

    /// <summary>
    /// Kaynaktaki ambalajı ürüne yazar.
    ///
    /// Anlık görüntü ürün başına TEK ambalaj taşır; bu, üründe zaten var olan
    /// diğer varyantların (Tape&amp;Reel / Tube / Tray) yanlış olduğu anlamına
    /// gelmez. Önceki sürüm ilki dışındaki tüm ambalajları soft-delete
    /// ediyordu; sonuç, katalogda birden fazla ambalaj varyantı olan tek bir
    /// ürünün bile kalmamasıydı — oysa varyant karşılaştırması bu projenin
    /// ayırt edici özelliği. Artık yalnızca kaynağın tarif ettiği ambalaj
    /// (adına göre eşleşen) güncellenir, diğerlerine dokunulmaz.
    /// </summary>
    private static void AmbalajiGuncelle(Urun urun, OzdisanAmbalajKaydi kaynak)
    {
        var ambalaj = urun.UrunAmbalajlari
            .FirstOrDefault(a => string.Equals(a.Ad, kaynak.Ad, StringComparison.OrdinalIgnoreCase));

        var yeniAmbalaj = ambalaj is null;
        if (ambalaj is null)
        {
            ambalaj = new UrunAmbalaji
            {
                Urun = urun,
                Ad = kaynak.Ad
            };
            urun.UrunAmbalajlari.Add(ambalaj);
        }

        ambalaj.Ad = kaynak.Ad;
        ambalaj.AmbalajTipi = kaynak.Tip switch
        {
            "TapeAndReel" => AmbalajTipi.TapeReel,
            "CutTape" => AmbalajTipi.CutTape,
            "Tube" => AmbalajTipi.Tube,
            "Tray" => AmbalajTipi.Tray,
            "Box" => AmbalajTipi.Box,
            _ => AmbalajTipi.Bulk
        };
        ambalaj.Mpq = Math.Max(1, kaynak.Mpq);
        ambalaj.Moq = Math.Max(1, kaynak.Moq);
        ambalaj.KatlamaMiktari = Math.Max(1, kaynak.KatlamaMiktari);
        ambalaj.SilindiMi = false;

        // STOK yalnızca ambalaj İLK KEZ oluşturulurken yazılır.
        //
        // Senkron her uygulama açılışında çalışıyor. Stoğu her seferinde
        // dosyadaki değere geri yazmak, gerçek siparişlerden düşülmüş
        // miktarları sessizce geri getiriyordu: müşteri 500 adet alıyor,
        // gece API yeniden başlıyor ve stok hiç satılmamış gibi görünüyordu.
        // Stok artık envanterin sorumluluğunda.
        if (yeniAmbalaj)
        {
            ambalaj.StokMiktari = Math.Max(0, kaynak.StokMiktari);
            ambalaj.GelecekStokMiktari = 0;
            ambalaj.GelecekStokTarihi = null;
            ambalaj.VarsayilanMi = !urun.UrunAmbalajlari.Any(a => a != ambalaj && a.VarsayilanMi);
        }

        var mevcutFiyatlar = ambalaj.FiyatKademeleri.OrderBy(f => f.Id).ToList();
        for (var index = 0; index < kaynak.Fiyatlar.Count; index++)
        {
            var kaynakFiyat = kaynak.Fiyatlar[index];
            var fiyat = index < mevcutFiyatlar.Count
                ? mevcutFiyatlar[index]
                : new FiyatKademesi { UrunAmbalaji = ambalaj, ParaBirimi = kaynakFiyat.ParaBirimi };

            if (index >= mevcutFiyatlar.Count)
                ambalaj.FiyatKademeleri.Add(fiyat);

            fiyat.MinMiktar = Math.Max(1, kaynakFiyat.MinMiktar);
            fiyat.MaxMiktar = kaynakFiyat.MaxMiktar;
            fiyat.BirimFiyat = kaynakFiyat.BirimFiyat;
            fiyat.ParaBirimi = kaynakFiyat.ParaBirimi;
            fiyat.SilindiMi = false;
        }

        foreach (var eskiFiyat in mevcutFiyatlar.Skip(kaynak.Fiyatlar.Count))
            eskiFiyat.SilindiMi = true;
    }

    private static void DokumaniGuncelle(Urun urun, OzdisanUrunKaydi kaynak)
    {
        if (string.IsNullOrWhiteSpace(kaynak.PdfUrl))
            return;

        var dokuman = urun.Dokumanlar.FirstOrDefault(d => d.Tip == DokumanTipi.Datasheet);
        if (dokuman is null)
        {
            dokuman = new UrunDokumani
            {
                Urun = urun,
                Tip = DokumanTipi.Datasheet,
                Url = kaynak.PdfUrl,
                Baslik = $"{kaynak.Mpn} veri sayfası"
            };
            urun.Dokumanlar.Add(dokuman);
        }

        dokuman.Url = kaynak.PdfUrl;
        dokuman.Baslik = $"{kaynak.Mpn} veri sayfası";
        dokuman.Dil = "en";
        dokuman.SilindiMi = false;
    }
}
