-- views_count kolonu zaten var, sadece mevcut postları güncelle
UPDATE posts SET views_count = 0 WHERE views_count IS NULL;

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON posts(views_count);
