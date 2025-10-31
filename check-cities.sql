-- Mevcut şehir verilerini kontrol et

-- Tüm şehirleri listele
SELECT id, name FROM cities ORDER BY id;

-- İstanbul'u ara
SELECT id, name FROM cities WHERE name ILIKE '%istanbul%';

-- Ankara'yı ara  
SELECT id, name FROM cities WHERE name ILIKE '%ankara%';

-- İzmir'i ara
SELECT id, name FROM cities WHERE name ILIKE '%izmir%';

-- Posts tablosunda hangi city_id'ler kullanılıyor
SELECT DISTINCT city_id, COUNT(*) as post_count 
FROM posts 
WHERE city_id IS NOT NULL 
GROUP BY city_id 
ORDER BY city_id;
