using System.Net;
using Cevik.Altyapi.Fiyatlama.Servisler;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace Cevik.BirimTestleri;

public class TcmbIstemcisiTestleri
{
    [Fact]
    public async Task NoktaliOndalikDegerleri_SunucuKulturundenBagimsiz_Okur()
    {
        const string xml = """
            <?xml version="1.0" encoding="UTF-8"?>
            <Tarih_Date>
              <Currency CurrencyCode="USD">
                <ForexBuying>48.1234</ForexBuying>
                <ForexSelling>48.5678</ForexSelling>
              </Currency>
            </Tarih_Date>
            """;

        using var httpClient = new HttpClient(new SabitYanitIsleyicisi(xml));
        var istemci = new TcmbIstemcisi(httpClient, NullLogger<TcmbIstemcisi>.Instance);

        var kurlar = await istemci.KurlariGetirAsync();

        kurlar["USD"].Alis.Should().Be(48.1234m);
        kurlar["USD"].Satis.Should().Be(48.5678m);
    }

    private sealed class SabitYanitIsleyicisi(string icerik) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(icerik)
            });
    }
}
