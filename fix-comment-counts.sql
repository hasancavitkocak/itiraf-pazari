-- Yorum sayılarını düzelt
-- Tüm gönderilerin gerçek yorum sayısını hesapla ve güncelle

UPDATE posts 
SET comments_count = (
  SELECT COUNT(*) 
  FROM comments 
  WHERE comments.post_id = posts.id 
  AND comments.is_hidden = false
);

-- Null olan yorum sayılarını 0 yap
UPDATE posts 
SET comments_count = 0 
WHERE comments_count IS NULL;

-- Kontrol sorgusu (çalıştırmadan önce kontrol için)
SELECT 
  p.id,
  p.title,
  p.comments_count as stored_count,
  (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_hidden = false) as actual_count
FROM posts p
WHERE p.comments_count != (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_hidden = false)
ORDER BY p.created_at DESC
LIMIT 10;