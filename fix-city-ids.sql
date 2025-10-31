-- Şehir ID'lerini Türkiye plaka kodlarına göre düzelt

-- Önce mevcut şehir verilerini kontrol et
SELECT id, name FROM cities WHERE name IN (
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 
  'Konya', 'Gaziantep', 'Kayseri', 'Mersin', 'Eskişehir', 
  'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa', 'Adapazarı', 
  'Malatya', 'Kahramanmaraş', 'Erzurum', 'Van'
) ORDER BY name;

-- Geçici tablo oluştur doğru ID'lerle
CREATE TEMP TABLE correct_city_ids AS VALUES
  (1, 'Adana'),
  (6, 'Ankara'),
  (7, 'Antalya'),
  (16, 'Bursa'),
  (20, 'Denizli'),
  (21, 'Diyarbakır'),
  (25, 'Erzurum'),
  (26, 'Eskişehir'),
  (27, 'Gaziantep'),
  (33, 'Mersin'),
  (34, 'İstanbul'),
  (35, 'İzmir'),
  (38, 'Kayseri'),
  (42, 'Konya'),
  (44, 'Malatya'),
  (46, 'Kahramanmaraş'),
  (54, 'Adapazarı'),
  (55, 'Samsun'),
  (63, 'Şanlıurfa'),
  (65, 'Van');

-- Mevcut şehirleri güncelle (eğer farklı ID'leri varsa)
-- Önce foreign key constraint'leri geçici olarak devre dışı bırak
ALTER TABLE posts DISABLE TRIGGER ALL;
ALTER TABLE districts DISABLE TRIGGER ALL;

-- Şehir ID'lerini güncelle
UPDATE cities 
SET id = correct_city_ids.column1 
FROM (VALUES
  (1, 'Adana'),
  (6, 'Ankara'),
  (7, 'Antalya'),
  (16, 'Bursa'),
  (20, 'Denizli'),
  (21, 'Diyarbakır'),
  (25, 'Erzurum'),
  (26, 'Eskişehir'),
  (27, 'Gaziantep'),
  (33, 'Mersin'),
  (34, 'İstanbul'),
  (35, 'İzmir'),
  (38, 'Kayseri'),
  (42, 'Konya'),
  (44, 'Malatya'),
  (46, 'Kahramanmaraş'),
  (54, 'Adapazarı'),
  (55, 'Samsun'),
  (63, 'Şanlıurfa'),
  (65, 'Van')
) AS correct_city_ids(column1, column2)
WHERE cities.name = correct_city_ids.column2;

-- Trigger'ları tekrar aktif et
ALTER TABLE posts ENABLE TRIGGER ALL;
ALTER TABLE districts ENABLE TRIGGER ALL;

-- Sonucu kontrol et
SELECT id, name FROM cities WHERE name IN (
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 
  'Konya', 'Gaziantep', 'Kayseri', 'Mersin', 'Eskişehir', 
  'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa', 'Adapazarı', 
  'Malatya', 'Kahramanmaraş', 'Erzurum', 'Van'
) ORDER BY id;
