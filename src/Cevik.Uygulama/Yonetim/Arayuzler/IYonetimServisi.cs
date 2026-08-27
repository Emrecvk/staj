using Cevik.Uygulama.Yonetim.Dto;

namespace Cevik.Uygulama.Yonetim.Arayuzler;

public interface IYonetimServisi
{
    Task<bool> FirmaOnaylaAsync(FirmaOnayDto dto, long islemiYapanKullaniciId);

    /// <summary>Onay bekleyen firma başvuruları — admin panelinin giriş ekranı için.</summary>
    Task<Cevik.Uygulama.Ortak.SayfaliSonucDto<FirmaBasvuruOzetDto>> BekleyenFirmalariGetirAsync(int sayfaNo, int sayfaBoyutu);

    /// <summary>
    /// Sipariş durumunu değiştirir. Geçiş <see cref="Cevik.Alan.Kurallar.SiparisDurumMakinesi"/>
    /// tarafından doğrulanır; geçersiz geçişte istisna fırlatır.
    /// </summary>
    Task<bool> SiparisDurumGuncelleAsync(SiparisDurumGuncelleDto dto, long islemiYapanKullaniciId);

    Task<Cevik.Uygulama.Ortak.SayfaliSonucDto<SiparisYonetimOzetDto>> SiparisleriGetirAsync(
        short? durum,
        int sayfaNo,
        int sayfaBoyutu);

    /// <summary>Kullanıcı rolü değiştirme — yetki yükseltmenin TEK meşru yolu.</summary>
    Task<bool> KullaniciRolGuncelleAsync(KullaniciRolGuncelleDto dto);

    Task<Cevik.Uygulama.Ortak.SayfaliSonucDto<BlogYazisiDto>> BlogYazilariGetirAsync(int sayfaNo, int sayfaBoyutu);
    Task<BlogYazisiDto> BlogYazisiEkleAsync(BlogYazisiEkleDto dto);
}
