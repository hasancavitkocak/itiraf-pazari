-- Sponsorlu içerik tablosuna author_name alanı ekle
ALTER TABLE sponsored_content 
ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'anonymous';

-- Mevcut kayıtları güncelle
UPDATE sponsored_content 
SET author_name = 'anonymous' 
WHERE author_name IS NULL;
