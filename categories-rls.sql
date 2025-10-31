-- Categories tablosu için RLS ayarları

-- RLS'yi etkinleştir
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;

-- Herkese okuma izni
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Admin'lere tam yetki
CREATE POLICY "Only admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
