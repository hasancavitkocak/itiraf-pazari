-- SEO listesindeki tüm şehirlerin ID'lerini bul

SELECT id, name FROM cities WHERE name IN (
  'İzmir', 'Konya', 'Kayseri', 'Mersin', 'Samsun', 
  'Şanlıurfa', 'Adapazarı', 'Malatya', 'Kahramanmaraş', 'Van'
) ORDER BY name;

-- Alternatif isimlerle de ara (eğer farklı yazılmışsa)
SELECT id, name FROM cities WHERE 
  name ILIKE '%izmir%' OR 
  name ILIKE '%konya%' OR 
  name ILIKE '%kayseri%' OR 
  name ILIKE '%mersin%' OR 
  name ILIKE '%samsun%' OR 
  name ILIKE '%urfa%' OR 
  name ILIKE '%adapazar%' OR 
  name ILIKE '%sakarya%' OR 
  name ILIKE '%malatya%' OR 
  name ILIKE '%maras%' OR 
  name ILIKE '%van%'
ORDER BY name;