-- Username formatını anonymous123456 şekline güncelle

-- Username oluşturma fonksiyonunu güncelle
CREATE OR REPLACE FUNCTION generate_username()
RETURNS text AS $$
DECLARE
  new_username text;
  counter int := 1;
BEGIN
  LOOP
    -- 6 haneli rastgele sayı (100000-999999 arası)
    new_username := 'anonymous' || floor(random() * 900000 + 100000)::text;
    
    -- Kullanıcı adının benzersiz olup olmadığını kontrol et
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = new_username) THEN
      RETURN new_username;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      -- Çok fazla deneme yapıldıysa timestamp ekle
      new_username := 'anonymous' || extract(epoch from now())::bigint::text;
      RETURN new_username;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Mevcut kullanıcıların username'lerini güncelle
DO $$
DECLARE
    user_record RECORD;
    new_username text;
BEGIN
    FOR user_record IN SELECT id FROM profiles WHERE username IS NULL OR username LIKE 'kullanici%' LOOP
        -- Her kullanıcı için benzersiz username oluştur
        SELECT generate_username() INTO new_username;
        
        UPDATE profiles 
        SET username = new_username 
        WHERE id = user_record.id;
    END LOOP;
END $$;