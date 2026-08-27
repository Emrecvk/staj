namespace Cevik.Uygulama.Siparis.Arayuzler;

/// <summary>
/// Döviz kuru kaynağı.
///
/// Sipariş servisi kuru <c>Kur = 1</c> olarak sabitliyordu; bu, USD fiyatlı
/// bir sepetin TL karşılığını 1:1 hesaplamak demekti. Arayüz arkasına
/// aldık ki bugün veritabanı/sabit tablo, yarın TCMB servisi kullanılabilsin.
/// </summary>
public interface IDovizKuruServisi
{
    /// <summary>
    /// <paramref name="kaynakParaBirimi"/> cinsinden 1 birimin
    /// <paramref name="hedefParaBirimi"/> cinsinden karşılığını döndürür.
    /// Aynı para birimi verilirse 1 döner.
    ///
    /// Kur bulunamazsa <see cref="Cevik.Uygulama.Ortak.IsKuraliIhlaliException"/>
    /// fırlatır. Önceki sürüm bu durumda sessizce 1 dönüyordu ve hiçbir çağıran
    /// bunu ayırt edemiyordu: TCMB servisi hiç çalışmamışsa 12,50 USD'lik ürün
    /// 12,50 TL olarak sipariş ediliyor, siparişe <c>Kur = 1</c> yazılıyordu.
    /// PARA hesabı yapan yollar (sipariş, teklif dönüşümü) bunu kullanmalıdır.
    /// </summary>
    Task<decimal> KurGetirAsync(string kaynakParaBirimi, string hedefParaBirimi, DateOnly? tarih = null);

    /// <summary>
    /// Kur biliniyorsa değeri, bilinmiyorsa <c>null</c> döndürür.
    ///
    /// Yalnızca GÖSTERİM yolları içindir: katalog listesi kur yok diye 500
    /// vermemeli, fiyatı çeviremediğini bilip kaynak para biriminde
    /// gösterebilmelidir.
    /// </summary>
    Task<decimal?> KurDeneAsync(string kaynakParaBirimi, string hedefParaBirimi, DateOnly? tarih = null);
}
