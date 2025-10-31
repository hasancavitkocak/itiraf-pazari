-- Site varlıkları için storage bucket oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true);

-- Bucket için policy oluştur (herkese okuma izni)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');

-- Admin kullanıcıları için yükleme izni (bu kısmı admin user ID'leriyle güncellemen gerekebilir)
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets');
