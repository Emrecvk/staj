using Cevik.Uygulama.Yonetim.Dto;

namespace Cevik.Uygulama.Yonetim.Arayuzler;

public interface IYonetimServisi
{
    Task<bool> FirmaOnaylaAsync(FirmaOnayDto dto, long islemiYapanKullaniciId);

    /// <summary>Onay bekleyen firma başvuruları — admin panelinin giriş ekranı için.</summary>
    Task<List<FirmaBasvuruOzetDto>> BekleyenFirmalariGetirAsync();

    /// <summary>
    /// Sipariş durumunu değiştirir. Geçiş <see cref="Cevik.Alan.Kurallar.SiparisDurumMakinesi"/>
    /// tarafından doğrulanır; geçersiz geçişte istisna fırlatır.
    /// </summary>
    Task<bool> SiparisDurumGuncelleAsync(SiparisDurumGuncelleDto dto, long islemiYapanKullaniciId);

    Task<List<SiparisYonetimOzetDto>> SiparisleriGetirAsync(short? durum, int sayfa, int boyut);

    /// <summary>Kullanıcı rolü değiştirme — yetki yükseltmenin TEK meşru yolu.</summary>
    Task<bool> KullaniciRolGuncelleAsync(KullaniciRolGuncelleDto dto);

    Task<List<BlogYazisiDto>> BlogYazilariGetirAsync();
    Task<BlogYazisiDto> BlogYazisiEkleAsync(BlogYazisiEkleDto dto);
}
