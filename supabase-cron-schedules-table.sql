-- Cron schedules tablosu oluştur
CREATE TABLE IF NOT EXISTS cron_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  time VARCHAR(5) NOT NULL, -- "09:00" formatında
  label VARCHAR(100) NOT NULL, -- "Sabah İtirafı"
  is_active BOOLEAN DEFAULT true,
  category VARCHAR(50), -- hangi kategoride itiraf (null = rastgele)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler ekle
CREATE INDEX IF NOT EXISTS idx_cron_schedules_time ON cron_schedules(time);
CREATE INDEX IF NOT EXISTS idx_cron_schedules_active ON cron_schedules(is_active);

-- RLS (Row Level Security) aktif et
ALTER TABLE cron_schedules ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için policy
CREATE POLICY "Allow full access to cron schedules" ON cron_schedules
  FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cron_schedules_updated_at 
  BEFORE UPDATE ON cron_schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Varsayılan saatleri ekle
INSERT INTO cron_schedules (time, label, is_active, category) VALUES
('07:00', 'Sabah Erken İtirafı', true, null),
('09:00', 'Sabah İtirafı', true, null),
('11:00', 'Öğleden Önce İtirafı', true, null),
('13:00', 'Öğle İtirafı', true, null),
('15:00', 'Öğleden Sonra İtirafı', true, null),
('17:00', 'Akşam İtirafı', true, null),
('19:00', 'Akşam Geç İtirafı', true, null),
('21:00', 'Gece İtirafı', true, null),
('23:00', 'Gece Geç İtirafı', true, null),
('01:00', 'Gece Yarısı İtirafı', true, null)
ON CONFLICT DO NOTHING;