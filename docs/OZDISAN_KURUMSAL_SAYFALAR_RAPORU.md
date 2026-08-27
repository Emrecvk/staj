# Özdisan Kurumsal ve Yasal Sayfalar - Detaylı Rapor

Bu rapor, Çevik Elektronik (veya benzeri projeler) web sitesine eklenecek "Hakkımızda" ve "KVKK Politikası" sayfalarının detaylı içerik analizini sunmaktadır.

---

## 7. Hakkımızda
**URL:** `/hakkimizda`

**Sayfa Amacı:** Firmanın köklü geçmişini, global gücünü, sektörel başarılarını ve sunduğu çözümleri kurumsal bir dille ziyaretçilere ve potansiyel B2B müşterilerine aktarmak.

**Temel Metinler ve Sloganlar:**
*   **Ana Başlık:** Lider Elektronik Komponent Çözüm Ortağı
*   **Açıklama:** "1980 yılında İstanbul’da kurulan Özdisan, DMY Uluslararası Yatırım’ın bir parçasıdır. Temel faaliyetleri arasında elektronik komponent distribütörlüğü, Ar-Ge ve saha uygulama desteği, PCB tedariği, PCB-A üretimi, alüminyum soğutucu üretimi ve LED aydınlatma çözümleri yer almaktadır."

**Güçlü Yanlarımız (Özellik Kartları):**
*   Geniş Stok Çeşitliliği
*   Hızlı Tedarik Altyapısı
*   Teknik Destek & Proje Desteği
*   Online Sipariş
*   Üretim Planlaması
*   Anahtar Teslim Çözümler

**Öne Çıkan Bilgiler (İstatistik Kartları):**
*   **Global Erişim:** 100+ Ülke
*   **Çalışan Sayısı:** 375+
*   **Sipariş Sayısı (2025):** 95,000+
*   **Ürün Sayısı:** 1,000,000+
*   **Kategori Sayısı:** 1,100+
*   **Depolama Alanı:** 10,000 m²
*   **Müşteri Sayısı:** 58,000+
*   **Ofis & Depo Sayısı:** 11

**Eklenmesi Gereken Frontend Bileşenleri:**
*   **Hero Section:** Şirket tanıtım videosunu açan bir "Play" butonu (Modal ile açılan video player).
*   **Şirket Hakkında (About):** Görsel ve metin bloğu (Misyon/Vizyon).
*   **Hizmet Yönlendirmeleri:** Diğer çözüm sayfalarına giden 6'lı navigasyon/kart yapısı (Component: `News-module`).
*   **İstatistikler (Fast Facts):** 8'li grid şeklinde sayısal veriler.
*   **Sertifikalar (Certifications):** Kalite belgelerini gösteren slider veya liste.

---

## 8. KVKK Genel Aydınlatma Metni
**URL:** `/sozlesmeler/ozdisan-elektronik-kvkk-politikasi`

**Sayfa Amacı:** Yasal zorunluluklar kapsamında müşterileri, çalışanları ve ziyaretçileri Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca veri işleme süreçleri hakkında şeffaf bir şekilde bilgilendirmek.

**Temel Metinler ve Bölümler:**
*   **Ana Başlık:** Özdisan Elektronik KVKK Politikası
*   **Son Güncelleme Tarihi:** 02.02.2026
*   **Giriş (Bölüm 1):** 6698 Sayılı KVKK kapsamında verilerin hukuka uygun, doğru, belirli ve şeffaf işlendiğinin beyanı.
*   **Amaç ve Kapsam:** Müşteriler, çalışanlar, ziyaretçiler ve diğer paydaşların verilerinin korunması politikası.
*   **Güvenlik ve Tedbirler (Bölüm 2):** Verilerin hukuka aykırı erişimini engellemek için alınan İdari (Eğitimler, şirket içi denetim, sözleşmeler vb.) ve Teknik (Virüs koruma, firewall, erişim yetkilendirme, yedekleme) tedbirler detaylandırılmış.

**Eklenmesi Gereken Frontend Bileşenleri:**
*   **Sidebar Menü (Policies):** Sol tarafta "KVKK Aydınlatma Metinleri", "Gizlilik Politikası ve Sözleşmeler", "Politikalar" gibi hukuki sayfalar arası geçişi sağlayan dikey navigasyon (Accordion / List).
*   **İçerik Alanı:** Uzun metinlerin okunabilirliğini artıracak, başlık hiyerarşisine (H1, H2, H3) sahip tipografik metin kutusu.
*   **Tarih Etiketi:** "Son Güncelleme" tarihini belirten ufak bir badge veya text alanı.

---

## Geliştirici Notları
*   **Hakkımızda Sayfası:** Rakamların ön planda olduğu, ziyaretçiye güven aşılayan prestijli bir sayfa tasarımı gerektiriyor. Video Modal, Slider ve Grid yapılarından (Örn: Tailwind `grid-cols-2` / `grid-cols-4`) sıkça faydalanılmalıdır.
*   **Yasal Sayfalar:** KVKK gibi sayfalar SEO ve Hukuki gereklilikler sebebiyle düz metin (Rich Text / Markdown) render eden basit layoutlara oturtulmalıdır. Sol sidebar kullanılarak diğer yasal metinlere hızlı geçiş verilmesi User Experience (UX) açısından önemlidir.
