-- Sponsorlu içerik tablosu
CREATE TABLE IF NOT EXISTS sponsored_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    link_url TEXT NOT NULL,
    button_text TEXT DEFAULT 'Siteyi Ziyaret Et',
    
    -- Görüntüleme ayarları
    is_active BOOLEAN DEFAULT true,
    position_type TEXT DEFAULT 'mixed' CHECK (position_type IN ('top', 'fixed_position', 'mixed')),
    fixed_position INTEGER, -- Sabit pozisyon için (örn: 3. sırada)
    mix_frequency INTEGER DEFAULT 5, -- Her kaç gönderi arasında gösterilecek
    
    -- Hedefleme
    target_categories TEXT[], -- Hangi kategorilerde gösterilecek (null = hepsinde)
    target_cities TEXT[], -- Hangi şehirlerde gösterilecek (null = hepsinde)
    
    -- Tarih aralığı
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    
    -- İstatistikler
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Meta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES profiles(id)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_sponsored_content_active ON sponsored_content(is_active);
CREATE INDEX IF NOT EXISTS idx_sponsored_content_dates ON sponsored_content(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_sponsored_content_position ON sponsored_content(position_type, fixed_position);

-- RLS politikaları
ALTER TABLE sponsored_content ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları tüm sponsorlu içerikleri yönetebilir
CREATE POLICY "Admins can manage sponsored content" ON sponsored_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Herkese okuma izni (aktif ve tarih aralığında olanlar)
CREATE POLICY "Anyone can read active sponsored content" ON sponsored_content
    FOR SELECT USING (
        is_active = true 
        AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
        AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
    );

-- Sponsorlu içerik tıklama logları
CREATE TABLE IF NOT EXISTS sponsored_content_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sponsored_content_id UUID REFERENCES sponsored_content(id) ON DELETE CASCADE,
    user_ip TEXT,
    user_agent TEXT,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tıklama logları için indeks
CREATE INDEX IF NOT EXISTS idx_sponsored_clicks_content ON sponsored_content_clicks(sponsored_content_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_clicks_date ON sponsored_content_clicks(clicked_at);