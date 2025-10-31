-- Basit şehir düzeltmesi (sadece eksik olanları ekle)

-- Önce mevcut şehirleri kontrol et
SELECT id, name FROM cities WHERE name IN ('İstanbul', 'Ankara', 'İzmir') ORDER BY id;

-- Sadece eksik şehirleri ekle (ID conflict olursa ignore et)
INSERT INTO cities (id, name) VALUES (34, 'İstanbul') ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, name) VALUES (6, 'Ankara') ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, name) VALUES (35, 'İzmir') ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, name) VALUES (16, 'Bursa') ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, name) VALUES (7, 'Antalya') ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, name) VALUES (1, 'Adana') ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, name) VALUES (42, 'Konya') ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, name) VALUES (27, 'Gaziantep') ON CONFLICT (id) DO NOTHING;

-- Sonucu kontrol et
SELECT id, name FROM cities WHERE id IN (1,6,7,16,27,34,35,42) ORDER BY id;
