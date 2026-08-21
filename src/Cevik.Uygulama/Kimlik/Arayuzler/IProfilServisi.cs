using System.Collections.Generic;
using System.Threading.Tasks;
using Cevik.Uygulama.Kimlik.Dto;

namespace Cevik.Uygulama.Kimlik.Arayuzler;

public interface IProfilServisi
{
    Task<List<AdresDto>> AdresleriGetirAsync(long kullaniciId);
    Task<AdresDto?> AdresEkleAsync(long kullaniciId, AdresEkleDto dto);
    Task<bool> AdresSilAsync(long kullaniciId, long adresId);

    Task<List<FavoriDto>> FavorileriGetirAsync(long kullaniciId);
    Task<bool> FavoriEkleAsync(long kullaniciId, FavoriEkleDto dto);
    Task<bool> FavoriSilAsync(long kullaniciId, long urunId);

    Task<List<MusteriUrunKoduDto>> MusteriUrunKodlariniGetirAsync(long kullaniciId);
    Task<MusteriUrunKoduDto> MusteriUrunKoduEkleAsync(long kullaniciId, MusteriUrunKoduEkleDto dto);
    Task<bool> MusteriUrunKoduGuncelleAsync(long kullaniciId, long id, MusteriUrunKoduGuncelleDto dto);
    Task<bool> MusteriUrunKoduSilAsync(long kullaniciId, long id);

    /// <summary>Kullanıcının bağlı olduğu firma; firması yoksa null.</summary>
    Task<FirmaBilgiDto?> FirmaBilgisiGetirAsync(long kullaniciId);
}
