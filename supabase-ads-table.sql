-- Ads tablosunu oluştur
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  position VARCHAR(50) NOT NULL CHECK (position IN ('header', 'sidebar', 'footer', 'between_posts')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) politikalarını ayarla
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni ver (reklamları görmek için)
CREATE POLICY "Anyone can view active ads" ON ads
  FOR SELECT USING (is_active = true);

-- Sadece admin'lere yazma izni ver
CREATE POLICY "Only admins can manage ads" ON ads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger oluştur (updated_at otomatik güncellemesi için)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ads_updated_at 
  BEFORE UPDATE ON ads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
