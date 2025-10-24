-- Categories tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  is_premium BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) politikalarını ayarla
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Mevcut policy'leri sil (eğer varsa)
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;

-- Herkese okuma izni ver
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Admin'lere yazma izni ver
CREATE POLICY "Only admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Temel kategorileri ekle
INSERT INTO categories (name, slug, icon, description, is_premium, order_index) VALUES
('Aşk', 'ask', '💕', 'Aşk, ilişkiler ve duygusal itiraflar', false, 1),
('İş', 'is', '💼', 'İş hayatı, kariyer ve meslek ile ilgili itiraflar', false, 2),
('Okul', 'okul', '📚', 'Okul, eğitim ve öğrenci hayatı itirafları', false, 3),
('Aile', 'aile', '👨‍👩‍👧‍👦', 'Aile, akraba ve ev içi itiraflar', false, 4),
('Gizli', 'gizli', '🔒', 'Gizli ve özel itiraflar (Üyelik gerekli)', true, 5),
('Cinsellik', 'cinsellik', '🔞', 'Cinsellik ve ilişkiler hakkında itiraflar', false, 6),
('Havadan Sudan', 'havadan-sudan', '💭', 'Günlük hayattan rastgele düşünceler ve itiraflar', false, 7)
ON CONFLICT (slug) DO UPDATE SET 
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  is_premium = EXCLUDED.is_premium,
  order_index = EXCLUDED.order_index;

-- Kontrol sorgusu
SELECT * FROM categories ORDER BY order_index;