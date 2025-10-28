-- Doğru şehir ID'lerini sağla (güvenli yaklaşım)

-- Önce mevcut şehirleri kontrol et
SELECT 'Mevcut şehirler:' as info;
SELECT id, name FROM cities ORDER BY id;

-- Doğru ID'lere sahip şehirleri ekle (conflict durumunda güncelle)
INSERT INTO cities (id, name) VALUES
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
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name;

-- Sonucu kontrol et
SELECT 'Güncellenmiş şehirler:' as info;
SELECT id, name FROM cities WHERE id IN (1,6,7,16,20,21,25,26,27,33,34,35,38,42,44,46,54,55,63,65) ORDER BY id;