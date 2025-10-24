/*
  # Fix posts insert policy for anonymous users

  1. Security
    - Allow anonymous users to insert posts
    - Remove restrictive policies that prevent anonymous posting
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert posts" ON posts;
DROP POLICY IF EXISTS "Users can insert posts" ON posts;

-- Create new policy that allows anyone (including anonymous) to insert posts
CREATE POLICY "Allow anonymous post creation"
  ON posts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure the policy for viewing posts exists
DROP POLICY IF EXISTS "Anyone can view non-hidden posts" ON posts;
CREATE POLICY "Anyone can view non-hidden posts"
  ON posts
  FOR SELECT
  TO public
  USING (is_hidden = false);