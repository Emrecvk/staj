using Cevik.Uygulama.Bom.Dto;

namespace Cevik.Uygulama.Bom.Arayuzler;

public interface IMalzemeListesiServisi
{
    Task<MalzemeListesiSonucDto> YukleVeEslestirAsync(
        MalzemeListesiYukleDto dto,
        long? kullaniciId,
        int? firmaId);

    Task<BomAdayDto> AdaySecAsync(long listeId, long kalemId, long urunId, long? kullaniciId);
}
