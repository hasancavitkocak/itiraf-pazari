-- Posts tablosuna otomatik oluşturulmuş post işareti ekle
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT FALSE;

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_posts_is_auto_generated ON posts(is_auto_generated);