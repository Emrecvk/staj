using System.Threading.Tasks;
using Cevik.Uygulama.Kimlik.Dto;

namespace Cevik.Uygulama.Kimlik.Arayuzler;

public interface IKimlikServisi
{
    Task<TokenDto?> GirisYapAsync(KullaniciGirisDto dto);
    Task<bool> KayitOlAsync(KullaniciKayitDto dto);
    Task<bool> FirmaBasvurusuYapAsync(long kullaniciId, FirmaBasvuruDto dto);
}
