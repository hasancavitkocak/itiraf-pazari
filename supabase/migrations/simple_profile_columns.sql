-- Add missing columns to profiles table (simple version)

-- Add username column (anonymous username like anonymous123456)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text;

-- Add nickname column (user chosen display name)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname text;

-- Add login_username column (for login purposes)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_username text;

-- Add display_username column (for display purposes)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_username text;

-- Add email column (derived from auth.users)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Add birth_year column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_year int;

-- Add gender column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);