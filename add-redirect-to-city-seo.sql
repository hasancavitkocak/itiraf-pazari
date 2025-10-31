-- Şehir SEO tablosuna yönlendirme alanları ekle
ALTER TABLE city_seo_settings 
ADD COLUMN IF NOT EXISTS redirect_url TEXT,
ADD COLUMN IF NOT EXISTS redirect_type INTEGER DEFAULT 0; -- 0: yönlendirme yok, 301: kalıcı, 302: geçici

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_city_seo_settings_redirect ON city_seo_settings(redirect_type) WHERE redirect_type > 0;

-- Yorum ekle
COMMENT ON COLUMN city_seo_settings.redirect_url IS 'Şehir sayfası için yönlendirme URL''si';
COMMENT ON COLUMN city_seo_settings.redirect_type IS '0: Yönlendirme yok, 301: Kalıcı yönlendirme, 302: Geçici yönlendirme';
