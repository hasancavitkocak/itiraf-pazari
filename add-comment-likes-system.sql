-- Comments tablosuna likes_count alanı ekle
ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Comment likes tablosu oluştur
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_ip_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Bir kullanıcı/IP bir yorumu sadece bir kez beğenebilir
    CONSTRAINT unique_comment_like_user UNIQUE (comment_id, user_id),
    CONSTRAINT unique_comment_like_ip UNIQUE (comment_id, user_ip_hash),
    
    -- En az birisi null olmamalı (ya user_id ya da user_ip_hash)
    CONSTRAINT check_comment_like_identity CHECK (
        (user_id IS NOT NULL AND user_ip_hash IS NULL) OR 
        (user_id IS NULL AND user_ip_hash IS NOT NULL)
    )
);

-- İndeksler oluştur
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_ip_hash ON comment_likes(user_ip_hash);

-- Comments tablosundaki likes_count'u güncellemek için trigger
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();
