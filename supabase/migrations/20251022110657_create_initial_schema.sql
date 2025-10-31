/*
  # Initial Schema for Anonim İtiraf Pazarı
  
  1. New Tables
    - `profiles` - Extended user information
      - `id` (uuid, FK to auth.users)
      - `role` (text, default 'user')
      - `is_premium` (boolean, default false)
      - `premium_expires_at` (timestamptz, nullable)
      - `posts_today` (int, default 0)
      - `reactions_today` (int, default 0)
      - `last_post_date` (date, nullable)
      - `last_reaction_date` (date, nullable)
      - `is_banned` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `categories` - Post categories
      - `id` (uuid, PK)
      - `name` (text)
      - `slug` (text, unique)
      - `icon` (text)
      - `is_premium` (boolean, default false)
      - `seo_title` (text, nullable)
      - `seo_description` (text, nullable)
      - `seo_keywords` (text, nullable)
      - `order_index` (int, default 0)
      - `created_at` (timestamptz)
    
    - `posts` - Anonymous confessions
      - `id` (uuid, PK)
      - `content` (text)
      - `category_id` (uuid, FK)
      - `author_id` (uuid, nullable FK to auth.users)
      - `author_ip_hash` (text)
      - `likes_count` (int, default 0)
      - `dislikes_count` (int, default 0)
      - `comments_count` (int, default 0)
      - `reports_count` (int, default 0)
      - `is_hidden` (boolean, default false)
      - `is_boosted` (boolean, default false)
      - `boosted_until` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `comments` - Post comments
      - `id` (uuid, PK)
      - `post_id` (uuid, FK)
      - `content` (text)
      - `author_id` (uuid, nullable FK to auth.users)
      - `author_ip_hash` (text)
      - `is_hidden` (boolean, default false)
      - `created_at` (timestamptz)
    
    - `reactions` - Likes/dislikes
      - `id` (uuid, PK)
      - `post_id` (uuid, FK)
      - `user_id` (uuid, nullable FK to auth.users)
      - `ip_hash` (text)
      - `type` (text, 'like' or 'dislike')
      - `created_at` (timestamptz)
    
    - `reports` - User reports
      - `id` (uuid, PK)
      - `post_id` (uuid, FK)
      - `reporter_id` (uuid, nullable FK to auth.users)
      - `reporter_ip_hash` (text)
      - `reason` (text)
      - `created_at` (timestamptz)
    
    - `payments` - Payment transactions
      - `id` (uuid, PK)
      - `user_id` (uuid, FK to auth.users)
      - `merchant_oid` (text, unique)
      - `payment_type` (text, 'subscription' or 'boost')
      - `amount` (decimal)
      - `status` (text, default 'pending')
      - `paytr_token` (text, nullable)
      - `post_id` (uuid, nullable FK for boosts)
      - `subscription_duration` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `boosts` - Boosted posts tracking
      - `id` (uuid, PK)
      - `post_id` (uuid, FK)
      - `payment_id` (uuid, FK)
      - `boosted_until` (timestamptz)
      - `created_at` (timestamptz)
    
    - `ads` - Advertisement management
      - `id` (uuid, PK)
      - `name` (text)
      - `position` (text, 'header', 'footer', 'in_feed')
      - `content` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `seo_settings` - SEO configuration
      - `id` (uuid, PK)
      - `site_title` (text)
      - `site_description` (text)
      - `site_keywords` (text)
      - `robots_txt` (text)
      - `updated_at` (timestamptz)
    
    - `bad_words` - Content filter
      - `id` (uuid, PK)
      - `word` (text, unique)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Policies for public read/write on posts, comments, reactions
    - Admin-only access to sensitive tables
    - User can update own profile
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'user',
  is_premium boolean DEFAULT false,
  premium_expires_at timestamptz,
  posts_today int DEFAULT 0,
  reactions_today int DEFAULT 0,
  last_post_date date,
  last_reaction_date date,
  is_banned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text DEFAULT 'heart',
  is_premium boolean DEFAULT false,
  seo_title text,
  seo_description text,
  seo_keywords text,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Insert default categories
INSERT INTO categories (name, slug, icon, is_premium, order_index) VALUES
  ('Aşk', 'ask', 'heart', false, 1),
  ('İş', 'is', 'briefcase', false, 2),
  ('Okul', 'okul', 'book', false, 3),
  ('Arkadaşlık', 'arkadaslik', 'users', false, 4),
  ('Gizli', 'gizli', 'lock', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_ip_hash text NOT NULL,
  likes_count int DEFAULT 0,
  dislikes_count int DEFAULT 0,
  comments_count int DEFAULT 0,
  reports_count int DEFAULT 0,
  is_hidden boolean DEFAULT false,
  is_boosted boolean DEFAULT false,
  boosted_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-hidden posts"
  ON posts FOR SELECT
  TO public
  USING (is_hidden = false);

CREATE POLICY "Anyone can insert posts"
  ON posts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all posts"
  ON posts FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_boosted ON posts(is_boosted, boosted_until);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_ip_hash text NOT NULL,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-hidden comments"
  ON comments FOR SELECT
  TO public
  USING (is_hidden = false);

CREATE POLICY "Anyone can insert comments"
  ON comments FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all comments"
  ON comments FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update comments"
  ON comments FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete comments"
  ON comments FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- Create reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_hash text NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'dislike')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, ip_hash)
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON reactions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert reactions"
  ON reactions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can delete own reactions"
  ON reactions FOR DELETE
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_ip ON reactions(ip_hash);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_ip_hash text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert reports"
  ON reports FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view reports"
  ON reports FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE INDEX IF NOT EXISTS idx_reports_post ON reports(post_id);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_oid text UNIQUE NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('subscription', 'boost')),
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  paytr_token text,
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  subscription_duration text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create boosts table
CREATE TABLE IF NOT EXISTS boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
  boosted_until timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view boosts"
  ON boosts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage boosts"
  ON boosts FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL CHECK (position IN ('header', 'footer', 'in_feed')),
  content text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ads"
  ON ads FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage ads"
  ON ads FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create seo_settings table
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title text DEFAULT 'Anonim İtiraf Pazarı',
  site_description text DEFAULT 'Anonim olarak itiraflarınızı paylaşın',
  site_keywords text DEFAULT 'itiraf, anonim, paylaşım',
  robots_txt text DEFAULT 'User-agent: *\nAllow: /',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seo settings"
  ON seo_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage seo settings"
  ON seo_settings FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Insert default SEO settings
INSERT INTO seo_settings (site_title, site_description, site_keywords)
VALUES ('Anonim İtiraf Pazarı', 'Anonim olarak itiraflarınızı paylaşın ve diğer insanların hikayelerini keşfedin', 'itiraf, anonim, paylaşım, aşk, iş, okul')
ON CONFLICT DO NOTHING;

-- Create bad_words table
CREATE TABLE IF NOT EXISTS bad_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bad_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bad words"
  ON bad_words FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update post counts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment count
DROP TRIGGER IF EXISTS update_comment_count ON comments;
CREATE TRIGGER update_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();
