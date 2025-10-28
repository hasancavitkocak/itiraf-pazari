-- Duplicate city_seo_settings kayıtlarını temizle
-- Önce mevcut duplicate'ları kontrol et
SELECT city_id, COUNT(*) as count 
FROM city_seo_settings 
GROUP BY city_id 
HAVING COUNT(*) > 1;

-- Duplicate kayıtları temizle (en son güncellenen kayıt hariç)
DELETE FROM city_seo_settings 
WHERE id NOT IN (
    SELECT DISTINCT ON (city_id) id 
    FROM city_seo_settings 
    ORDER BY city_id, updated_at DESC
);

-- Sonucu kontrol et
SELECT city_id, COUNT(*) as count 
FROM city_seo_settings 
GROUP BY city_id 
HAVING COUNT(*) > 1;