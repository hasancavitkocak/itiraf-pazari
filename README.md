# Anonim İtiraf Pazarı

Modern, Apple tarzı tasarımlı, anonim itiraf paylaşım platformu. 🚀

## Özellikler ✨

### Genel Özellikler
- ✅ Anonim gönderi paylaşımı..
- ✅ Kategoriler: Aşk, İş, Okul, Arkadaşlık, Gizli (Premium)
- ✅ Beğeni/Beğenmeme ve yorum sistemi
- ✅ Gönderi bildirme (5 bildiri = otomatik gizleme)
- ✅ Rate limiting: 5 gönderi/gün, 30 reaksiyon/gün
- ✅ Kötü kelime filtreleme
- ✅ Responsive Apple-style tasarım
- ✅ Dark/Light tema
- ✅ Framer Motion animasyonlar
- ✅ PWA (Progressive Web App) desteği
- ✅ Üniversite ve şehir bazlı filtreleme

### Premium Özellikler
- ✅ Reklamsız deneyim
- ✅ Özel kategorilere erişim
- ✅ Gönderi öne çıkarma (boost)
- ✅ 49 TL/ay veya 399 TL/yıl

### Admin Paneli
- ✅ Kullanıcı yönetimi (premium ekleme/çıkarma, banlama)
- ✅ Gönderi moderasyonu (gizleme, silme, görüntüleme)
- ✅ Ödeme yönetimi
- ✅ Analiz dashboard (kullanıcılar, gönderiler, gelir)
- ✅ SEO yönetimi (meta tags, robots.txt)
- ✅ Reklam yönetimi

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Supabase Ayarları

`.env` dosyanıza şu değişkenleri ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. PayTR Entegrasyonu (Opsiyonel)

PayTR ödeme sistemini kullanmak için `.env` dosyanıza ekleyin:

```env
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
```

**Not:** PayTR kimlik bilgileri olmadan platform çalışır, ancak ödeme fonksiyonları aktif olmaz.

### 4. Veritabanı

Supabase migration'ları otomatik oluşturuldu. Tüm tablolar ve RLS politikaları hazır.

### 5. İlk Admin Kullanıcısı

Bir kullanıcı oluşturduktan sonra, Supabase SQL Editor'de çalıştırın:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_ID';
```

## Geliştirme

```bash
npm run dev
```

Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Kullanım

### Kullanıcı İşlevleri

1. **Anonim Gönderi**: Ana sayfada form doldurun, kategori seçin ve paylaşın
2. **Beğenme/Beğenmeme**: Post kartlarında kalp ve thumbs down butonları
3. **Yorum Yapma**: Mesaj ikonu ile yorum dialogunu açın
4. **Bildirme**: Bayrak ikonu ile uygunsuz gönderileri bildirin
5. **Premium**: Header'da "Premium" butonu ile abonelik sayfasına gidin

### Admin İşlevleri

1. `/admin` adresine gidin (yalnızca admin kullanıcılar)
2. **Analiz**: Genel istatistikleri görüntüleyin
3. **Kullanıcılar**: Premium ekle/çıkar, kullanıcıları banla
4. **Gönderiler**: Gönderileri gizle/göster, sil, raporları görüntüle
5. **Ödemeler**: Tüm ödeme işlemlerini görüntüle
6. **SEO**: Site meta bilgilerini, robots.txt'yi düzenle
7. **Reklamlar**: Banner reklamları ekle/yönet

## Teknoloji Stack

- **Frontend**: Next.js 13, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payment**: PayTR
- **Deployment**: Vercel/Netlify uyumlu

## Güvenlik

- ✅ Row Level Security (RLS) tüm tablolarda aktif
- ✅ IP bazlı rate limiting
- ✅ Content filtering (bad words)
- ✅ SQL injection koruması (Supabase)
- ✅ XSS koruması (React)

## Abonelik Yönetimi

Admin panelinden kullanıcıların premium durumunu manuel olarak yönetebilirsiniz:

1. `/admin` > Kullanıcılar sekmesi
2. İstediğiniz kullanıcının yanında "Premium Ekle/Kaldır" butonu
3. Premium süresi otomatik 1 yıl eklenir

## Lisans

Bu proje ticari kullanım için hazırlanmıştır.

## Destek

Sorularınız için: admin@itirafpazari.com
