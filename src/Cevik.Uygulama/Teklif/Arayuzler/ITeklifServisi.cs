using System.Collections.Generic;
using System.Threading.Tasks;
using Cevik.Uygulama.Teklif.Dto;

namespace Cevik.Uygulama.Teklif.Arayuzler;

public interface ITeklifServisi
{
    Task<TeklifListelemeDto?> TeklifTalebiOlusturAsync(long kullaniciId, string? oturumAnahtari, TeklifOlusturDto dto);
    Task<List<TeklifListelemeDto>> TeklifleriGetirAsync(long kullaniciId);
}
