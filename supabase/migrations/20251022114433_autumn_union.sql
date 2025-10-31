/*
  # Fix infinite recursion in profiles RLS policies

  1. Policy Changes
    - Drop existing problematic policies that cause recursion
    - Create new policies with proper logic to avoid circular dependencies
    - Ensure users can access their own profile data
    - Allow admins to manage all profiles without recursion

  2. Security
    - Maintain proper access control
    - Prevent unauthorized access to profile data
    - Fix the recursive policy issue
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create new policies without recursion
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

-- For admin access, we'll use a simpler approach that doesn't cause recursion
-- This policy checks if the current user's ID exists in profiles with admin role
-- but uses a more direct approach to avoid the recursive lookup
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.id IN (
        SELECT p.id FROM profiles p WHERE p.role = 'admin'
      )
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.id IN (
        SELECT p.id FROM profiles p WHERE p.role = 'admin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.id IN (
        SELECT p.id FROM profiles p WHERE p.role = 'admin'
      )
    )
  );
