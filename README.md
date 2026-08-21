# Çevik - B2B E-Ticaret ve RFQ Platformu

Bu proje, gelişmiş katalog yönetimi, B2B sipariş süreçleri ve teklif/RFQ modülüne sahip kapsamlı bir Full Stack E-Ticaret uygulamasıdır. Backend .NET 10 ile, Frontend ise Next.js 15+ ve React 19 ile geliştirilmiştir.

## 🚀 Proje Bileşenleri

- **Backend API**: .NET 10.0 (C# 13), PostgreSQL, Redis, Entity Framework Core, JWT Kimlik Doğrulama
- **Frontend (Web)**: Next.js (App Router), React, Tailwind CSS, TypeScript
- **Altyapı**: Docker & Docker Compose (PostgreSQL, Redis, PgAdmin, API Container, Frontend Container)

## 🐳 Docker ile Uçtan Uca (Full Stack) Çalıştırma

Projeyi production benzeri bir ortamda tüm bileşenleriyle (veritabanı, önbellek, backend ve frontend) tek bir komutla ayağa kaldırabilirsiniz.

Kök dizinde yer alan `docker-compose.yml` dosyasını kullanarak:

```bash
# İlk kurulumda örnek environment dosyasını oluşturun (varsa .env.example'ı kopyalayın)
# .env dosyasındaki POSTGRES_PASSWORD ve JWT_KEY değerlerini doldurun.

# Tüm servisleri ayağa kaldırın:
docker-compose up -d --build
```

Container'lar ayağa kalktığında otomatik gerçekleşecek işlemler:
1. PostgreSQL ve Redis başlatılır ve `healthcheck` mekanizmalarıyla hazır olmaları beklenir.
2. Backend API başlatılır, veritabanına bağlanıp otomatik Migration ve Seed (Örnek Veri) işlemlerini tamamlar.
3. Frontend uygulaması `NEXT_PUBLIC_API_URL` argümanı ile build edilir ve API'ye bağlanacak şekilde çalışmaya başlar.

## 📍 Servis Adresleri (Docker Compose)

- **Frontend Arayüzü**: [http://localhost:3000](http://localhost:3000) (Kullanıcı arayüzü ve Yönetim paneli)
- **API Base URL**: `http://localhost:5000`
- **Swagger Dokümantasyonu**: [http://localhost:5000/swagger](http://localhost:5000/swagger)
- **Health Check (Backend)**: [http://localhost:5000/saglik](http://localhost:5000/saglik)
- **PgAdmin (Veritabanı Yönetimi)**: [http://localhost:5050](http://localhost:5050)

## 💻 Yerel (Local) Geliştirme Ortamı

Docker kullanmadan geliştirme yapmak için:

### Backend
```bash
dotnet restore Cevik.slnx
dotnet run --project src/Cevik.Api
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
*(Frontend `localhost:3000` üzerinde, Backend `localhost:5000` üzerinde çalışacaktır)*

## 🧪 Testler ve QA

**Backend Testleri**:
Birim ve Entegrasyon testleri Testcontainers kütüphanesi kullanarak gerçek izole ortamlar oluşturur.
```bash
dotnet test Cevik.slnx
```

**Frontend (Next.js)**:
Kod kalitesi denetimi ve üretim derlemesi (production build) doğrulaması için:
```bash
cd frontend
npm run lint
npm run build
```

## 🔐 Yönetim Paneli

Yönetim ekranlarına `/yonetim` adresi üzerinden erişilebilir. Yönetim ekranları; Admin yetkisine sahip hesaplar ile giriş yapıldığında ürün ekleme/düzenleme, sipariş durumu takibi, kurumsal firma başvuru onayı ve gelen teklif taleplerini fiyatlandırma özelliklerini içerir. Rotalar Next.js Middleware (`proxy.ts`) ile korunmaktadır.

## 📦 Son Sürüm Notları
Projenin uçtan uca B2B satın alma akışı (Katalog -> Sepet -> Teslimat/Fatura Adresi -> Sipariş Tamamlama / Teklif İsteme) tamamlanmış, Docker Compose üzerinden dağıtıma (delivery) hazır hale getirilmiştir.
