-- Site ayarları tablosu
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'text', -- text, image, boolean, number
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Varsayılan ayarları ekle
INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES
('site_logo', '', 'image'),
('site_name', 'İtiraf Pazarı', 'text'),
('site_description', 'Anonim itiraf paylaşım platformu', 'text'),
('contact_email', 'info@itirafpazari.com', 'text'),
('maintenance_mode', 'false', 'boolean')
ON CONFLICT (setting_key) DO NOTHING;
