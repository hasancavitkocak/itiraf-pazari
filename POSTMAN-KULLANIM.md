# İtiraf Pazarı - Postman Collection Kullanım Kılavuzu

## Collection'ı İçe Aktarma

1. Postman'i aç
2. Sol üst köşedeki **Import** butonuna tıkla
3. `itiraf-pazari-postman-collection.json` dosyasını seç
4. Import'a tıkla

## Environment Değişkenleri

Collection'da 3 değişken tanımlı:

- `base_url`: Production URL (https://itirafpazari.com)
- `local_url`: Local development URL (http://localhost:3000)
- `auth_token`: Kullanıcı authentication token'ı (opsiyonel)

### URL Değiştirme

Request'lerde `{{base_url}}` kullanılıyor. Local'de test etmek için:
- Request URL'de `{{base_url}}` yerine `{{local_url}}` yazın
- VEYA collection variables'da `base_url` değerini `http://localhost:3000` olarak değiştirin

## Yeni İtiraf Oluşturma

### Endpoint
```
POST /api/posts
```

### Request Body
```json
{
  "title": "İtiraf Başlığı",
  "content": "İtiraf içeriği buraya yazılır. Maksimum 2000 karakter.",
  "categoryId": "1",
  "cityId": "34",
  "districtId": null,
  "universityId": null,
  "customLocation": null
}
```

### Parametreler

**Zorunlu:**
- `title`: İtiraf başlığı (max 100 karakter)
- `content`: İtiraf içeriği (max 2000 karakter)
- `categoryId`: Kategori ID'si (string)

**Opsiyonel:**
- `cityId`: Şehir ID'si
- `districtId`: İlçe ID'si
- `universityId`: Üniversite ID'si
- `customLocation`: Özel konum metni

### Kategori ID'leri

Önce kategorileri listeleyerek ID'leri öğrenin:
```
GET /api/categories
```

Yaygın kategoriler:
- `1`: Aşk
- `2`: Arkadaşlık
- `3`: Aile
- `4`: İş
- `5`: Okul
- `6`: Cinsellik
- `7`: Kayıp Eşya
- `8`: Havadan Sudan
- `9`: Gizli

### Şehir ID'leri

Şehirleri listelemek için:
```
GET /api/cities
```

Örnek şehir ID'leri:
- `34`: İstanbul
- `6`: Ankara
- `35`: İzmir

## Örnek Kullanım Senaryoları

### 1. Basit İtiraf (Sadece Zorunlu Alanlar)

```json
{
  "title": "Bugün çok mutluyum",
  "content": "Hayatımda ilk defa bu kadar mutlu hissettim. Paylaşmak istedim.",
  "categoryId": "8"
}
```

### 2. Şehir Bazlı İtiraf

```json
{
  "title": "İstanbul'da yaşamak",
  "content": "İstanbul'da yaşamanın zorluklarını anlatmak istiyorum...",
  "categoryId": "8",
  "cityId": "34"
}
```

### 3. Üniversite İtirafı

```json
{
  "title": "Kampüste yaşananlar",
  "content": "Üniversitede başımdan geçen ilginç bir olay...",
  "categoryId": "5",
  "universityId": "1"
}
```

### 4. Özel Konum ile İtiraf

```json
{
  "title": "Mahalle kahvesinde",
  "content": "Mahalle kahvesinde yaşanan komik bir anı...",
  "categoryId": "8",
  "customLocation": "Kadıköy Mahalle Kahvesi"
}
```

## Authentication (Opsiyonel)

Eğer kullanıcı girişi yapmak isterseniz:

1. Supabase'den auth token alın
2. Collection variables'da `auth_token` değişkenine token'ı ekleyin
3. Request header'a otomatik eklenecek:
   ```
   Authorization: Bearer {{auth_token}}
   ```

## Diğer Endpoint'ler

### İtirafları Listele
```
GET /api/posts?page=1&limit=10&sort=newest
```

Query parametreleri:
- `page`: Sayfa numarası (default: 1)
- `limit`: Sayfa başına kayıt (default: 6)
- `sort`: Sıralama (newest, popular, trending)
- `category`: Kategori slug'ı (ask, arkadaslik, vb.)
- `city`: Şehir slug'ı (istanbul, ankara, vb.)
- `search`: Arama terimi

### Yorum Ekle
```
POST /api/comments
```

Body:
```json
{
  "post_id": "123",
  "content": "Yorum içeriği",
  "parent_id": null
}
```

### Beğeni/Beğenmeme
```
POST /api/reactions
```

Body:
```json
{
  "post_id": "123",
  "reaction_type": "like"
}
```

## Rate Limiting

API'de rate limiting var. Çok fazla istek gönderirseniz 429 hatası alabilirsiniz.

## Hata Kodları

- `400`: Bad Request - Eksik veya hatalı parametre
- `401`: Unauthorized - Authentication gerekli
- `429`: Too Many Requests - Rate limit aşıldı
- `500`: Internal Server Error - Sunucu hatası

## Test Etme İpuçları

1. **Önce kategorileri listeleyin** - Hangi kategorilerin olduğunu görün
2. **Şehirleri kontrol edin** - Geçerli şehir ID'lerini öğrenin
3. **Kısa içeriklerle test edin** - Önce basit itiraflar oluşturun
4. **Yasaklı kelimelerden kaçının** - Sistem otomatik filtreliyor

## Destek

Sorun yaşarsanız:
- GitHub Issues: [Repo linki]
- İletişim: `/api/contact` endpoint'ini kullanın
