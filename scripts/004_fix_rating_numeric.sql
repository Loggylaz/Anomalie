ALTER TABLE public.posts
ALTER COLUMN rating TYPE NUMERIC(2,1)
USING rating::NUMERIC(2,1);

ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_rating_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'posts_rating_check'
      AND conrelid = 'public.posts'::regclass
  ) THEN
    ALTER TABLE public.posts
    ADD CONSTRAINT posts_rating_check
    CHECK (rating >= 1 AND rating <= 5);
  END IF;
END $$;
