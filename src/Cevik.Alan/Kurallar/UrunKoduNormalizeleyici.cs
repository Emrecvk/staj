namespace Cevik.Alan.Kurallar;

/// <summary>
/// Ürün kodu normalizasyonu — aramanın çalışmasının ön şartı.
///
/// "STM32F103C8T6", "stm32-f103", "STM 32 F103" hepsi aynı ürünü işaret eder.
/// Veriyi YAZAN (seed/admin) ile ARAYAN (katalog servisi) tarafın birebir aynı
/// kuralı uygulaması gerekir; iki yerde iki farklı kural yazılırsa arama
/// hiçbir şey bulamaz. Bu yüzden kural tek bir yerde, domain katmanındadır.
/// </summary>
public static class UrunKoduNormalizeleyici
{
    /// <summary>Harf ve rakam dışındaki her şeyi atar, büyük harfe çevirir.</summary>
    public static string Normalize(string? girdi)
    {
        if (string.IsNullOrWhiteSpace(girdi)) return string.Empty;

        return new string(girdi
            .Where(char.IsLetterOrDigit)
            .Select(char.ToUpperInvariant)
            .ToArray());
    }
}
