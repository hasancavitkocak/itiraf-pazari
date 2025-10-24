# Google AdSense Kurulum Rehberi

## 1. Google AdSense Hesabı Oluşturma

1. [Google AdSense](https://www.google.com/adsense/) sitesine git
2. "Başlayın" butonuna tıklayın
3. Web sitenizi ekleyin: `https://yourdomain.com`
4. Ülkenizi seçin (Türkiye)
5. Hesap türünü seçin (Bireysel/İşletme)

## 2. Site Onayı Süreci

1. AdSense hesabınızı oluşturduktan sonra site onayı bekleyeceksiniz
2. Bu süreç 1-14 gün arasında sürebilir
3. Sitenizde yeterli içerik olması gerekir (en az 20-30 kaliteli gönderi)
4. Gizlilik politikası ve kullanım şartları sayfaları olmalı ✅ (zaten var)

## 3. AdSense Kodunu Ekleme

Onay aldıktan sonra:

1. AdSense dashboard'ından Publisher ID'nizi alın (ca-pub-XXXXXXXXXXXXXXXXX formatında)
2. `.env` dosyasına ekleyin:
```
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXXX
```

## 4. Reklam Birimlerini Oluşturma

1. AdSense dashboard → "Reklamlar" → "Reklam birimleri"
2. "Yeni reklam birimi oluştur" → "Görüntülü reklamlar"
3. İki reklam birimi oluşturun:
   - **Header Banner**: Yatay format (728x90 veya responsive)
   - **Footer Banner**: Dikdörtgen format (300x250 veya responsive)

## 5. Reklam Slot ID'lerini Güncelleme

Oluşturduğunuz reklam birimlerinin slot ID'lerini alın ve kodda güncelleyin:

### Header Reklamı
`components/header.tsx` dosyasında:
```tsx
<GoogleAdSense 
  adSlot="HEADER_SLOT_ID_BURAYA" 
  adFormat="horizontal"
/>
```

### Footer Reklamı
`components/footer.tsx` dosyasında:
```tsx
<GoogleAdSense 
  adSlot="FOOTER_SLOT_ID_BURAYA" 
  adFormat="rectangle"
/>
```

## 6. Test Etme

1. Değişiklikleri deploy edin
2. Sitenizi ziyaret edin
3. Reklamların görünüp görünmediğini kontrol edin
4. İlk reklamların görünmesi 24-48 saat sürebilir

## 7. Önemli Notlar

- ❌ Kendi reklamlarınıza tıklamayın (hesap kapatılabilir)
- ✅ Kaliteli içerik üretmeye devam edin
- ✅ Site hızını kontrol edin (reklamlar yavaşlatabilir)
- ✅ Mobil uyumluluğu test edin
- ✅ GDPR uyumluluğu için çerez politikası ekleyin

## 8. Gelir Takibi

AdSense dashboard'dan günlük gelirlerinizi takip edebilirsiniz:
- Tıklama oranları (CTR)
- Bin gösterim başına gelir (RPM)
- Toplam kazanç

## Alternatif Reklam Ağları

AdSense onayı alamazsanız:
- Media.net
- PropellerAds
- Ezoic
- AdThrive (yüksek trafik gerekli)