# Çevik - B2B E-Ticaret ve RFQ Platformu

Bu proje, gelişmiş katalog yönetimi, B2B sipariş süreçleri ve teklif/RFQ modülüne sahip kapsamlı bir .NET API uygulamasıdır.

## 🚀 Yerel Kurulum

Yerel ortamda projeyi çalıştırmak için aşağıdaki bileşenlerin sisteminizde kurulu olması gerekmektedir:
- **.NET 10.0 SDK**
- **PostgreSQL 17**
- **Redis**

### Adımlar

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/your-username/cevik.git
   cd cevik
   ```

2. Gerekli veritabanı ayarlarını ve gizli dizileri yapılandırın. `src/Cevik.Api/appsettings.json` dosyasını kendi ortamınıza göre güncelleyin veya `appsettings.Development.json` oluşturun.

3. EF Core araçları (gerekirse) ile veritabanını güncelleyin:
   ```bash
   dotnet ef database update --project src/Cevik.Altyapi --startup-project src/Cevik.Api
   ```
   *Not: Proje başlatıldığında otomatik migration ve seeding (örnek veri oluşturma) aktif olarak çalışır.*

4. Projeyi çalıştırın:
   ```bash
   dotnet run --project src/Cevik.Api
   ```

## 🐳 Docker ile Çalıştırma

Projeyi hızlıca test etmek veya production benzeri bir ortamda çalıştırmak için Docker Compose kullanabilirsiniz.

Tüm servisleri (PostgreSQL, Redis ve API) ayağa kaldırmak için:

```bash
docker-compose up -d --build
```

Container'lar ayağa kalktıktan sonra API otomatik olarak migration ve seed işlemlerini gerçekleştirecektir.

## 🧪 Testler

Proje kapsamlı bir şekilde birim (Unit) ve entegrasyon (Integration) testleri ile korunmaktadır. 
Entegrasyon testleri bağımlılıkları yalıtmak için **Testcontainers** kütüphanesini kullanır ve gerçek bir PostgreSQL konteyneri ayağa kaldırır.

Tüm testleri çalıştırmak için:
```bash
dotnet test
```

Veya belirli bir test grubunu çalıştırmak için:
```bash
dotnet test tests/Cevik.BirimTestleri
dotnet test tests/Cevik.EntegrasyonTestleri
```

## 📍 Servis Adresleri

Servisler yerel ortamda veya Docker üzerinde başlatıldığında varsayılan adresleri:

- **API Base URL**: `http://localhost:5000`
- **Swagger Arayüzü**: `http://localhost:5000/swagger`
- **Health Check**: `http://localhost:5000/saglik`
- **PostgreSQL DB**: `localhost:5432` (Docker ile başlatıldığında varsayılan olarak `cevik` veritabanı, `cevik` kullanıcısı ve `cevik_gelistirme_parolasi` şifresi geçerlidir.)
- **Redis**: `localhost:6379`

## 🔄 CI / CD

Depoda GitHub Actions aracılığıyla yapılandırılmış otomatik bir CI süreci bulunmaktadır:
- Her *push* ve *pull request* işleminde projeyi derler.
- Birim ve entegrasyon testlerini otomatik çalıştırır.
- Sonuçları analiz için çıkarır.
- Docker imajını doğrulamak için `docker build` sürecini test eder.
- Dependabot ile NuGet, npm ve Actions paket güncellemelerini takip eder.
