-- Add missing columns to profiles table

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

-- Add unique constraint on nickname (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_nickname_unique') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_nickname_unique UNIQUE (nickname);
    END IF;
END $$;

-- Add unique constraint on username (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_unique') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
