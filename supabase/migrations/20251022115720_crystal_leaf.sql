/*
  # İtiraf paylaşımı için RLS politikalarını düzelt

  1. Posts tablosu için anonim kullanıcıların da paylaşım yapabilmesi
  2. Comments tablosu için anonim kullanıcıların yorum yapabilmesi
  3. Reactions tablosu için anonim kullanıcıların reaksiyon verebilmesi
  4. Reports tablosu için anonim kullanıcıların rapor verebilmesi
*/

-- Posts tablosu politikaları
DROP POLICY IF EXISTS "Anyone can insert posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view non-hidden posts" ON posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

CREATE POLICY "Anyone can insert posts"
  ON posts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view non-hidden posts"
  ON posts
  FOR SELECT
  TO public
  USING (is_hidden = false);

-- Comments tablosu politikaları
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;
DROP POLICY IF EXISTS "Anyone can view non-hidden comments" ON comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON comments;
DROP POLICY IF EXISTS "Admins can update comments" ON comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON comments;

CREATE POLICY "Anyone can insert comments"
  ON comments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view non-hidden comments"
  ON comments
  FOR SELECT
  TO public
  USING (is_hidden = false);

-- Reactions tablosu politikaları
DROP POLICY IF EXISTS "Anyone can insert reactions" ON reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON reactions;
DROP POLICY IF EXISTS "Anyone can delete reactions" ON reactions;

CREATE POLICY "Anyone can insert reactions"
  ON reactions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view reactions"
  ON reactions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can delete reactions"
  ON reactions
  FOR DELETE
  TO public
  USING (true);

-- Reports tablosu politikaları
DROP POLICY IF EXISTS "Anyone can insert reports" ON reports;
DROP POLICY IF EXISTS "Admins can view reports" ON reports;

CREATE POLICY "Anyone can insert reports"
  ON reports
  FOR INSERT
  TO public
  WITH CHECK (true);
