-- Universities tablosu oluştur
CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  city_id INTEGER REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts tablosuna university_id ekle
ALTER TABLE posts ADD COLUMN IF NOT EXISTS university_id INTEGER REFERENCES universities(id);

-- Index'ler ekle
CREATE INDEX IF NOT EXISTS idx_universities_slug ON universities(slug);
CREATE INDEX IF NOT EXISTS idx_universities_city_id ON universities(city_id);
CREATE INDEX IF NOT EXISTS idx_universities_is_active ON universities(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_university_id ON posts(university_id);

-- Türkiye'deki tüm üniversiteleri ekle
INSERT INTO universities (name, slug, city_id) VALUES
-- İstanbul (Avrupa Yakası)
('Boğaziçi Üniversitesi', 'bogazici-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Teknik Üniversitesi', 'istanbul-teknik-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Üniversitesi', 'istanbul-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Marmara Üniversitesi', 'marmara-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Yıldız Teknik Üniversitesi', 'yildiz-teknik-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Galatasaray Üniversitesi', 'galatasaray-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Koç Üniversitesi', 'koc-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Sabancı Üniversitesi', 'sabanci-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Bahçeşehir Üniversitesi', 'bahcesehir-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Bilgi Üniversitesi', 'istanbul-bilgi-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Özyeğin Üniversitesi', 'ozyegin-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Kadir Has Üniversitesi', 'kadir-has-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Fatih Sultan Mehmet Vakıf Üniversitesi', 'fatih-sultan-mehmet-vakif-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Şehir Üniversitesi', 'istanbul-sehir-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Beykent Üniversitesi', 'beykent-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Kültür Üniversitesi', 'istanbul-kultur-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Arel Üniversitesi', 'istanbul-arel-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Aydın Üniversitesi', 'istanbul-aydin-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Gelişim Üniversitesi', 'istanbul-gelisim-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Medipol Üniversitesi', 'istanbul-medipol-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Okan Üniversitesi', 'istanbul-okan-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Rumeli Üniversitesi', 'istanbul-rumeli-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Sabahattin Zaim Üniversitesi', 'istanbul-sabahattin-zaim-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Ticaret Üniversitesi', 'istanbul-ticaret-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Esenyurt Üniversitesi', 'istanbul-esenyurt-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Kent Üniversitesi', 'istanbul-kent-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Nişantaşı Üniversitesi', 'istanbul-nisantasi-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Yeni Yüzyıl Üniversitesi', 'istanbul-yeni-yuzyil-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Haliç Üniversitesi', 'halic-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Piri Reis Üniversitesi', 'piri-reis-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Doğuş Üniversitesi', 'dogus-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Maltepe Üniversitesi', 'maltepe-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Üsküdar Üniversitesi', 'uskudar-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Acıbadem Mehmet Ali Aydınlar Üniversitesi', 'acibadem-mehmet-ali-aydinlar-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Altınbaş Üniversitesi', 'altinbas-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Biruni Üniversitesi', 'biruni-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Demiroğlu Bilim Üniversitesi', 'demiroglu-bilim-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Fenerbahçe Üniversitesi', 'fenerbahce-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İbn Haldun Üniversitesi', 'ibn-haldun-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Atlas Üniversitesi', 'istanbul-atlas-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Cerrahpaşa Üniversitesi', 'istanbul-cerrahpasa-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Galata Üniversitesi', 'istanbul-galata-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Gedik Üniversitesi', 'istanbul-gedik-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Sağlık ve Teknoloji Üniversitesi', 'istanbul-saglik-ve-teknoloji-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstinye Üniversitesi', 'istinye-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Koç Üniversitesi', 'koc-universitesi-2', (SELECT id FROM cities WHERE name = 'İstanbul')),
('MEF Üniversitesi', 'mef-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Mimar Sinan Güzel Sanatlar Üniversitesi', 'mimar-sinan-guzel-sanatlar-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('İstanbul Medeniyet Üniversitesi', 'istanbul-medeniyet-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Nişantaşı Üniversitesi', 'nisantasi-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Plato Meslek Yüksekokulu', 'plato-meslek-yuksekokulu', (SELECT id FROM cities WHERE name = 'İstanbul')),
('Sanko Üniversitesi', 'sanko-universitesi', (SELECT id FROM cities WHERE name = 'İstanbul')),
('TED Üniversitesi', 'ted-universitesi-istanbul', (SELECT id FROM cities WHERE name = 'İstanbul')),

-- Ankara
('Orta Doğu Teknik Üniversitesi', 'orta-dogu-teknik-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Ankara Üniversitesi', 'ankara-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Hacettepe Üniversitesi', 'hacettepe-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Gazi Üniversitesi', 'gazi-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Bilkent Üniversitesi', 'bilkent-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('TOBB Ekonomi ve Teknoloji Üniversitesi', 'tobb-ekonomi-ve-teknoloji-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Başkent Üniversitesi', 'baskent-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Çankaya Üniversitesi', 'cankaya-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Atılım Üniversitesi', 'atilim-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Ufuk Üniversitesi', 'ufuk-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Ankara Bilim Üniversitesi', 'ankara-bilim-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Ankara Hacı Bayram Veli Üniversitesi', 'ankara-haci-bayram-veli-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Ankara Medipol Üniversitesi', 'ankara-medipol-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Ankara Sosyal Bilimler Üniversitesi', 'ankara-sosyal-bilimler-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Ankara Yıldırım Beyazıt Üniversitesi', 'ankara-yildirim-beyazit-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Lokman Hekim Üniversitesi', 'lokman-hekim-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Ostim Teknik Üniversitesi', 'ostim-teknik-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('TED Üniversitesi', 'ted-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Türk Hava Kurumu Üniversitesi', 'turk-hava-kurumu-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),
('Yüksek İhtisas Üniversitesi', 'yuksek-ihtisas-universitesi', (SELECT id FROM cities WHERE name = 'Ankara')),

-- İzmir
('Ege Üniversitesi', 'ege-universitesi', (SELECT id FROM cities WHERE name = 'İzmir')),
('Dokuz Eylül Üniversitesi', 'dokuz-eylul-universitesi', (SELECT id FROM cities WHERE name = 'İzmir')),
('İzmir Yüksek Teknoloji Enstitüsü', 'izmir-yuksek-teknoloji-enstitusu', (SELECT id FROM cities WHERE name = 'İzmir')),
('İzmir Ekonomi Üniversitesi', 'izmir-ekonomi-universitesi', (SELECT id FROM cities WHERE name = 'İzmir')),
('Yaşar Üniversitesi', 'yasar-universitesi', (SELECT id FROM cities WHERE name = 'İzmir')),
('İzmir Bakırçay Üniversitesi', 'izmir-bakircay-universitesi', (SELECT id FROM cities WHERE name = 'İzmir')),
('İzmir Demokrasi Üniversitesi', 'izmir-demokrasi-universitesi', (SELECT id FROM cities WHERE name = 'İzmir')),
('İzmir Katip Çelebi Üniversitesi', 'izmir-katip-celebi-universitesi', (SELECT id FROM cities WHERE name = 'İzmir')),
('İzmir Tınaztepe Üniversitesi', 'izmir-tinaztepe-universitesi', (SELECT id FROM cities WHERE name = 'İzmir')),
('Gediz Üniversitesi', 'gediz-universitesi', (SELECT id FROM cities WHERE name = 'İzmir')),
('Piri Reis Üniversitesi İzmir', 'piri-reis-universitesi-izmir', (SELECT id FROM cities WHERE name = 'İzmir')),

-- Bursa
('Uludağ Üniversitesi', 'uludag-universitesi', (SELECT id FROM cities WHERE name = 'Bursa')),
('Bursa Teknik Üniversitesi', 'bursa-teknik-universitesi', (SELECT id FROM cities WHERE name = 'Bursa')),
('Bursa Uludağ Üniversitesi', 'bursa-uludag-universitesi', (SELECT id FROM cities WHERE name = 'Bursa')),
('Orhangazi Üniversitesi', 'orhangazi-universitesi', (SELECT id FROM cities WHERE name = 'Bursa')),

-- Antalya
('Akdeniz Üniversitesi', 'akdeniz-universitesi', (SELECT id FROM cities WHERE name = 'Antalya')),
('Antalya Bilim Üniversitesi', 'antalya-bilim-universitesi', (SELECT id FROM cities WHERE name = 'Antalya')),
('Antalya AKEV Üniversitesi', 'antalya-akev-universitesi', (SELECT id FROM cities WHERE name = 'Antalya')),
('Alanya Alaaddin Keykubat Üniversitesi', 'alanya-alaaddin-keykubat-universitesi', (SELECT id FROM cities WHERE name = 'Antalya')),
('Alanya Hamdullah Emin Paşa Üniversitesi', 'alanya-hamdullah-emin-pasa-universitesi', (SELECT id FROM cities WHERE name = 'Antalya')),

-- Adana
('Çukurova Üniversitesi', 'cukurova-universitesi', (SELECT id FROM cities WHERE name = 'Adana')),
('Çağ Üniversitesi', 'cag-universitesi', (SELECT id FROM cities WHERE name = 'Adana')),
('Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi', 'adana-alparslan-turkes-bilim-ve-teknoloji-universitesi', (SELECT id FROM cities WHERE name = 'Adana')),

-- Konya
('Selçuk Üniversitesi', 'selcuk-universitesi', (SELECT id FROM cities WHERE name = 'Konya')),
('Konya Teknik Üniversitesi', 'konya-teknik-universitesi', (SELECT id FROM cities WHERE name = 'Konya')),
('KTO Karatay Üniversitesi', 'kto-karatay-universitesi', (SELECT id FROM cities WHERE name = 'Konya')),
('Necmettin Erbakan Üniversitesi', 'necmettin-erbakan-universitesi', (SELECT id FROM cities WHERE name = 'Konya')),

-- Gaziantep
('Gaziantep Üniversitesi', 'gaziantep-universitesi', (SELECT id FROM cities WHERE name = 'Gaziantep')),
('Hasan Kalyoncu Üniversitesi', 'hasan-kalyoncu-universitesi', (SELECT id FROM cities WHERE name = 'Gaziantep')),
('Gaziantep İslam Bilim ve Teknoloji Üniversitesi', 'gaziantep-islam-bilim-ve-teknoloji-universitesi', (SELECT id FROM cities WHERE name = 'Gaziantep')),

-- Kayseri
('Erciyes Üniversitesi', 'erciyes-universitesi', (SELECT id FROM cities WHERE name = 'Kayseri')),
('Abdullah Gül Üniversitesi', 'abdullah-gul-universitesi', (SELECT id FROM cities WHERE name = 'Kayseri')),
('Kayseri Üniversitesi', 'kayseri-universitesi', (SELECT id FROM cities WHERE name = 'Kayseri')),

-- Trabzon
('Karadeniz Teknik Üniversitesi', 'karadeniz-teknik-universitesi', (SELECT id FROM cities WHERE name = 'Trabzon')),
('Avrasya Üniversitesi', 'avrasya-universitesi', (SELECT id FROM cities WHERE name = 'Trabzon')),

-- Samsun
('Ondokuz Mayıs Üniversitesi', 'ondokuz-mayis-universitesi', (SELECT id FROM cities WHERE name = 'Samsun')),
('Samsun Üniversitesi', 'samsun-universitesi', (SELECT id FROM cities WHERE name = 'Samsun')),

-- Eskişehir
('Anadolu Üniversitesi', 'anadolu-universitesi', (SELECT id FROM cities WHERE name = 'Eskişehir')),
('Osmangazi Üniversitesi', 'osmangazi-universitesi', (SELECT id FROM cities WHERE name = 'Eskişehir')),
('Eskişehir Teknik Üniversitesi', 'eskisehir-teknik-universitesi', (SELECT id FROM cities WHERE name = 'Eskişehir')),

-- Erzurum
('Atatürk Üniversitesi', 'ataturk-universitesi', (SELECT id FROM cities WHERE name = 'Erzurum')),
('Erzurum Teknik Üniversitesi', 'erzurum-teknik-universitesi', (SELECT id FROM cities WHERE name = 'Erzurum')),

-- Malatya
('İnönü Üniversitesi', 'inonu-universitesi', (SELECT id FROM cities WHERE name = 'Malatya')),
('Malatya Turgut Özal Üniversitesi', 'malatya-turgut-ozal-universitesi', (SELECT id FROM cities WHERE name = 'Malatya')),

-- Elazığ
('Fırat Üniversitesi', 'firat-universitesi', (SELECT id FROM cities WHERE name = 'Elazığ')),

-- Sakarya
('Sakarya Üniversitesi', 'sakarya-universitesi', (SELECT id FROM cities WHERE name = 'Sakarya')),
('Sakarya Uygulamalı Bilimler Üniversitesi', 'sakarya-uygulamali-bilimler-universitesi', (SELECT id FROM cities WHERE name = 'Sakarya')),

-- Kocaeli
('Kocaeli Üniversitesi', 'kocaeli-universitesi', (SELECT id FROM cities WHERE name = 'Kocaeli')),
('Gebze Teknik Üniversitesi', 'gebze-teknik-universitesi', (SELECT id FROM cities WHERE name = 'Kocaeli')),

-- Denizli
('Pamukkale Üniversitesi', 'pamukkale-universitesi', (SELECT id FROM cities WHERE name = 'Denizli')),

-- Isparta
('Süleyman Demirel Üniversitesi', 'suleyman-demirel-universitesi', (SELECT id FROM cities WHERE name = 'Isparta')),

-- Mersin
('Mersin Üniversitesi', 'mersin-universitesi', (SELECT id FROM cities WHERE name = 'Mersin')),
('Tarsus Üniversitesi', 'tarsus-universitesi', (SELECT id FROM cities WHERE name = 'Mersin')),

-- Diyarbakır
('Dicle Üniversitesi', 'dicle-universitesi', (SELECT id FROM cities WHERE name = 'Diyarbakır')),

-- Van
('Van Yüzüncü Yıl Üniversitesi', 'van-yuzuncu-yil-universitesi', (SELECT id FROM cities WHERE name = 'Van')),

-- Sivas
('Cumhuriyet Üniversitesi', 'cumhuriyet-universitesi', (SELECT id FROM cities WHERE name = 'Sivas')),
('Sivas Bilim ve Teknoloji Üniversitesi', 'sivas-bilim-ve-teknoloji-universitesi', (SELECT id FROM cities WHERE name = 'Sivas')),

-- Kırıkkale
('Kırıkkale Üniversitesi', 'kirikkale-universitesi', (SELECT id FROM cities WHERE name = 'Kırıkkale')),

-- Afyon
('Afyon Kocatepe Üniversitesi', 'afyon-kocatepe-universitesi', (SELECT id FROM cities WHERE name = 'Afyonkarahisar')),
('Afyon Sağlık Bilimleri Üniversitesi', 'afyon-saglik-bilimleri-universitesi', (SELECT id FROM cities WHERE name = 'Afyonkarahisar')),

-- Manisa
('Celal Bayar Üniversitesi', 'celal-bayar-universitesi', (SELECT id FROM cities WHERE name = 'Manisa')),

-- Çanakkale
('Çanakkale Onsekiz Mart Üniversitesi', 'canakkale-onsekiz-mart-universitesi', (SELECT id FROM cities WHERE name = 'Çanakkale')),

-- Balıkesir
('Balıkesir Üniversitesi', 'balikesir-universitesi', (SELECT id FROM cities WHERE name = 'Balıkesir')),

-- Muğla
('Muğla Sıtkı Koçman Üniversitesi', 'mugla-sitki-kocman-universitesi', (SELECT id FROM cities WHERE name = 'Muğla')),

-- Aydın
('Adnan Menderes Üniversitesi', 'adnan-menderes-universitesi', (SELECT id FROM cities WHERE name = 'Aydın')),

-- Hatay
('Hatay Mustafa Kemal Üniversitesi', 'hatay-mustafa-kemal-universitesi', (SELECT id FROM cities WHERE name = 'Hatay')),
('İskenderun Teknik Üniversitesi', 'iskenderun-teknik-universitesi', (SELECT id FROM cities WHERE name = 'Hatay')),

-- Kahramanmaraş
('Kahramanmaraş Sütçü İmam Üniversitesi', 'kahramanmaras-sutcu-imam-universitesi', (SELECT id FROM cities WHERE name = 'Kahramanmaraş')),
('Kahramanmaraş İstiklal Üniversitesi', 'kahramanmaras-istiklal-universitesi', (SELECT id FROM cities WHERE name = 'Kahramanmaraş')),

-- Ordu
('Ordu Üniversitesi', 'ordu-universitesi', (SELECT id FROM cities WHERE name = 'Ordu')),

-- Giresun
('Giresun Üniversitesi', 'giresun-universitesi', (SELECT id FROM cities WHERE name = 'Giresun')),

-- Rize
('Recep Tayyip Erdoğan Üniversitesi', 'recep-tayyip-erdogan-universitesi', (SELECT id FROM cities WHERE name = 'Rize')),

-- Artvin
('Artvin Çoruh Üniversitesi', 'artvin-coruh-universitesi', (SELECT id FROM cities WHERE name = 'Artvin')),

-- Kastamonu
('Kastamonu Üniversitesi', 'kastamonu-universitesi', (SELECT id FROM cities WHERE name = 'Kastamonu')),

-- Sinop
('Sinop Üniversitesi', 'sinop-universitesi', (SELECT id FROM cities WHERE name = 'Sinop')),

-- Zonguldak
('Bülent Ecevit Üniversitesi', 'bulent-ecevit-universitesi', (SELECT id FROM cities WHERE name = 'Zonguldak')),

-- Düzce
('Düzce Üniversitesi', 'duzce-universitesi', (SELECT id FROM cities WHERE name = 'Düzce')),

-- Bolu
('Abant İzzet Baysal Üniversitesi', 'abant-izzet-baysal-universitesi', (SELECT id FROM cities WHERE name = 'Bolu')),

-- Yalova
('Yalova Üniversitesi', 'yalova-universitesi', (SELECT id FROM cities WHERE name = 'Yalova')),

-- Tekirdağ
('Namık Kemal Üniversitesi', 'namik-kemal-universitesi', (SELECT id FROM cities WHERE name = 'Tekirdağ')),

-- Edirne
('Trakya Üniversitesi', 'trakya-universitesi', (SELECT id FROM cities WHERE name = 'Edirne')),

-- Kırklareli
('Kırklareli Üniversitesi', 'kirklareli-universitesi', (SELECT id FROM cities WHERE name = 'Kırklareli')),

-- Çorum
('Hitit Üniversitesi', 'hitit-universitesi', (SELECT id FROM cities WHERE name = 'Çorum')),

-- Amasya
('Amasya Üniversitesi', 'amasya-universitesi', (SELECT id FROM cities WHERE name = 'Amasya')),

-- Tokat
('Gaziosmanpaşa Üniversitesi', 'gaziosmanpasa-universitesi', (SELECT id FROM cities WHERE name = 'Tokat')),

-- Yozgat
('Bozok Üniversitesi', 'bozok-universitesi', (SELECT id FROM cities WHERE name = 'Yozgat')),

-- Nevşehir
('Nevşehir Hacı Bektaş Veli Üniversitesi', 'nevsehir-haci-bektas-veli-universitesi', (SELECT id FROM cities WHERE name = 'Nevşehir')),
('Kapadokya Üniversitesi', 'kapadokya-universitesi', (SELECT id FROM cities WHERE name = 'Nevşehir')),

-- Kırşehir
('Ahi Evran Üniversitesi', 'ahi-evran-universitesi', (SELECT id FROM cities WHERE name = 'Kırşehir')),

-- Aksaray
('Aksaray Üniversitesi', 'aksaray-universitesi', (SELECT id FROM cities WHERE name = 'Aksaray')),

-- Niğde
('Niğde Ömer Halisdemir Üniversitesi', 'nigde-omer-halisdemir-universitesi', (SELECT id FROM cities WHERE name = 'Niğde')),

-- Karaman
('Karamanoğlu Mehmetbey Üniversitesi', 'karamanoglu-mehmetbey-universitesi', (SELECT id FROM cities WHERE name = 'Karaman')),

-- Usak
('Uşak Üniversitesi', 'usak-universitesi', (SELECT id FROM cities WHERE name = 'Uşak')),

-- Kütahya
('Dumlupınar Üniversitesi', 'dumlupinar-universitesi', (SELECT id FROM cities WHERE name = 'Kütahya')),

-- Bilecik
('Bilecik Şeyh Edebali Üniversitesi', 'bilecik-seyh-edebali-universitesi', (SELECT id FROM cities WHERE name = 'Bilecik')),

-- Burdur
('Burdur Mehmet Akif Ersoy Üniversitesi', 'burdur-mehmet-akif-ersoy-universitesi', (SELECT id FROM cities WHERE name = 'Burdur')),

-- Antalya (Devam)
('Akdeniz Üniversitesi', 'akdeniz-universitesi-2', (SELECT id FROM cities WHERE name = 'Antalya')),

-- Şanlıurfa
('Harran Üniversitesi', 'harran-universitesi', (SELECT id FROM cities WHERE name = 'Şanlıurfa')),

-- Batman
('Batman Üniversitesi', 'batman-universitesi', (SELECT id FROM cities WHERE name = 'Batman')),

-- Mardin
('Mardin Artuklu Üniversitesi', 'mardin-artuklu-universitesi', (SELECT id FROM cities WHERE name = 'Mardin')),

-- Şırnak
('Şırnak Üniversitesi', 'sirnak-universitesi', (SELECT id FROM cities WHERE name = 'Şırnak')),

-- Hakkari
('Hakkari Üniversitesi', 'hakkari-universitesi', (SELECT id FROM cities WHERE name = 'Hakkari')),

-- Bitlis
('Bitlis Eren Üniversitesi', 'bitlis-eren-universitesi', (SELECT id FROM cities WHERE name = 'Bitlis')),

-- Muş
('Muş Alparslan Üniversitesi', 'mus-alparslan-universitesi', (SELECT id FROM cities WHERE name = 'Muş')),

-- Ağrı
('Ağrı İbrahim Çeçen Üniversitesi', 'agri-ibrahim-cecen-universitesi', (SELECT id FROM cities WHERE name = 'Ağrı')),

-- Iğdır
('Iğdır Üniversitesi', 'igdir-universitesi', (SELECT id FROM cities WHERE name = 'Iğdır')),

-- Kars
('Kafkas Üniversitesi', 'kafkas-universitesi', (SELECT id FROM cities WHERE name = 'Kars')),

-- Ardahan
('Ardahan Üniversitesi', 'ardahan-universitesi', (SELECT id FROM cities WHERE name = 'Ardahan')),

-- Gümüşhane
('Gümüşhane Üniversitesi', 'gumushane-universitesi', (SELECT id FROM cities WHERE name = 'Gümüşhane')),

-- Bayburt
('Bayburt Üniversitesi', 'bayburt-universitesi', (SELECT id FROM cities WHERE name = 'Bayburt'));

-- RLS politikaları ekle
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Universities are viewable by everyone" ON universities
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert universities" ON universities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update universities" ON universities
  FOR UPDATE USING (auth.role() = 'authenticated');