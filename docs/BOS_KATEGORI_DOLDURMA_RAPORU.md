# Boş kategori doldurma raporu

- Anlık görüntü sürümü: `2026.08.28-523fbf81`
- Toplam ürün: 12.244 (önce 12.000)
- Eklenen ürün: 244
- Doldurulan kategori: 61
- Üretici: 103 (önce 50)

Katalogda 74 yaprak kategoriden 62'si boştu; 12.000 ürünün tamamı 12 kategoriye
sıkışmıştı. Sebep `ozdisan-katalogunu-indir.mjs` içindeki `dengeliSec`: seçimi
ÜRETİCİ dengesine göre yapıyor, kategoriye göre değil.

`tools/bos-kategorileri-doldur.mjs` ters yönden çalışır — kategori başına hedef
adet toplar ve sonucu mevcut anlık görüntüye ekler, var olan ürünlere dokunmaz.

## Kabul ölçütü

Eklenen her ürün şunların üçünü birden taşır:

- gerçek ürün görseli (`cdn.ozdisan.com`),
- en az bir fiyat kademesi,
- en az bir teknik özellik.

Üçünden biri eksik olan aday hiç alınmadı. Görselsiz ürün vitrinde yer tutucu
gösterir, fiyatsız ürün sepete eklenemez, özelliksiz ürün filtre panelini boş
bırakır — böyle bir kategoriyi doldurmak boş bırakmaktan kötüdür.

## Kaynak yolu eşleştirmesi

Ana araç kategori yollarını tek bir vitrin sayfasından (`/p/466`) çıkarıyordu ve
oradan yalnızca 14 yol görünüyor. Bu araç kategori sitemap'ini kullanır:
`/sitemaps/category-tr-1.xml`, 909 yol.

Regex haritası 41 kategoriyi buldu; 21'i için elle doğrulanmış yol tanımlandı.
Ayrıca regex'in YANLIŞ eşleştirdiği kategoriler düzeltildi — alt dize eşleşmesi
sinsi çıktı:

| Kategori | Yanlış eşleşen | Sebep |
|---|---|---|
| `hucresel-modulleri` | devre kesiciler (şalterler) | "şa**lte**rler" içinde `lte` |
| `kristal-osilatorler` | kristalize güneş panelleri | `kristal` |
| `montaj-donanimlari` | tornavidalar | "torna**vida**lar" içinde `vida` |
| `anahtar-enkoderler` | step-down regülatörler | "**anahtar**lamalı" |
| `pil-sarj-entegreleri` | şarj cihazları | entegre değil, bitmiş cihaz |
| `guc-ledleri` | COB LED aksesuarları | alfabetik sırada aksesuar öne geçiyor |

## Kaynakta karşılığı olmayan

- `din-ray-guc-kaynaklari` — Özdisan DIN ray güç kaynağı satmıyor.
  `/ps/guc-kaynaklari-802` masaüstü laboratuvar cihazları taşıyor; oradan
  doldurmak kategoriyi yanlış ürünle doldurmak olurdu.

## Parametrik verisi olmayan kategoriler

Ürün ve görsel var, filtre paneli boş kalıyor — kaynak bu kategorilerde
kategorinin filtrelediği parametreleri hiç döndürmüyor:

| Kategori | Kaynağın döndürdüğü |
|---|---|
| `ac-dc-guc-kaynaklari` | Marka, Ürün Durumu, Paket Tipi |
| `kablo-yonetimi` | Marka, Ürün Durumu, Paket Tipi |
| `gelistirme-kartlari-urun` | Accessory Type, Function, Compliance |
| `kablo-kart-konnektorler` | Series, Housing Color |
| `programlayici-debugger` | Features |

Uydurma eşleme yapılmadı: serbest metin "Features" alanını `arayuz` tanımına
bağlamak filtreye yanlış değer yazmak olurdu.

`antenler` de bu listedeydi; `/ps/antenler-150` yalnızca "Features" döndürüyor.
Kaynak `/ps/rf-antenler-660` ile değiştirildi, artık Antenna Type / Frequency
Range / Operating Temperature geliyor.

## Doldurulan kategoriler

