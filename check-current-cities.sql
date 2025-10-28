-- Mevcut şehir durumunu kontrol et

-- Tüm şehirleri listele
SELECT id, name FROM cities ORDER BY name;

-- SEO listesindeki şehirlerin mevcut ID'lerini bul
SELECT id, name FROM cities WHERE name IN (
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 
  'Konya', 'Gaziantep', 'Kayseri', 'Mersin', 'Eskişehir', 
  'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa', 'Adapazarı', 
  'Malatya', 'Kahramanmaraş', 'Erzurum', 'Van'
) ORDER BY name;