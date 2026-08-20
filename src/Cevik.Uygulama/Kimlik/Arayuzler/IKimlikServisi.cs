using System.Threading.Tasks;
using Cevik.Uygulama.Kimlik.Dto;

namespace Cevik.Uygulama.Kimlik.Arayuzler;

public interface IKimlikServisi
{
    Task<TokenDto?> GirisYapAsync(KullaniciGirisDto dto);
    Task<bool> KayitOlAsync(KullaniciKayitDto dto);
    Task<bool> FirmaBasvurusuYapAsync(long kullaniciId, FirmaBasvuruDto dto);
    
    Task<TokenDto?> TokenYenileAsync(TokenYenileDto dto);
    Task<bool> CikisYapAsync(string refreshToken);
    
    Task<string?> SifreSifirlamaTalebiOlusturAsync(SifreSifirlamaTalebiDto dto);
    Task<bool> SifreSifirlaAsync(SifreSifirlaDto dto);
    
    Task<string?> EpostaDogrulamaTalebiOlusturAsync(long kullaniciId);
    Task<bool> EpostaDogrulaAsync(EpostaDogrulaDto dto);
}
