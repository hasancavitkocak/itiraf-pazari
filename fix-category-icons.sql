-- Kategori ikonlarını düzelt
-- Yanlış icon name'leri emoji'lerle değiştir

UPDATE categories SET icon = '💕' WHERE name = 'Aşk' OR slug = 'ask';
UPDATE categories SET icon = '💼' WHERE name = 'İş' OR slug = 'is';
UPDATE categories SET icon = '📚' WHERE name = 'Okul' OR slug = 'okul' OR icon = 'book';
UPDATE categories SET icon = '👥' WHERE name = 'Arkadaşlık' OR slug = 'arkadaslik' OR icon = 'users';
UPDATE categories SET icon = '👨‍👩‍👧‍👦' WHERE name = 'Aile' OR slug = 'aile';
UPDATE categories SET icon = '🔒' WHERE name = 'Gizli' OR slug = 'gizli' OR icon = 'lock';
UPDATE categories SET icon = '🔞' WHERE name = 'Cinsellik' OR slug = 'cinsellik';
UPDATE categories SET icon = '💭' WHERE name = 'Havadan Sudan' OR slug = 'havadan-sudan';

-- Kontrol et
SELECT id, name, slug, icon, is_premium, order_index 
FROM categories 
ORDER BY order_index;