namespace Cevik.Uygulama.Ortak;

/// <summary>
/// Domain/iş kuralı ihlali (yetersiz stok, MOQ altı miktar, geçersiz durum geçişi...).
///
/// Neden ayrı bir tip: servisler daha önce düz <c>throw new Exception(...)</c>
/// kullanıyordu; bu her iş kuralı hatasını HTTP 500'e çeviriyor ve istemciye
/// "sunucu çöktü" gibi görünüyordu. Bu tip istek hattında 422'ye eşlenir,
/// böylece frontend hatayı kullanıcıya gösterebilir.
/// </summary>
public class IsKuraliIhlaliException : Exception
{
    public IsKuraliIhlaliException(string mesaj) : base(mesaj) { }

    public IsKuraliIhlaliException(string mesaj, Exception icHata) : base(mesaj, icHata) { }
}
