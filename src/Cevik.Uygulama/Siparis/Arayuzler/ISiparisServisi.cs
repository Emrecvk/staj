using System.Collections.Generic;
using System.Threading.Tasks;
using Cevik.Uygulama.Siparis.Dto;

namespace Cevik.Uygulama.Siparis.Arayuzler;

public interface ISiparisServisi
{
    Task<SiparisDetayDto?> SiparisOlusturAsync(long kullaniciId, string? oturumAnahtari, SiparisOlusturDto dto);
    Task<List<SiparisListelemeDto>> SiparisleriGetirAsync(long kullaniciId);
    Task<SiparisDetayDto?> SiparisDetayGetirAsync(long kullaniciId, long siparisId);
}
