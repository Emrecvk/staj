# Search Engine Evaluation: PostgreSQL vs Meilisearch / Elasticsearch

Çevik B2B E-Ticaret projesi için katalog arama altyapısı değerlendirmesi.

## 1. Mevcut Durum: PostgreSQL Full Text Search (FTS)
Şu anda sistem arama ve filtreleme işlemleri için PostgreSQL'in sunduğu yetenekleri (`tsvector`, `tsquery`, ILIKE ve indeksler) kullanmaktadır.

**Avantajları:**
- **Teknoloji Yığını Sadeliği:** Ekstra bir veritabanı veya arama motoru bakım maliyeti (RAM, CPU, yedekleme) yoktur.
- **Gerçek Zamanlı Veri (Consistency):** Ürün verisi güncellendiği anda arama sonuçlarına anında yansır; asenkron veri senkronizasyon (ETL) gecikmesi yoktur.
- **Yeterli Performans (100k - 500k satır için):** Doğru trigram (`pg_trgm`) ve GIN indeksleriyle 1 milyona kadar ürün skalasında ms seviyesinde (50-200ms) sonuç döndürebilir.

**Dezavantajları:**
- **Faceted Search (Filtre Gruplama) Zorluğu:** Çok fazla parametrik filtre seçildiğinde ve her bir facet (örn. Üretici, Kılıf) sayısının anlık (count) hesaplanması gerektiğinde RDBMS mimarisi `GROUP BY` yüzünden yavaşlamaya (table scan) meyillidir.
- **Typo Tolerance (Yazım Hatası Toleransı):** Doğrudan desteklemez, `pg_trgm` ile benzerlik bulunsa da Meilisearch kadar doğal ve "out-of-the-box" çalışmaz.

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
Projeyi incelerken **Mevcut PostgreSQL altyapısının limitlerine ulaşılmadığını** gözlemledik. (Performans/Yük testleri PostgreSQL GIN indekslerinin şu anki B2B trafiğinde yeterli olduğunu gösteriyor).

**Nihai Karar:** 
Sisteme şimdilik Meilisearch veya Elasticsearch **EKLENMEMESİNE** karar verilmiştir. 
Veri senkronizasyon maliyeti (Özellikle B2B'de sürekli değişen stok ve fiyatların anlık güncellenmesi ihtiyacı) şu anki ölçekte harici bir arama motoru getirisinden daha ağırdır. İlerleyen aşamalarda ürün gamı 1 Milyon+ üzerine çıktığında veya Faceted Search sorguları 500ms'yi aştığında **Meilisearch** entegrasyonu ilk tercih olacaktır.
