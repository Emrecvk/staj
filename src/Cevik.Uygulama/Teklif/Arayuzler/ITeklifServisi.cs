using System.Collections.Generic;
using System.Threading.Tasks;
using Cevik.Uygulama.Teklif.Dto;

namespace Cevik.Uygulama.Teklif.Arayuzler;

public interface ITeklifServisi
{
    /// <summary>
    /// Sepetten teklif talebi açar. Yetkisiz kullanıcıda
    /// <see cref="UnauthorizedAccessException"/>, boş sepette
    /// <see cref="Cevik.Uygulama.Ortak.IsKuraliIhlaliException"/> fırlatır —
    /// null dönüp çağıranın nedeni tahmin etmesine bırakmaz.
    /// </summary>
    Task<TeklifListelemeDto> TeklifTalebiOlusturAsync(long kullaniciId, string? oturumAnahtari, TeklifOlusturDto dto);
    Task<Cevik.Uygulama.Ortak.SayfaliSonucDto<TeklifListelemeDto>> TeklifleriGetirAsync(
        long kullaniciId,
        int sayfaNo,
        int sayfaBoyutu);
    Task<TeklifDetayDto?> TeklifDetayGetirAsync(long kullaniciId, long teklifId);
    Task DurumDegistirMusteriAsync(long kullaniciId, long teklifId, bool kabul);
    Task SipariseDonusturAsync(long kullaniciId, long teklifId);
}

public interface ITeklifYonetimServisi
{
    Task<Cevik.Uygulama.Ortak.SayfaliSonucDto<TeklifListelemeDto>> TumTeklifleriGetirAsync(
        int sayfaNo,
        int sayfaBoyutu);
    Task<TeklifDetayDto?> TeklifDetayGetirAsync(long teklifId);
    Task IncelemeyeAlAsync(long teklifId, long satisTemsilcisiId);
    Task FiyatlandirAsync(long teklifId, TeklifFiyatlandirDto dto);
    Task ReddetAsync(long teklifId);
}
