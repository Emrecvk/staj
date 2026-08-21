namespace Cevik.EntegrasyonTestleri;

/// <summary>
/// Testlere çakışmayan sahte istemci IP'si üretir.
///
/// Neden gerekli: oran sınırlayıcı istemcileri <c>RemoteIpAddress</c>'e göre
/// bölümlendiriyor ve kimlik uçlarında limit 5/dk. TestServer'da gerçek bir
/// uzak IP olmadığı için testler X-Forwarded-For gönderiyor. Bu adres
/// <c>Random</c> ile üretildiğinde iki test aynı değere düşebiliyor, ortak
/// bölümün bütçesi tükeniyor ve testler <c>429</c> alıp kararsız (flaky)
/// şekilde düşüyordu.
///
/// Sayaç süreç genelinde artar; aynı koşuda iki teste asla aynı adres verilmez.
/// </summary>
internal static class TestIstemciAdresi
{
    private static int _sayac;

    public static string Uret()
    {
        // 10.0.0.0/8 içinde sayacı üç okteta yayıyoruz: 16 milyondan fazla
        // benzersiz adres, tek koşu için fazlasıyla yeterli.
        var deger = Interlocked.Increment(ref _sayac);
        return $"10.{(deger >> 16) & 0xFF}.{(deger >> 8) & 0xFF}.{deger & 0xFF}";
    }
}
