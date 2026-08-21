# Search Engine Evaluation: PostgreSQL vs Meilisearch / Elasticsearch

Çevik B2B E-Ticaret projesi için katalog arama altyapısı değerlendirmesi.

## 1. Mevcut Durum: PostgreSQL ILIKE + trigram

> **Düzeltme:** Bu bölüm önceki sürümde sistemin `tsvector`/`tsquery` tabanlı
> Full Text Search kullandığını söylüyordu. Kod tabanında `tsvector` YOKTUR.
> Arama `KatalogServisi` içinde `EF.Functions.ILike` ile, normalize edilmiş
> ürün kodu ve kısa açıklama üzerinde yapılır; hız trigram (`pg_trgm`)
> indeksinden gelir. Değerlendirme bu gerçek duruma göre yazılmıştır.

Şu anda sistem arama ve filtreleme için PostgreSQL'in `ILIKE` operatörünü ve trigram (`pg_trgm`) indekslerini kullanmaktadır. Parametrik filtreler `jsonb` üzerinden, kategori ağacı ise `ltree` ile çözülür.

**Avantajları:**
- **Teknoloji Yığını Sadeliği:** Ekstra bir veritabanı veya arama motoru bakım maliyeti (RAM, CPU, yedekleme) yoktur.
- **Gerçek Zamanlı Veri (Consistency):** Ürün verisi güncellendiği anda arama sonuçlarına anında yansır; asenkron veri senkronizasyon (ETL) gecikmesi yoktur.
- **Beklenen Performans:** Doğru trigram (`pg_trgm`) ve GIN indeksleriyle bu ölçekte ms seviyesinde sonuç dönmesi beklenir. **Bu rakam ölçülmemiştir**, sektör deneyimine dayanan bir beklentidir.

**Dezavantajları:**
- **Faceted Search (Filtre Gruplama) Zorluğu:** Çok fazla parametrik filtre seçildiğinde ve her bir facet (örn. Üretici, Kılıf) sayısının anlık (count) hesaplanması gerektiğinde RDBMS mimarisi `GROUP BY` yüzünden yavaşlamaya (table scan) meyillidir.
- **Typo Tolerance (Yazım Hatası Toleransı):** `pg_trgm` benzerlik bulsa da Meilisearch kadar doğal ve "out-of-the-box" çalışmaz.
- **Sıralama (Relevance Ranking):** `ILIKE` bir alaka skoru üretmez; sonuçlar alaka düzeyine göre sıralanamaz. FTS'e (`ts_rank`) geçmek bunu çözer ve harici motora göre çok daha ucuzdur.

---

## 2. Meilisearch Değerlendirmesi
Özellikle "Typo-tolerant" yapısı ve saniyeden çok daha kısa sürede sonuç vermesiyle bilinen, e-ticaret sitelerinde çok popüler bir Rust tabanlı arama motoru.

**Avantajları:**
- İnanılmaz hızlı (genellikle <50ms) arama ve Faceted Search performansı.
- Gelişmiş typo-tolerance (Yazım hatası toleransı).
- Hızlı kurulum ve kolay REST API entegrasyonu.
- Çok az bellek (RAM) tüketimi (Elasticsearch'e kıyasla).

**Dezavantajları:**
- Ürün verilerinin (Özellikle stok ve kademeli fiyatların) PostgreSQL'den Meilisearch'e senkronize edilmesi gerekir. Kademeli fiyatlar değişkendir ve bu senkronizasyon karmaşıklık yaratır.
- High Availability (Cluster) yetenekleri Elasticsearch kadar olgun değildir.

---

## 3. Elasticsearch / OpenSearch Değerlendirmesi
Devasa veri kümeleri için endüstri standardı.

**Avantajları:**
- Milyarlarca kayıtta bile yatay ölçeklenebilir (Scalable).
- Aggregation framework sayesinde faceted search çok yetenekli ve performanslıdır.
- Log yönetimi (ELK stack) için de kullanılabilir.

**Dezavantajları:**
- JVM tabanlıdır, çok fazla RAM ve CPU gerektirir. Küçük/orta projelerde "overkill" (gereksiz fazla) olarak nitelendirilir.
- Öğrenme eğrisi ve bakım/yönetim maliyeti (DevOps) çok yüksektir.

---

## 4. Karar ve Sonuç
**Ölçüm durumu — dürüst kayıt:** `tests/load-tests/catalog-search-test.js` altında bir k6 senaryosu hazırlanmıştır, ancak **HENÜZ ÇALIŞTIRILMAMIŞTIR**; ortamda k6 kurulu değildir ve elimizde bir sonuç dosyası yoktur. Dolayısıyla aşağıdaki karar ölçüme değil, ölçümün *maliyet/fayda* değerlendirmesine dayanmaktadır.

Bu, Görev 16 madde 7'nin ("PostgreSQL ile arama performansını ölçmeden harici arama motoruna geçme") gereğini karşılar: **geçiş yapılmamıştır**. Ama ters yönde de bir iddiada bulunulmamalıdır — mevcut altyapının yeterli olduğu ölçülerek kanıtlanmış değildir.

**Nihai Karar:**
Sisteme şimdilik Meilisearch veya Elasticsearch **EKLENMEMESİNE** karar verilmiştir.
Veri senkronizasyon maliyeti (özellikle B2B'de sürekli değişen stok ve kademeli fiyatların anlık güncellenmesi ihtiyacı) mevcut ölçekte harici bir arama motorunun getirisinden ağır basmaktadır.

**Geçişten önce yapılacaklar (sırayla):**
1. k6 senaryosunu gerçek veri hacmiyle çalıştırıp p95 gecikmesini ölç.
2. Yetersizse önce PostgreSQL içinde kal: `tsvector` + `ts_rank` ekle, facet sorgularını materialized view ile önbelleğe al.
3. Bunlar da yetmezse **Meilisearch** ilk tercih olsun.

**Geçiş eşiği:** facet sorgularında p95 > 500ms veya ürün sayısı 1 milyonu aşarsa.
