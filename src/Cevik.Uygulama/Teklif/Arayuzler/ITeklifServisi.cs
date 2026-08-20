using System.Collections.Generic;
using System.Threading.Tasks;
using Cevik.Uygulama.Teklif.Dto;

namespace Cevik.Uygulama.Teklif.Arayuzler;

public interface ITeklifServisi
{
    Task<TeklifListelemeDto?> TeklifTalebiOlusturAsync(long kullaniciId, string? oturumAnahtari, TeklifOlusturDto dto);
    Task<List<TeklifListelemeDto>> TeklifleriGetirAsync(long kullaniciId);
    Task<TeklifDetayDto?> TeklifDetayGetirAsync(long kullaniciId, long teklifId);
    Task DurumDegistirMusteriAsync(long kullaniciId, long teklifId, bool kabul);
    Task SipariseDonusturAsync(long kullaniciId, long teklifId);
}

public interface ITeklifYonetimServisi
{
    Task<List<TeklifListelemeDto>> TumTeklifleriGetirAsync();
    Task<TeklifDetayDto?> TeklifDetayGetirAsync(long teklifId);
    Task IncelemeyeAlAsync(long teklifId, long satisTemsilcisiId);
    Task FiyatlandirAsync(long teklifId, TeklifFiyatlandirDto dto);
    Task ReddetAsync(long teklifId);
}
