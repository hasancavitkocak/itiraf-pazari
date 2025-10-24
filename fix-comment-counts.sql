-- Yorum sayılarını düzelt
-- Tüm gönderilerin gerçek yorum sayısını hesapla ve güncelle

UPDATE posts 
SET comments_count = (
  SELECT COUNT(*) 
  FROM comments 
  WHERE comments.post_id = posts.id 
  AND (comments.is_hidden = false OR comments.is_hidden IS NULL)
);

-- Null olan yorum sayılarını 0 yap
UPDATE posts 
SET comments_count = 0 
WHERE comments_count IS NULL;

-- Likes ve dislikes sayılarını da düzelt
UPDATE posts 
SET likes_count = (
  SELECT COUNT(*) 
  FROM reactions 
  WHERE reactions.post_id = posts.id 
  AND reactions.type = 'like'
);

UPDATE posts 
SET dislikes_count = (
  SELECT COUNT(*) 
  FROM reactions 
  WHERE reactions.post_id = posts.id 
  AND reactions.type = 'dislike'
);

-- Null olan reaction sayılarını 0 yap
UPDATE posts 
SET likes_count = 0 
WHERE likes_count IS NULL;

UPDATE posts 
SET dislikes_count = 0 
WHERE dislikes_count IS NULL;

-- Kontrol sorgusu (çalıştırmadan önce kontrol için)
SELECT 
  p.id,
  p.content,
  p.comments_count as stored_count,
  (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND (c.is_hidden = false OR c.is_hidden IS NULL)) as actual_count,
  p.likes_count,
  p.dislikes_count
FROM posts p
ORDER BY p.created_at DESC
LIMIT 10;