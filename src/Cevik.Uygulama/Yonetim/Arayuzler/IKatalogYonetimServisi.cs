using Cevik.Uygulama.Yonetim.Dto;

namespace Cevik.Uygulama.Yonetim.Arayuzler;

public interface IKatalogYonetimServisi
{
    Task<UrunYonetimSayfasiDto> UrunleriListeleAsync(string? arama, int? kategoriId, bool silinmisleriGoster, int sayfaNo, int sayfaBoyutu);
    Task<UrunYonetimDetayDto?> UrunGetirAsync(long id);
    Task<KimlikDto> UrunEkleAsync(UrunEkleDto dto);
    Task UrunGuncelleAsync(long id, UrunGuncelleDto dto);
    Task UrunSilAsync(long id);
    Task UrunGeriAlAsync(long id);
    Task StokGuncelleAsync(StokGuncelleDto dto);
    Task FiyatGuncelleAsync(AmbalajFiyatGuncelleDto dto);

    Task<List<KategoriYonetimDto>> KategorileriListeleAsync(bool silinmisleriGoster);
    Task<KategoriOlusturmaSonucuDto> KategoriEkleAsync(KategoriYazDto dto);
    Task KategoriGuncelleAsync(int id, KategoriYazDto dto);
    Task KategoriSilAsync(int id);
    Task KategoriOzelligiBaglaAsync(KategoriOzelligiYazDto dto);
    Task KategoriOzelligiKaldirAsync(int kategoriId, int ozellikTanimId);

    Task<List<UreticiYonetimDto>> UreticileriListeleAsync(bool silinmisleriGoster);
    Task<KimlikDto> UreticiEkleAsync(UreticiYazDto dto);
    Task UreticiGuncelleAsync(int id, UreticiYazDto dto);
    Task UreticiSilAsync(int id);

    Task<List<OzellikYonetimDto>> OzellikleriListeleAsync();
    Task<KimlikDto> OzellikEkleAsync(OzellikTanimiYazDto dto);
    Task OzellikGuncelleAsync(int id, OzellikTanimiYazDto dto);
}
