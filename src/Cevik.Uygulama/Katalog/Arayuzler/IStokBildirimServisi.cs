using Cevik.Uygulama.Katalog.Dto;

namespace Cevik.Uygulama.Katalog.Arayuzler;

public interface IStokBildirimServisi
{
    Task OlusturAsync(long ambalajId, long? kullaniciId, StokBildirimTalebiDto dto);
}
