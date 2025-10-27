# Yük Testi Rehberi

Bu rehber, sitenin performansını test etmek için kullanılabilecek yük testi araçlarını açıklar.

## 🚀 Hızlı Test

### 1. Basit Node.js Testi
```bash
# scripts/load-test.js dosyasında URL'i güncelle
npm run load-test
```

### 2. Artillery ile Hızlı Test
```bash
# 50 istek, 10 eş zamanlı kullanıcı
npm run load-test:quick -- https://your-site-url.com
```

## 📊 Detaylı Test

### Artillery ile Profesyonel Test
```bash
# load-test-config.yml dosyasında URL'i güncelle
npm run load-test:artillery
```

## ⚙️ Konfigürasyon

### 1. Basit Test (scripts/load-test.js)
```javascript
const config = {
  url: 'https://your-site-url.com', // Site URL'ini buraya gir
  concurrent: 10,     // Eş zamanlı istek sayısı
  totalRequests: 100, // Toplam istek sayısı
  timeout: 10000      // Timeout (ms)
};
```

### 2. Artillery Test (load-test-config.yml)
```yaml
config:
  target: 'https://your-site-url.com'  # Site URL'ini buraya gir
  phases:
    - duration: 60    # Test süresi (saniye)
      arrivalRate: 10 # Saniyede yeni kullanıcı sayısı
      rampTo: 50      # Hedef kullanıcı sayısı
```

## 📈 Test Senaryoları

### 1. Isınma Testi (30 saniye)
- 1-5 eş zamanlı kullanıcı
- Sistem ısınması için

### 2. Normal Yük (60 saniye)
- 5-20 eş zamanlı kullanıcı
- Günlük normal trafiği simüle eder

### 3. Yoğun Yük (60 saniye)
- 20-50 eş zamanlı kullanıcı
- Yoğun saatleri simüle eder

### 4. Pik Yük (30 saniye)
- 50-100 eş zamanlı kullanıcı
- Viral içerik durumunu simüle eder

### 5. Soğuma (30 saniye)
- 100-10 eş zamanlı kullanıcı
- Sistem stabilizasyonu

## 🎯 Test Edilen Endpoint'ler

- `GET /` - Ana sayfa
- `GET /api/posts` - Gönderi listesi
- `GET /api/categories` - Kategori listesi
- `GET /api/posts/[id]` - Tekil gönderi
- `GET /api/comments` - Yorumlar
- `GET /contact` - İletişim sayfası
- `GET /privacy` - Gizlilik sayfası
- `GET /terms` - Kullanım şartları
- `GET /sss` - SSS sayfası

## 📊 Performans Metrikleri

### ✅ İyi Performans
- **Başarı oranı**: >99%
- **Ortalama yanıt süresi**: <500ms
- **95. yüzdelik**: <1000ms
- **İstek/saniye**: >100 RPS

### ⚠️ Kabul Edilebilir Performans
- **Başarı oranı**: >95%
- **Ortalama yanıt süresi**: <1000ms
- **95. yüzdelik**: <2000ms
- **İstek/saniye**: >50 RPS

### 🔴 Optimizasyon Gerekli
- **Başarı oranı**: <90%
- **Ortalama yanıt süresi**: >2000ms
- **95. yüzdelik**: >5000ms
- **İstek/saniye**: <25 RPS

## 🛠️ Optimizasyon Önerileri

### Veritabanı
- Connection pooling kullan
- Query optimizasyonu yap
- Index'leri kontrol et
- Slow query log'larını incele

### Caching
- Redis cache ekle
- CDN kullan
- Browser caching optimize et
- API response caching

### Server
- Load balancer ekle
- Auto-scaling yapılandır
- Resource monitoring ekle
- Error tracking sistemi kur

### Frontend
- Image optimization
- Code splitting
- Lazy loading
- Bundle size optimization

## 📝 Test Raporu Örneği

```
📈 YÜK TESTİ SONUÇLARI
========================
⏱️  Toplam süre: 210000ms (210.00s)
📊 Toplam istek: 1000
✅ Başarılı: 995 (99.5%)
❌ Başarısız: 5 (0.5%)
⏰ Timeout: 2

🕐 YANIT SÜRESİ İSTATİSTİKLERİ
==============================
📊 Ortalama: 245.67ms
⚡ En hızlı: 89ms
🐌 En yavaş: 1234ms
📈 95. yüzdelik: 456ms
🚀 İstek/saniye: 4.74 RPS

🎯 PERFORMANS DEĞERLENDİRMESİ
=============================
🟢 Mükemmel! Site yüksek yük altında çok iyi performans gösteriyor.
```

## 🔧 Kurulum

### Artillery Kurulumu (Opsiyonel)
```bash
npm install -g artillery
```

### Kullanım
```bash
# URL'leri güncelle
# scripts/load-test.js -> config.url
# load-test-config.yml -> config.target

# Test çalıştır
npm run load-test
npm run load-test:artillery
```