| Kategori | Eklenen |
|---|---:|
| `ac-dc-guc-kaynaklari` | 4 |
| `akim-sensorleri` | 4 |
| `anahtar-enkoderler` | 4 |
| `anahtarlamali-regulatorler` | 4 |
| `antenler` | 4 |
| `arayuz-entegreleri` | 4 |
| `arayuz-konnektorleri` | 4 |
| `basinc-sensorleri` | 4 |
| `bellek-entegreleri` | 4 |
| `dc-dc-konvertor-modulleri` | 4 |
| `elektrolitik-kondansatorler` | 4 |
| `fanlar` | 4 |
| `ferrit-boncuklar` | 4 |
| `film-kondansatorler` | 4 |
| `gate-suruculer` | 4 |
| `gaz-hava-kalitesi` | 4 |
| `gelistirme-kartlari-urun` | 4 |
| `gerilim-referanslari` | 4 |
| `gnss-modulleri` | 4 |
| `guc-bobinleri` | 4 |
| `guc-ledleri` | 4 |
| `hareket-imu-sensorleri` | 4 |
| `hucresel-modulleri` | 4 |
| `islemsel-yukseltecler` | 4 |
| `jumper-test-kablolari` | 4 |
| `kablo-kart-konnektorler` | 4 |
| `kablo-yonetimi` | 4 |
| `karsilastiricilar` | 4 |
| `kart-kart-konnektorler` | 4 |
| `kizilotesi-bilesenler` | 4 |
| `kristal-osilatorler` | 4 |
| `lcd-oled-ekranlar` | 4 |
| `lineer-regulatorler` | 4 |
| `lojik-entegreler` | 4 |
| `lora-subghz-modulleri` | 4 |
| `mikrodenetleyiciler` | 4 |
| `montaj-donanimlari` | 4 |
| `motor-suruculer` | 4 |
| `muhafazalar` | 4 |
| `optik-yakinlik-sensorleri` | 4 |
| `optokuplorler` | 4 |
| `pcb-klemensler` | 4 |
| `pil-sarj-entegreleri` | 4 |
| `piller-tutucular` | 4 |
| `potansiyometre-trimpotlar` | 4 |
| `programlayici-debugger` | 4 |
| `roleler` | 4 |
| `saat-zamanlayicilar` | 4 |
| `seramik-kondansatorler` | 4 |
| `serit-kablolar` | 4 |
| `sicaklik-nem-sensorleri` | 4 |
| `smd-direncler` | 4 |
| `smd-ledler` | 4 |
| `sogutucular` | 4 |
| `tactile-butonlar` | 4 |
| `tantal-kondansatorler` | 4 |
| `tht-direncler` | 4 |
| `tht-ledler` | 4 |
| `wifi-bluetooth-modulleri` | 4 |
| `yedi-segment-gostergeler` | 4 |
| `zener-diyotlar` | 4 |

## Yan bulgu: özellik etiketleri sayıya dönüyordu

Doldurma sırasında katalog genelini etkileyen bir hata bulundu.
`ozellikleriDonustur` `convertedValue` alanını `value`'dan önce alıyordu; kaynak

```json
{"key":"Package / Case","value":"TSSOP20","convertedValue":20}
```

döndürdüğü için kılıf adı `"20"` olarak saklanıyordu. Ölçüm (düzeltme öncesi):

| Özellik | Değer sayısı | Sadece sayı |
|---|---:|---:|
| `kilif` | 10.641 | %100 |
| `montaj_sekli` | 11.179 | %100 |
| `renk` | 638 | %100 — 638 üründe tek değer: `0` |
| `kanal_tipi` | 718 | %100 — tek değer: `0` |

Sıralama `value` önceliğine çevrildi, `None`/`N/A`/`0` değerleri elendi ve
`--ozellik-tazele` moduyla 12.158 ürünün özellikleri ürün seçimi değişmeden
yeniden çekildi. Sonrası: `kilif` 809 farklı gerçek paket adı, `renk` 35 renk,
`montaj_sekli` 37 değer, `kanal_tipi` `N-CH / P-CH / N-CH-P-CH`.

Ayrıca `OzdisanKatalogEsitleyici.OzellikleriGuncelle` yalnızca upsert yapıyordu:
kaynaktan düşen özelliğin satırı kalıcı oluyordu. Artık eşleşmeyen satırlar
siliniyor.

Bu dosyanın tablo dışı bölümleri elle yazılmıştır; sayısal özet
`tools/bos-kategorileri-doldur.mjs` her çalıştırıldığında yeniden üretilir.
