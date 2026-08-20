using System.Threading.Tasks;
using Cevik.Uygulama.Siparis.Dto;

namespace Cevik.Uygulama.Siparis.Arayuzler;

public interface ISepetServisi
{
    Task<SepetDto?> SepetGetirAsync(long? kullaniciId, string? oturumAnahtari);
    Task<SepetDto> SepeteEkleAsync(long? kullaniciId, string? oturumAnahtari, SepeteEkleDto dto);
    Task<SepetDto?> SepetGuncelleAsync(long? kullaniciId, string? oturumAnahtari, SepetGuncelleDto dto);
    Task<SepetDto?> SepettenCikarAsync(long? kullaniciId, string? oturumAnahtari, long kalemId);
    Task<bool> SepetiBosaltAsync(long? kullaniciId, string? oturumAnahtari);
}
