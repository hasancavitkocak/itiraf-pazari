-- Mevcut kategorileri kontrol et
SELECT id, name, slug, icon, description, is_premium, order_index 
FROM categories 
ORDER BY order_index;

-- Kategorilerin icon alanlarını güncelle
UPDATE categories SET icon = '💕' WHERE slug = 'ask' OR name = 'Aşk';
UPDATE categories SET icon = '💼' WHERE slug = 'is' OR name = 'İş';
UPDATE categories SET icon = '📚' WHERE slug = 'okul' OR name = 'Okul';
UPDATE categories SET icon = '👨‍👩‍👧‍👦' WHERE slug = 'aile' OR name = 'Aile';
UPDATE categories SET icon = '🔒' WHERE slug = 'gizli' OR name = 'Gizli';
UPDATE categories SET icon = '👥' WHERE slug = 'arkadaslik' OR name = 'Arkadaşlık';

-- Yeni kategorileri ekle (eğer yoksa)
INSERT INTO categories (name, slug, icon, description, is_premium, order_index) 
VALUES 
('Cinsellik', 'cinsellik', '🔞', 'Cinsellik ve ilişkiler hakkında itiraflar', false, 6),
('Havadan Sudan', 'havadan-sudan', '💭', 'Günlük hayattan rastgele düşünceler ve itiraflar', false, 7)
ON CONFLICT (slug) DO UPDATE SET 
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- Güncellenmiş kategorileri kontrol et
SELECT id, name, slug, icon, description, is_premium, order_index 
FROM categories 
ORDER BY order_index;