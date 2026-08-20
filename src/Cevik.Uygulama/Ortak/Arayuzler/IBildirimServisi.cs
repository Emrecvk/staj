namespace Cevik.Uygulama.Ortak.Arayuzler;

public interface IBildirimServisi
{
    Task EpostaGonderAsync(string kime, string konu, string icerik);
}
