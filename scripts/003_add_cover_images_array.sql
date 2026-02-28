ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS cover_images TEXT[] DEFAULT '{}';

UPDATE public.posts
SET cover_images =
  CASE
    WHEN cover_images IS NULL OR array_length(cover_images, 1) IS NULL
      THEN ARRAY[COALESCE(NULLIF(cover_image, ''), '/placeholder.svg?height=600&width=400')]
    ELSE cover_images
  END;
