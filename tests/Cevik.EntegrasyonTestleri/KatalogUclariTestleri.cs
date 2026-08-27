using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Cevik.Uygulama.Katalog.Dto;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace Cevik.EntegrasyonTestleri;

[Collection("Api")]
public class KatalogUclariTestleri
{
    private readonly CevikUygulamaFabrikasi _fabrika;
    private readonly HttpClient _istemci;

    private static readonly JsonSerializerOptions JsonAyarlari = new(JsonSerializerDefaults.Web);

    public KatalogUclariTestleri(CevikUygulamaFabrikasi fabrika)
    {
        _fabrika = fabrika;
        _istemci = fabrika.CreateClient();
    }

    [Fact]
    public async Task Saglik_Ucu_Ayakta_Doner()
    {
        var yanit = await _istemci.GetAsync("/saglik");
        yanit.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task KategoriAgaci_CokSeviyeli_Doner()
    {
        var agac = await _istemci.GetFromJsonAsync<List<KategoriAgacDto>>(
            "/api/katalog/kategoriler/agac", JsonAyarlari);

        agac.Should().NotBeNullOrEmpty("seed en az bir kök kategori üretmeli");

        // Ağacın gerçekten hiyerarşik olduğunu doğruluyoruz: düz bir liste
        // dönmesi, önceki seed'in tek seviyeli olması hatasının tekrarı olur.
        agac!.Should().Contain(k => k.AltKategoriler.Count > 0,
            "kategori ağacı en az bir alt kategori içermeli");

        agac.SelectMany(k => k.AltKategoriler).Should().Contain(a => a.YaprakMi,
            "ürünler yaprak kategorilere bağlanır");
    }

    [Fact]
    public async Task KategoriAgaci_BosUrunDali_Donmez()
    {
        var agac = await _istemci.GetFromJsonAsync<List<KategoriAgacDto>>(
            "/api/katalog/kategoriler/agac", JsonAyarlari);

        static IEnumerable<KategoriAgacDto> Duzlestir(IEnumerable<KategoriAgacDto> dallar) =>
            dallar.SelectMany(dal => new[] { dal }.Concat(Duzlestir(dal.AltKategoriler)));

        var kategoriIdleri = Duzlestir(agac!).Select(kategori => kategori.Id).ToList();
        var sorgu = string.Join("&", kategoriIdleri.Select(id => $"kategoriIdleri={id}"));
        var sayilar = await _istemci.GetFromJsonAsync<Dictionary<int, int>>(
            $"/api/katalog/kategoriler/urun-sayilari?{sorgu}", JsonAyarlari);

        sayilar.Should().NotBeNull();
        kategoriIdleri.Should().OnlyContain(id => sayilar![id] > 0,
            "halka açık kategori menüsündeki her dal en az bir gerçek ürüne ulaşmalı");
    }

    [Fact]
    public async Task KategoriUrunSayilari_ListelemeToplamlariylaAyni()
    {
        var agac = await _istemci.GetFromJsonAsync<List<KategoriAgacDto>>(
            "/api/katalog/kategoriler/agac", JsonAyarlari);
        var kok = agac!.First(kategori => kategori.AltKategoriler.Count > 0);
        var yaprak = kok.AltKategoriler.First();

        var sayilar = await _istemci.GetFromJsonAsync<Dictionary<int, int>>(
            $"/api/katalog/kategoriler/urun-sayilari?kategoriIdleri={kok.Id}&kategoriIdleri={yaprak.Id}",
            JsonAyarlari);
        var kokListe = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            $"/api/katalog/urunler?sayfaNo=1&sayfaBoyutu=1&kategoriId={kok.Id}", JsonAyarlari);
        var yaprakListe = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            $"/api/katalog/urunler?sayfaNo=1&sayfaBoyutu=1&kategoriId={yaprak.Id}", JsonAyarlari);

