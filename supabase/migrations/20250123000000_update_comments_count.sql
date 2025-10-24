-- Create functions for updating comment counts
CREATE OR REPLACE FUNCTION increment_comment_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET comments_count = comments_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_comment_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET comments_count = GREATEST(comments_count - 1, 0) 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Update comments_count for existing posts
-- This migration will calculate the correct comment count for all existing posts

UPDATE posts 
SET comments_count = (
  SELECT COUNT(*) 
  FROM comments 
  WHERE comments.post_id = posts.id 
  AND comments.is_hidden = false
)
WHERE comments_count = 0 OR comments_count IS NULL;

-- Also update likes_count and dislikes_count for consistency
UPDATE posts 
SET likes_count = (
  SELECT COUNT(*) 
  FROM reactions 
  WHERE reactions.post_id = posts.id 
  AND reactions.type = 'like'
)
WHERE likes_count = 0 OR likes_count IS NULL;

UPDATE posts 
SET dislikes_count = (
  SELECT COUNT(*) 
  FROM reactions 
  WHERE reactions.post_id = posts.id 
  AND reactions.type = 'dislike'
)
WHERE dislikes_count = 0 OR dislikes_count IS NULL;
