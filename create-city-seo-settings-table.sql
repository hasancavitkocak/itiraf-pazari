-- Şehir SEO ayarları tablosu
CREATE TABLE IF NOT EXISTS city_seo_settings (
    id SERIAL PRIMARY KEY,
    city_id INTEGER NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    title TEXT,
    description TEXT,
    keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_city_seo_settings_city_id ON city_seo_settings(city_id);
CREATE INDEX IF NOT EXISTS idx_city_seo_settings_active ON city_seo_settings(is_active);

-- RLS (Row Level Security) politikaları
ALTER TABLE city_seo_settings ENABLE ROW LEVEL SECURITY;

-- Admin'ler tüm işlemleri yapabilir
CREATE POLICY "Admins can manage city SEO settings" ON city_seo_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Herkes aktif şehirleri okuyabilir (public erişim için)
CREATE POLICY "Anyone can read active city SEO settings" ON city_seo_settings
    FOR SELECT USING (is_active = true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_city_seo_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_city_seo_settings_updated_at
    BEFORE UPDATE ON city_seo_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_city_seo_settings_updated_at();

-- Varsayılan şehirler için kayıtlar ekle (opsiyonel)
INSERT INTO city_seo_settings (city_id, is_active, title, description, keywords) VALUES
(34, true, 'İstanbul İtirafları | İtiraf Pazarı', 'İstanbul''dan anonim itiraflar. İstanbul şehrinden gerçek hikayeler, deneyimler ve itiraflar. Tamamen anonim ve güvenli.', 'istanbul itiraf, istanbul anonim itiraf, istanbul hikaye, istanbul deneyim'),
(6, true, 'Ankara İtirafları | İtiraf Pazarı', 'Ankara''dan anonim itiraflar. Ankara şehrinden gerçek hikayeler, deneyimler ve itiraflar. Tamamen anonim ve güvenli.', 'ankara itiraf, ankara anonim itiraf, ankara hikaye, ankara deneyim'),
(35, true, 'İzmir İtirafları | İtiraf Pazarı', 'İzmir''den anonim itiraflar. İzmir şehrinden gerçek hikayeler, deneyimler ve itiraflar. Tamamen anonim ve güvenli.', 'izmir itiraf, izmir anonim itiraf, izmir hikaye, izmir deneyim')
ON CONFLICT (city_id) DO NOTHING;