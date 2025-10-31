/*
  # Fix profiles table RLS policy infinite recursion

  1. Security Changes
    - Drop all existing RLS policies on profiles table
    - Create new policies without recursive queries
    - Use auth.uid() directly for user access
    - Use service role for admin operations via API

  2. Policy Structure
    - Users can only view/update their own profile
    - Admin operations handled via service role in API routes
    - No policy queries the profiles table itself
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: Admin operations will be handled via service role in API routes
-- This eliminates the need for recursive policies that check roles
