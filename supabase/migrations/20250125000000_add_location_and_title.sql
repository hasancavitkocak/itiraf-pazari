-- İl/İlçe tabloları ve posts tablosuna yeni alanlar ekleme

-- İller tablosu
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- İlçeler tablosu
CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  city_id int REFERENCES cities(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(city_id, name)
);

-- Posts tablosuna yeni alanlar ekleme
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS city_id int REFERENCES cities(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS district_id int REFERENCES districts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS custom_location text;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_posts_city ON posts(city_id);
CREATE INDEX IF NOT EXISTS idx_posts_district ON posts(district_id);
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts USING gin(to_tsvector('turkish', title));
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING gin(to_tsvector('turkish', content));

-- RLS politikaları
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cities"
  ON cities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view districts"
  ON districts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage cities"
  ON cities FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can manage districts"
  ON districts FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Türkiye'nin 81 ili
INSERT INTO cities (name) VALUES
('Adana'), ('Adıyaman'), ('Afyonkarahisar'), ('Ağrı'), ('Amasya'),
('Ankara'), ('Antalya'), ('Artvin'), ('Aydın'), ('Balıkesir'),
('Bilecik'), ('Bingöl'), ('Bitlis'), ('Bolu'), ('Burdur'),
('Bursa'), ('Çanakkale'), ('Çankırı'), ('Çorum'), ('Denizli'),
('Diyarbakır'), ('Edirne'), ('Elazığ'), ('Erzincan'), ('Erzurum'),
('Eskişehir'), ('Gaziantep'), ('Giresun'), ('Gümüşhane'), ('Hakkari'),
('Hatay'), ('Isparta'), ('Mersin'), ('İstanbul'), ('İzmir'),
('Kars'), ('Kastamonu'), ('Kayseri'), ('Kırklareli'), ('Kırşehir'),
('Kocaeli'), ('Konya'), ('Kütahya'), ('Malatya'), ('Manisa'),
('Kahramanmaraş'), ('Mardin'), ('Muğla'), ('Muş'), ('Nevşehir'),
('Niğde'), ('Ordu'), ('Rize'), ('Sakarya'), ('Samsun'),
('Siirt'), ('Sinop'), ('Sivas'), ('Tekirdağ'), ('Tokat'),
('Trabzon'), ('Tunceli'), ('Şanlıurfa'), ('Uşak'), ('Van'),
('Yozgat'), ('Zonguldak'), ('Aksaray'), ('Bayburt'), ('Karaman'),
('Kırıkkale'), ('Batman'), ('Şırnak'), ('Bartın'), ('Ardahan'),
('Iğdır'), ('Yalova'), ('Karabük'), ('Kilis'), ('Osmaniye'),
('Düzce')
ON CONFLICT (name) DO NOTHING;

-- Bazı büyük şehirlerin ilçeleri (örnek olarak)
-- İstanbul
INSERT INTO districts (city_id, name) 
SELECT id, district_name FROM cities, (VALUES
  ('Adalar'), ('Arnavutköy'), ('Ataşehir'), ('Avcılar'), ('Bağcılar'),
  ('Bahçelievler'), ('Bakırköy'), ('Başakşehir'), ('Bayrampaşa'), ('Beşiktaş'),
  ('Beykoz'), ('Beylikdüzü'), ('Beyoğlu'), ('Büyükçekmece'), ('Çatalca'),
  ('Çekmeköy'), ('Esenler'), ('Esenyurt'), ('Eyüpsultan'), ('Fatih'),
  ('Gaziosmanpaşa'), ('Güngören'), ('Kadıköy'), ('Kağıthane'), ('Kartal'),
  ('Küçükçekmece'), ('Maltepe'), ('Pendik'), ('Sancaktepe'), ('Sarıyer'),
  ('Silivri'), ('Sultanbeyli'), ('Sultangazi'), ('Şile'), ('Şişli'),
  ('Tuzla'), ('Ümraniye'), ('Üsküdar'), ('Zeytinburnu')
) AS t(district_name)
WHERE cities.name = 'İstanbul'
ON CONFLICT (city_id, name) DO NOTHING;

-- Ankara
INSERT INTO districts (city_id, name) 
SELECT id, district_name FROM cities, (VALUES
  ('Akyurt'), ('Altındağ'), ('Ayaş'), ('Bala'), ('Beypazarı'),
  ('Çamlıdere'), ('Çankaya'), ('Çubuk'), ('Elmadağ'), ('Etimesgut'),
  ('Evren'), ('Gölbaşı'), ('Güdül'), ('Haymana'), ('Kalecik'),
  ('Kazan'), ('Keçiören'), ('Kızılcahamam'), ('Mamak'), ('Nallıhan'),
  ('Polatlı'), ('Pursaklar'), ('Sincan'), ('Şereflikoçhisar'), ('Yenimahalle')
) AS t(district_name)
WHERE cities.name = 'Ankara'
ON CONFLICT (city_id, name) DO NOTHING;

-- İzmir
INSERT INTO districts (city_id, name) 
SELECT id, district_name FROM cities, (VALUES
  ('Aliağa'), ('Balçova'), ('Bayındır'), ('Bayraklı'), ('Bergama'),
  ('Beydağ'), ('Bornova'), ('Buca'), ('Çeşme'), ('Çiğli'),
  ('Dikili'), ('Foça'), ('Gaziemir'), ('Güzelbahçe'), ('Karabağlar'),
  ('Karaburun'), ('Karşıyaka'), ('Kemalpaşa'), ('Kınık'), ('Kiraz'),
  ('Konak'), ('Menderes'), ('Menemen'), ('Narlıdere'), ('Ödemiş'),
  ('Seferihisar'), ('Selçuk'), ('Tire'), ('Torbalı'), ('Urla')
) AS t(district_name)
WHERE cities.name = 'İzmir'
ON CONFLICT (city_id, name) DO NOTHING;
