/*
  # Reactions tablosuna user_id ekleme

  1. Değişiklikler
    - reactions tablosuna user_id kolonu ekleme
    - Unique constraint'i güncelleme (post_id, ip_hash, user_id)
    
  2. Notlar
    - Giriş yapmış kullanıcılar için user_id kullanılır
    - Giriş yapmamış kullanıcılar için sadece ip_hash kullanılır
*/

-- User ID kolonu ekle
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Eski unique constraint'i kaldır
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_post_id_ip_hash_key;

-- Yeni unique constraint ekle - user_id NULL olabilir
-- Giriş yapmış kullanıcılar için: (post_id, user_id) unique olmalı
-- Giriş yapmamış kullanıcılar için: (post_id, ip_hash) unique olmalı
CREATE UNIQUE INDEX IF NOT EXISTS reactions_user_unique 
  ON reactions(post_id, user_id) 
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS reactions_ip_unique 
  ON reactions(post_id, ip_hash) 
  WHERE user_id IS NULL;

-- Index oluştur
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
