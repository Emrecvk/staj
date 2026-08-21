# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full Team

Kapsamlı Frontend Revizyonu: Mevcut Next.js (App Router) tabanlı e-ticaret platformunun (Çevik Elektronik) tüm kullanıcı arayüzünü (UI/UX) baştan sona gözden geçirerek www.ozdisan.com sitesinin düzenine, bileşen yapısına ve kullanıcı deneyimine (UX) benzeyecek şekilde geniş çaplı bir otonom ekiple (Full Team) yeniden tasarlamak ve kodlamak.

Working directory: c:\Users\ASUS\Desktop\Staj\frontend
Integrity mode: demo

## Requirements

### R1. Yapısal Benzerlik (Structural Match)
Tüm frontend mimarisini (Ana sayfa, mega menüler, ürün ızgaraları, gelişmiş filtreleme paneli, sepet ve ürün detay sayfa düzenleri) `www.ozdisan.com` adresindeki yapısal düzen ve UX akışına benzeyecek şekilde yeniden tasarlayın. 

### R2. Marka Kimliğini Koruma
Düzen ve yapı Özdisan'dan alınırken, renk paleti ve tipografi Çevik'in mevcut tasarım sistemine sadık kalmalıdır. Özdisan'ın renkleri (örn. kırmızı/siyah) kullanılmamalı; mevcut Lacivert (#0F2740) ve Camgöbeği (#00B4D8) renk ölçeği, yüzey token'ları ve Geist tipografisi korunmalıdır.

### R3. Yeni Özelliklerin Eklenmesi
Özdisan'da bulunan ancak mevcut sistemde olmayan (gelişmiş çok seviyeli mega menü, detaylı ürün karşılaştırma tabloları, spesifik sayfalama tasarımları vb.) yeni B2B bileşenlerini tespit edip sisteme entegre edin.

### R4. Dış Ağ Kısıtlaması (Infrastructure)
Referans amaçlı `www.ozdisan.com` sitesi incelenirken yalnızca sayfa yapısını (HTML/CSS DOM) anlamak için pasif istekler atılmalıdır. Siteye yük bindirecek tarama (crawling) işlemlerinden kaçınılmalıdır.

## Verification Resources
Mevcut Çevik frontend projesi `frontend` dizini altında yer almaktadır ve tasarım sistemi token'ları `globals.css` içinde tanımlıdır.

## Acceptance Criteria

### Görsel ve Yapısal Doğrulama (Agent-as-judge)
- [ ] Bağımsız bir "Agent-as-judge" aracı veya inceleme ekibi, dev server üzerinden sayfaların render edilmiş halini inceleyip, düzen ve yapının (layout/UX) Özdisan'a yüksek oranda benzediğini onaylamalıdır.

### Marka Standartları
- [ ] Kod analizi veya statik analiz araçları, yeni eklenen bileşenlerde Özdisan'ın orijinal renklerinin (örn. `#cc0000`) kullanılmadığını ve sadece Çevik token'larının kullanıldığını (örn. `bg-marka`, `text-vurgu`) doğrulamalıdır.

### Fonksiyonel Tamlık
- [ ] Yeni eklenen B2B özellikleri (Mega menü, gelişmiş katalog tabloları) hatasız çalışmalı ve `npm run build` komutu 0 hata ile tamamlanmalıdır.

---
*Next: when approved → delegate via invoke_subagent (see Delegation Protocol)*
