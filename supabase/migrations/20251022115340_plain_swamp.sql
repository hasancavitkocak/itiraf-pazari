/*
  # Kullanıcı adı ekleme ve politika düzeltmeleri

  1. Değişiklikler
    - profiles tablosuna username kolonu ekleme
    - Otomatik kullanıcı adı oluşturma trigger'ı
    - RLS politikalarını düzeltme
    - Anonim gönderi paylaşımı için düzenlemeler

  2. Güvenlik
    - RLS politikalarını basitleştirme
    - Anonim kullanıcılar için izinler
*/

-- Profiles tablosuna username kolonu ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username text UNIQUE;
  END IF;
END $$;

-- Otomatik kullanıcı adı oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_username()
RETURNS text AS $$
DECLARE
  new_username text;
  counter int := 1;
BEGIN
  LOOP
    new_username := 'kullanici' || floor(random() * 10000)::text;
    
    -- Kullanıcı adının benzersiz olup olmadığını kontrol et
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = new_username) THEN
      RETURN new_username;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      -- Çok fazla deneme yapıldıysa timestamp ekle
      new_username := 'kullanici' || extract(epoch from now())::bigint::text;
      RETURN new_username;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Kullanıcı oluşturulduğunda otomatik username atama
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, is_premium, is_banned)
  VALUES (
    new.id,
    generate_username(),
    'user',
    false,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mevcut kullanıcılar için username oluştur
UPDATE profiles 
SET username = generate_username() 
WHERE username IS NULL;

-- Profiles tablosu için basit RLS politikaları
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

-- Yeni basit politikalar
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Posts tablosu için anonim erişim
DROP POLICY IF EXISTS "Anyone can insert posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view non-hidden posts" ON posts;

CREATE POLICY "Anyone can insert posts" ON posts
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view non-hidden posts" ON posts
  FOR SELECT TO public
  USING (is_hidden = false);

-- Comments tablosu için anonim erişim
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;
DROP POLICY IF EXISTS "Anyone can view non-hidden comments" ON comments;

CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view non-hidden comments" ON comments
  FOR SELECT TO public
  USING (is_hidden = false);

-- Reactions tablosu için anonim erişim
DROP POLICY IF EXISTS "Anyone can insert reactions" ON reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON reactions;
DROP POLICY IF EXISTS "Anyone can delete own reactions" ON reactions;

CREATE POLICY "Anyone can insert reactions" ON reactions
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view reactions" ON reactions
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Anyone can delete reactions" ON reactions
  FOR DELETE TO public
  USING (true);

-- Reports tablosu için anonim erişim
DROP POLICY IF EXISTS "Anyone can insert reports" ON reports;

CREATE POLICY "Anyone can insert reports" ON reports
  FOR INSERT TO public
  WITH CHECK (true);