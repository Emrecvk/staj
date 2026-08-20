using System.Threading.Tasks;

namespace Cevik.Uygulama.Ortak.Arayuzler;

public interface IEpostaServisi
{
    Task EpostaGonderAsync(string kime, string konu, string icerik);
}
