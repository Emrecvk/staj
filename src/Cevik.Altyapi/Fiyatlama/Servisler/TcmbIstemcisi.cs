using System.Xml.Linq;
using System.Globalization;
using Microsoft.Extensions.Logging;

namespace Cevik.Altyapi.Fiyatlama.Servisler;

public interface ITcmbIstemcisi
{
    Task<Dictionary<string, (decimal Alis, decimal Satis)>> KurlariGetirAsync();
}

public class TcmbIstemcisi : ITcmbIstemcisi
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TcmbIstemcisi> _logger;

    public TcmbIstemcisi(HttpClient httpClient, ILogger<TcmbIstemcisi> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<Dictionary<string, (decimal Alis, decimal Satis)>> KurlariGetirAsync()
    {
        var sonuc = new Dictionary<string, (decimal Alis, decimal Satis)>();
        try
        {
            var response = await _httpClient.GetStringAsync("https://www.tcmb.gov.tr/kurlar/today.xml");
            var xml = XDocument.Parse(response);
            
            var kurlar = xml.Descendants("Currency");
            foreach (var kur in kurlar)
            {
                var kod = kur.Attribute("CurrencyCode")?.Value;
                if (string.IsNullOrEmpty(kod)) continue;

                var alisStr = kur.Element("ForexBuying")?.Value;
                var satisStr = kur.Element("ForexSelling")?.Value;

                // TCMB XML değerleri her zaman noktalı ondalık ayırıcı kullanır.
                // Sunucunun kültürüne göre parse etmek, örneğin 48.1234 değerini
                // bazı ortamlarda 481234 olarak okuyup tüm TRY fiyatlarını bozar.
                if (decimal.TryParse(alisStr, NumberStyles.Number, CultureInfo.InvariantCulture, out decimal alis) &&
                    decimal.TryParse(satisStr, NumberStyles.Number, CultureInfo.InvariantCulture, out decimal satis) &&
                    alis > 0m && satis > 0m)
                {
                    sonuc[kod] = (alis, satis);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TCMB'den kur bilgisi alınırken hata oluştu.");
        }

        return sonuc;
    }
}
