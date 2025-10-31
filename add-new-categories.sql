-- Yeni kategoriler ekleme
INSERT INTO categories (name, slug, icon, description, is_premium, order_index) VALUES
('Cinsellik', 'cinsellik', '🔞', 'Cinsellik ve ilişkiler hakkında itiraflar', false, 6),
('Havadan Sudan', 'havadan-sudan', '💭', 'Günlük hayattan rastgele düşünceler ve itiraflar', false, 7);

-- Mevcut kategorilerin sırasını güncelle (isteğe bağlı)
UPDATE categories SET order_index = 1 WHERE slug = 'ask';
UPDATE categories SET order_index = 2 WHERE slug = 'is';
UPDATE categories SET order_index = 3 WHERE slug = 'okul';
UPDATE categories SET order_index = 4 WHERE slug = 'aile';
UPDATE categories SET order_index = 5 WHERE slug = 'gizli';
UPDATE categories SET order_index = 6 WHERE slug = 'cinsellik';
UPDATE categories SET order_index = 7 WHERE slug = 'havadan-sudan';
