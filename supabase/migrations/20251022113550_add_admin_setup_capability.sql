/*
  # Add Admin Setup and Role Management
  
  1. Updates
    - Add role constraint to profiles table
    - Add helper function to set user as admin
    - Add index on role column for better performance
  
  2. Security
    - Only allows specific roles (user, admin, moderator)
    - Validates role changes
  
  3. Important Notes
    - To create first admin, use Supabase SQL Editor:
      UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
    - Or use the helper function:
      SELECT set_user_role('user-email@example.com', 'admin');
*/

-- Add role constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'admin', 'moderator'));
  END IF;
END $$;

-- Create index on role for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Helper function to set user role
CREATE OR REPLACE FUNCTION set_user_role(user_email text, new_role text)
RETURNS void AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Validate role
  IF new_role NOT IN ('user', 'admin', 'moderator') THEN
    RAISE EXCEPTION 'Invalid role. Must be user, admin, or moderator';
  END IF;

  -- Get user ID from email
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email;

  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Update role
  UPDATE profiles
  SET role = new_role, updated_at = now()
  WHERE id = user_uuid;

  RAISE NOTICE 'Role updated to % for user %', new_role, user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
