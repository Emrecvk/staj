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
    /// </summary>
    Task<decimal> KurGetirAsync(string kaynakParaBirimi, string hedefParaBirimi, DateOnly? tarih = null);
}
