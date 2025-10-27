-- SEO Settings tablosu oluştur
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title VARCHAR(100) NOT NULL DEFAULT 'İtiraf Pazarı - Anonim İtiraf Paylaşım Platformu',
  site_description TEXT NOT NULL DEFAULT 'Türkiye''nin en güvenli anonim itiraf platformu. Kayıt gerektirmez, tamamen ücretsiz.',
  site_keywords TEXT DEFAULT 'itiraf, anonim itiraf, gizli itiraf, türkiye itiraf sitesi',
  google_analytics_id VARCHAR(20) DEFAULT '',
  google_search_console_id VARCHAR(50) DEFAULT '4becba0bddfacfab',
  google_adsense_id VARCHAR(50) DEFAULT '',
  facebook_pixel_id VARCHAR(20) DEFAULT '',
  twitter_site VARCHAR(50) DEFAULT '@itirafpazari',
  og_image VARCHAR(255) DEFAULT '/og-image.jpg',
  robots_txt TEXT DEFAULT 'User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth
Disallow: /profile
Sitemap: https://itirafpazari.com/sitemap.xml',
  canonical_url VARCHAR(255) DEFAULT 'https://itirafpazari.com',
  schema_org_type VARCHAR(50) DEFAULT 'WebSite',
  enable_breadcrumbs BOOLEAN DEFAULT true,
  enable_structured_data BOOLEAN DEFAULT true,
  enable_open_graph BOOLEAN DEFAULT true,
  enable_twitter_cards BOOLEAN DEFAULT true,
  meta_author VARCHAR(100) DEFAULT 'İtiraf Pazarı',
  meta_publisher VARCHAR(100) DEFAULT 'İtiraf Pazarı',
  language VARCHAR(10) DEFAULT 'tr-TR',
  region VARCHAR(5) DEFAULT 'TR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İlk kayıt ekle (UUID ile)
INSERT INTO seo_settings DEFAULT VALUES;

-- RLS (Row Level Security) politikaları
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları okuyabilir
CREATE POLICY "Admin can read SEO settings" ON seo_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin kullanıcıları güncelleyebilir
CREATE POLICY "Admin can update SEO settings" ON seo_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin kullanıcıları ekleyebilir
CREATE POLICY "Admin can insert SEO settings" ON seo_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );