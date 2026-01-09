-- Confession logs tablosu oluştur
CREATE TABLE IF NOT EXISTS confession_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  confession_content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  metadata JSONB,
  scheduled_time VARCHAR(5) NOT NULL, -- "09:00" formatında
  status VARCHAR(10) NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler ekle
CREATE INDEX IF NOT EXISTS idx_confession_logs_created_at ON confession_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confession_logs_status ON confession_logs(status);
CREATE INDEX IF NOT EXISTS idx_confession_logs_scheduled_time ON confession_logs(scheduled_time);

-- RLS (Row Level Security) aktif et
ALTER TABLE confession_logs ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için policy (şimdilik herkese okuma izni)
CREATE POLICY "Allow read access to confession logs" ON confession_logs
  FOR SELECT USING (true);

-- Sadece sistem (service_role) yazabilir
CREATE POLICY "Allow insert for service role" ON confession_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_confession_logs_updated_at 
  BEFORE UPDATE ON confession_logs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();