-- Confession logs tablosu oluştur
CREATE TABLE IF NOT EXISTS confession_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_confession_logs_created_at ON confession_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confession_logs_action ON confession_logs(action);

-- RLS politikaları (admin erişimi için)
ALTER TABLE confession_logs ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için okuma izni
CREATE POLICY "Admin can read confession logs" ON confession_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Sistem için yazma izni (service role key ile)
CREATE POLICY "System can insert confession logs" ON confession_logs
  FOR INSERT WITH CHECK (true);