        sayilar.Should().NotBeNull();
        sayilar![kok.Id].Should().Be(kokListe!.Urunler.ToplamKayit);
        sayilar[yaprak.Id].Should().Be(yaprakListe!.Urunler.ToplamKayit);
    }

    [Fact]
    public async Task UrunListeleme_SayfalamaCalisir()
    {
        var sonuc = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            "/api/katalog/urunler?sayfaNo=1&sayfaBoyutu=10", JsonAyarlari);

        sonuc.Should().NotBeNull();
        sonuc!.Urunler.Kayitlar.Should().HaveCountLessThanOrEqualTo(10);
        sonuc.Urunler.ToplamKayit.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task UrunlerinFiyatVeStokVerisiVar()
    {
        // Kullanıcının bildirdiği "5000 ürünün hiçbirinde fiyat/stok yok"
        // durumunun tekrarlamadığını kanıtlar.
        var sonuc = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            "/api/katalog/urunler?sayfaNo=1&sayfaBoyutu=50", JsonAyarlari);

        sonuc!.Urunler.Kayitlar.Should().NotBeEmpty();
        sonuc.Urunler.Kayitlar.Should().Contain(u => u.BaslangicFiyati > 0,
            "ürünlerin fiyat kademesi olmalı");
        sonuc.Urunler.Kayitlar.Should().Contain(u => u.ToplamStok > 0,
            "ürünlerin bir kısmı stokta olmalı");
    }

    [Fact]
    public async Task UrunListeleme_KartVerisiniZenginDoner()
    {
        var sonuc = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            "/api/katalog/urunler?sayfaNo=1&sayfaBoyutu=10", JsonAyarlari);

        var urun = sonuc!.Urunler.Kayitlar.First();
        urun.UreticiId.Should().BeGreaterThan(0);
        urun.UrunDurumu.Should().NotBeNullOrWhiteSpace();
        urun.RohsDurumu.Should().NotBeNullOrWhiteSpace();
        urun.AmbalajlarVeFiyatlar.Should().NotBeEmpty();
        urun.AmbalajlarVeFiyatlar[0].Fiyatlar.Should().NotBeEmpty();
    }

    [Fact]
    public async Task UrunKoduParcaliAramasi_SonucBulur()
    {
        // Önce gerçek bir ürün kodu al, ilk 6 karakteriyle ara.
        var ilkKod = await _fabrika.Veritabaniyla(db => db.Urunler
            .OrderBy(u => u.Id)
            .Select(u => u.UreticiUrunKodu)
            .FirstAsync());

        var parca = ilkKod[..Math.Min(6, ilkKod.Length)];

        var sonuc = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            $"/api/katalog/urunler?aramaMetni={Uri.EscapeDataString(parca)}", JsonAyarlari);

        sonuc!.Urunler.ToplamKayit.Should().BeGreaterThan(0,
            $"'{parca}' ön eki en az '{ilkKod}' ürününü bulmalı");
    }

    [Fact]
    public async Task Arama_TireVeBoslukFarkiniGozetmez()
    {
        var ilkKod = await _fabrika.Veritabaniyla(db => db.Urunler
            .OrderBy(u => u.Id)
            .Select(u => u.UreticiUrunKodu)
            .FirstAsync());

        // Aynı kodu tire ekleyerek arıyoruz; normalizasyon bunu eşitlemeli.
        var tireli = string.Join("-", ilkKod.Chunk(3).Select(c => new string(c)));

        var sonuc = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            $"/api/katalog/urunler?aramaMetni={Uri.EscapeDataString(tireli)}", JsonAyarlari);

        sonuc!.Urunler.ToplamKayit.Should().BeGreaterThan(0,
            "normalizasyon tire/boşluk farkını yok saymalı");
    }

    [Fact]
    public async Task Arama_UreticiAdiIle_SonucBulur()
    {
        var uretici = await _fabrika.Veritabaniyla(db => db.Ureticiler
            .Where(u => u.Urunler.Any())
            .OrderBy(u => u.Id)
            .Select(u => new { u.Ad, u.Id })
            .FirstAsync());

        var sonuc = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            $"/api/katalog/urunler?aramaMetni={Uri.EscapeDataString(uretici.Ad)}",
            JsonAyarlari);

        sonuc!.Urunler.ToplamKayit.Should().BeGreaterThan(0,
            $"'{uretici.Ad}' üretici adıyla arama en az bir ürün bulmalı");
        sonuc.Urunler.Kayitlar.Should().Contain(u => u.UreticiAd == uretici.Ad,
            "sonuçlar aranan üreticiye ait ürünleri içermeli");
    }

    [Fact]
    public async Task YaprakKategoride_FacetSayaclariDolu()
    {
        // Bildirilen "facet verisi yok" sorununun düzeldiğinin kanıtı.
        var yaprakId = await _fabrika.Veritabaniyla(db => db.Kategoriler
            .Where(k => k.YaprakMi)
            .OrderBy(k => k.Id)
            .Select(k => k.Id)
            .FirstAsync());

        var sonuc = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            $"/api/katalog/urunler?kategoriId={yaprakId}", JsonAyarlari);

        sonuc!.Filtreler.Should().NotBeEmpty("yaprak kategoride parametrik filtreler görünmeli");

        var ilkGrup = sonuc.Filtreler[0];
        ilkGrup.Secenekler.Should().NotBeEmpty();
        ilkGrup.Secenekler.Should().OnlyContain(s => s.UrunSayisi > 0,
            "facet seçeneği sıfır ürünle listelenmemeli");
    }

    [Fact]
    public async Task KategoriSecilmeden_UreticiFacetleriDoner()
    {
        var sonuc = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            "/api/katalog/urunler?sayfaNo=1&sayfaBoyutu=10", JsonAyarlari);

        var facet = sonuc!.Filtreler.Should().ContainSingle(f => f.Kod == "ureticiId").Subject;
        facet.Secenekler.Should().NotBeEmpty("kategori seçilmeden marka filtresi görünmeli");
        facet.Secenekler.Should().Contain(s => s.UrunSayisi > 0);
    }

    [Fact]
    public async Task ParametrikFiltre_SonucKumesiniDaraltir()
    {
        var yaprakId = await _fabrika.Veritabaniyla(db => db.Kategoriler
            .Where(k => k.YaprakMi)
            .OrderBy(k => k.Id)
            .Select(k => k.Id)
            .FirstAsync());

        var filtresiz = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            $"/api/katalog/urunler?kategoriId={yaprakId}", JsonAyarlari);

        var grup = filtresiz!.Filtreler.FirstOrDefault(f => f.Secenekler.Count > 1);
        grup.Should().NotBeNull("daraltmayı ölçmek için en az iki seçenekli bir facet gerekli");

        var secenek = grup!.Secenekler[0];

        var url = $"/api/katalog/urunler?kategoriId={yaprakId}" +
                  $"&parametrikFiltreler[{grup.Kod}][0]={Uri.EscapeDataString(secenek.Deger)}";

        var filtreli = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(url, JsonAyarlari);

        // Bildirilen "filtreler hiçbir sorguya uygulanmıyor" sorununun kanıtı:
        // filtre uygulanınca sonuç sayısı facet sayacına eşit olmalı.
        filtreli!.Urunler.ToplamKayit.Should().Be(secenek.UrunSayisi,
            "filtre uygulandığında sonuç sayısı facet sayacıyla birebir eşleşmeli");

        filtreli.Urunler.ToplamKayit.Should().BeLessThan(filtresiz.Urunler.ToplamKayit,
            "filtre sonucu daraltmalı");
    }

    [Fact]
    public async Task SecilenFacetGrubunun_DigerSecenekleri_SifirlanMAZ()
    {
        // Konjonktif facet hatası: kendi seçimini de sayaca dahil edersen
        // aynı grubun diğer seçenekleri 0'a düşer ve kullanıcı seçimini genişletemez.
        var yaprakId = await _fabrika.Veritabaniyla(db => db.Kategoriler
            .Where(k => k.YaprakMi)
            .OrderBy(k => k.Id)
            .Select(k => k.Id)
            .FirstAsync());

        var filtresiz = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            $"/api/katalog/urunler?kategoriId={yaprakId}", JsonAyarlari);

        var grup = filtresiz!.Filtreler.First(f => f.Secenekler.Count > 1);
        var secenek = grup.Secenekler[0];

        var url = $"/api/katalog/urunler?kategoriId={yaprakId}" +
                  $"&parametrikFiltreler[{grup.Kod}][0]={Uri.EscapeDataString(secenek.Deger)}";

        var filtreli = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(url, JsonAyarlari);

        var ayniGrup = filtreli!.Filtreler.First(f => f.Kod == grup.Kod);

        ayniGrup.Secenekler.Should().HaveCountGreaterThan(1,
            "seçim yapılan grubun diğer seçenekleri kaybolmamalı");
        ayniGrup.Secenekler.Should().OnlyContain(s => s.UrunSayisi > 0);
    }

    [Fact]
    public async Task UstKategoriSecimi_AltKategoriUrunleriniDeGetirir()
    {
        var kok = await _fabrika.Veritabaniyla(db => db.Kategoriler
            .Where(k => k.UstKategoriId == null)
            .OrderBy(k => k.Id)
            .Select(k => k.Id)
            .FirstAsync());

        var sonuc = await _istemci.GetFromJsonAsync<UrunAramaSonucDto>(
            $"/api/katalog/urunler?kategoriId={kok}", JsonAyarlari);

        // Ürünler yaprak kategorilere bağlı; kök kategori seçimi ltree alt ağacını
        // kapsamazsa sonuç 0 döner.
        sonuc!.Urunler.ToplamKayit.Should().BeGreaterThan(0,
            "üst kategori seçimi alt kategorilerdeki ürünleri de kapsamalı");
    }

    [Fact]
    public async Task UrunDetay_AmbalajVeKademeliFiyatIcerir()
    {
        var urunId = await _fabrika.Veritabaniyla(db => db.Urunler
            .Where(u => u.UrunAmbalajlari.Any())
            .OrderBy(u => u.Id)
            .Select(u => u.Id)
            .FirstAsync());

        var detay = await _istemci.GetFromJsonAsync<UrunDetayDto>(
            $"/api/katalog/urunler/{urunId}", JsonAyarlari);

        detay.Should().NotBeNull();
        detay!.AmbalajlarVeFiyatlar.Should().NotBeEmpty();
        detay.AmbalajlarVeFiyatlar[0].Fiyatlar.Should().HaveCountGreaterThan(1,
            "kademeli fiyat en az iki kademe içermeli");

        // Kademeler artan miktar / azalan fiyat olmalı.
        var fiyatlar = detay.AmbalajlarVeFiyatlar[0].Fiyatlar;
        fiyatlar.Should().BeInAscendingOrder(f => f.MinMiktar);
        fiyatlar.Last().BirimFiyat.Should().BeLessThan(fiyatlar.First().BirimFiyat,
            "büyük miktarda birim fiyat düşmeli");
    }

    [Fact]
    public async Task CokluAmbalajVaryantiOlanUrunlerVar()
    {
        // "Aynı ürünün Tape&Reel / Tube / Tray varyantı" bu projenin
        // ayırt edici özelliği; seed tek ambalaj üretiyorsa gösterilemez.
        var cokAmbalajli = await _fabrika.Veritabaniyla(db => db.Urunler
            .CountAsync(u => u.UrunAmbalajlari.Count > 1));

        cokAmbalajli.Should().BeGreaterThan(0,
            "en az bir ürünün birden fazla ambalaj varyantı olmalı");
    }

    [Fact]
    public async Task OlmayanUrun_404Doner()
    {
        var yanit = await _istemci.GetAsync("/api/katalog/urunler/999999999");
        yanit.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
