using Cevik.Uygulama.Icerik.Dto;

namespace Cevik.Uygulama.Icerik.Arayuzler;

public interface IPublicIcerikServisi
{
    Task<List<PublicBlogOzetDto>> BlogYazilariniGetirAsync();
    Task<PublicBlogDetayDto?> BlogYazisiGetirAsync(string slug);
    Task<List<PublicDuyuruDto>> DuyurulariGetirAsync();
    Task<List<PublicBannerDto>> BannerlariGetirAsync(string? konum = null);
    Task<PublicSayfaDto?> SayfaGetirAsync(string slug, string? dil = null);
    Task<List<PublicSssDto>> SikSorulanSorulariGetirAsync(int? kategoriId = null);
}
