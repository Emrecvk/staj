using System.Collections.Generic;
using System.Threading.Tasks;
using Cevik.Uygulama.Katalog.Dto;

namespace Cevik.Uygulama.Katalog.Arayuzler;

public interface IKatalogServisi
{
    Task<List<KategoriAgacDto>> KategoriAgaciniGetirAsync();
    
    Task<KategoriDetayDto?> KategoriDetayGetirAsync(string slug);
    
    /// <summary>
    /// Hem ürün listesini, hem de sol menüdeki faceted filtre gruplarını döner.
    /// Arama servisi ileride ElasticSearch olursa bu arayüz arka planda ona gider.
    /// </summary>
    Task<UrunAramaSonucDto> UrunleriListeleAsync(UrunAramaFiltreDto filtre);
    
    Task<UrunDetayDto?> UrunDetayGetirAsync(long id);

    Task IliskiliUrunEkleAsync(long urunId, long iliskiliUrunId, short tip, int sira = 0);
    Task IliskiliUrunSilAsync(long urunId, long iliskiliUrunId, short tip);

    Task<KarsilastirmaSonucDto> KarsilastirmaListesiGetirAsync(long? kullaniciId, string? oturumAnahtari);
    Task KarsilastirmayaEkleAsync(long? kullaniciId, string? oturumAnahtari, long urunId);
    Task KarsilastirmadanCikarAsync(long? kullaniciId, string? oturumAnahtari, long urunId);
}
