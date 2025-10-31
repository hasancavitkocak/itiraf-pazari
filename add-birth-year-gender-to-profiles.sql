-- Profiles tablosuna doğum yılı ve cinsiyet alanları ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- Mevcut kullanıcılar için default değerler ata
UPDATE profiles 
SET 
    birth_year = 1990,
    gender = 'belirtmek_istemiyorum'
WHERE birth_year IS NULL OR gender IS NULL;

-- Gender için check constraint ekle (zorunlu)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_gender_values'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT check_gender_values 
        CHECK (gender IS NOT NULL AND gender IN ('kadın', 'erkek', 'belirtmek_istemiyorum'));
    END IF;
END $$;

-- Birth year için check constraint ekle (zorunlu, 1900-2024 arası)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_birth_year_range'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT check_birth_year_range 
        CHECK (birth_year IS NOT NULL AND birth_year >= 1900 AND birth_year <= 2024);
    END IF;
END $$;

-- İndeksler oluştur (istatistik amaçlı)
CREATE INDEX IF NOT EXISTS idx_profiles_birth_year ON profiles(birth_year);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
