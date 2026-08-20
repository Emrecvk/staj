using System.Xml.Linq;
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

                var alisStr = kur.Element("ForexBuying")?.Value?.Replace(".", ",");
                var satisStr = kur.Element("ForexSelling")?.Value?.Replace(".", ",");

                if (decimal.TryParse(alisStr, out decimal alis) && decimal.TryParse(satisStr, out decimal satis))
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
