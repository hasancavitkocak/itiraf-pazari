-- Categories tablosuna description sütunu ekle
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Mevcut kategorilere description ekle
UPDATE categories SET description = 'Aşk, ilişkiler ve duygusal itiraflar' WHERE slug = 'ask';
UPDATE categories SET description = 'İş hayatı, kariyer ve meslek ile ilgili itiraflar' WHERE slug = 'is';
UPDATE categories SET description = 'Okul, eğitim ve öğrenci hayatı itirafları' WHERE slug = 'okul';
UPDATE categories SET description = 'Aile, akraba ve ev içi itiraflar' WHERE slug = 'aile';
UPDATE categories SET description = 'Gizli ve özel itiraflar (Üyelik gerekli)' WHERE slug = 'gizli';

-- Yeni kategorileri ekle
INSERT INTO categories (name, slug, icon, description, is_premium, order_index) VALUES
('Cinsellik', 'cinsellik', '🔞', 'Cinsellik ve ilişkiler hakkında itiraflar', false, 6),
('Havadan Sudan', 'havadan-sudan', '💭', 'Günlük hayattan rastgele düşünceler ve itiraflar', false, 7)
ON CONFLICT (slug) DO NOTHING;

-- Sıralamayı güncelle
UPDATE categories SET order_index = 1 WHERE slug = 'ask';
UPDATE categories SET order_index = 2 WHERE slug = 'is';
UPDATE categories SET order_index = 3 WHERE slug = 'okul';
UPDATE categories SET order_index = 4 WHERE slug = 'aile';
UPDATE categories SET order_index = 5 WHERE slug = 'gizli';
UPDATE categories SET order_index = 6 WHERE slug = 'cinsellik';
UPDATE categories SET order_index = 7 WHERE slug = 'havadan-sudan';
