namespace Cevik.Uygulama.Ortak;

/// <summary>
/// JWT ayarları — appsettings "Jwt" bölümünden bağlanır.
///
/// Bu sınıfın var olma sebebi: token ÜRETEN servis ile token DOĞRULAYAN
/// middleware'in ayrı ayrı `?? "varsayilan"` yazması, iki tarafın farklı
/// değere düşmesine ve tüm girişlerin sessizce bozulmasına yol açıyordu.
/// Artık tek kaynak var ve eksik yapılandırma açılışta hata verir.
/// </summary>
public class JwtAyarlari
{
    public const string BolumAdi = "Jwt";

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int GecerlilikDakika { get; set; } = 120;

    /// <summary>
    /// Açılışta <c>ValidateOnStart</c> ile çağrılır. Eksik/zayıf yapılandırmayı
    /// sessizce varsayılana düşürmek yerine uygulamayı hiç başlatmıyoruz —
    /// üretimde varsayılan anahtarla çalışmak, token'ı herkesin üretebilmesi demektir.
    /// </summary>
    public bool GecerliMi(out string? hata)
    {
        if (string.IsNullOrWhiteSpace(Key))
        {
            hata = "Jwt:Key yapılandırılmamış.";
            return false;
        }

        // HMAC-SHA256 için anahtar en az 256 bit (32 bayt) olmalıdır.
        if (System.Text.Encoding.UTF8.GetByteCount(Key) < 32)
        {
            hata = "Jwt:Key en az 32 karakter olmalıdır (HMAC-SHA256 için 256 bit).";
            return false;
        }

        if (string.IsNullOrWhiteSpace(Issuer))
        {
            hata = "Jwt:Issuer yapılandırılmamış.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(Audience))
        {
            hata = "Jwt:Audience yapılandırılmamış.";
            return false;
        }

        hata = null;
        return true;
    }

    /// <summary>Geçersizse açıklayıcı mesajla istisna fırlatır.</summary>
    public void Dogrula()
    {
        if (!GecerliMi(out var hata))
            throw new InvalidOperationException(hata);
    }
}
