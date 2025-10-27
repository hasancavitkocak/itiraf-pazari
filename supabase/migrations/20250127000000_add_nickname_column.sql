/*
  # Nickname kolonu ekleme

  1. Değişiklikler
    - profiles tablosuna nickname kolonu ekleme
    - Mevcut kullanıcılar için nickname oluşturma
    - Nickname benzersizlik constraint'i ekleme

  2. Notlar
    - username: Anonim isim (anonymous123456 formatında, yorumlarda görünür)
    - nickname: Kullanıcı adı (giriş için kullanılır, güncellenebilir)
*/

-- Profiles tablosuna nickname kolonu ekle
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'nickname'
  ) THEN
    ALTER TABLE profiles ADD COLUMN nickname text;
  END IF;
END $;

-- Mevcut kullanıcılar için nickname oluştur (username'den türet)
UPDATE profiles 
SET nickname = COALESCE(
  (SELECT split_part(email, '@', 1) FROM auth.users WHERE auth.users.id = profiles.id),
  'user' || substr(id::text, 1, 8)
)
WHERE nickname IS NULL;

-- Nickname için unique constraint ekle
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_nickname_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_nickname_key UNIQUE (nickname);
  END IF;
END $;

-- Nickname için index oluştur
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);

-- Yeni kullanıcılar için nickname oluşturma fonksiyonunu güncelle
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $
DECLARE
  new_username text;
  new_nickname text;
BEGIN
  -- Anonim username oluştur (anonymous123456 formatında)
  new_username := generate_username();
  
  -- Email'den nickname oluştur
  new_nickname := split_part(new.email, '@', 1);
  
  -- Eğer nickname zaten varsa, sonuna sayı ekle
  WHILE EXISTS (SELECT 1 FROM profiles WHERE nickname = new_nickname) LOOP
    new_nickname := split_part(new.email, '@', 1) || floor(random() * 1000)::text;
  END LOOP;
  
  INSERT INTO public.profiles (id, username, nickname, role, is_premium, is_banned)
  VALUES (
    new.id,
    new_username,
    new_nickname,
    'user',
    false,
    false
  );
  RETURN new;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
