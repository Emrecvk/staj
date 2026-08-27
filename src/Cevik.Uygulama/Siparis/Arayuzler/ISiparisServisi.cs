using System.Collections.Generic;
using System.Threading.Tasks;
using Cevik.Uygulama.Siparis.Dto;

namespace Cevik.Uygulama.Siparis.Arayuzler;

public interface ISiparisServisi
{
    Task<SiparisDetayDto?> SiparisOlusturAsync(long kullaniciId, string? oturumAnahtari, SiparisOlusturDto dto);
    Task<Cevik.Uygulama.Ortak.SayfaliSonucDto<SiparisListelemeDto>> SiparisleriGetirAsync(
        long kullaniciId,
        int sayfaNo,
        int sayfaBoyutu);
    Task<SiparisDetayDto?> SiparisDetayGetirAsync(long kullaniciId, long siparisId);
}
