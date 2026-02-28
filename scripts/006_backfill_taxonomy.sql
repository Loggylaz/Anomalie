WITH normalized_posts AS (
  SELECT
    p.id,
    CASE
      WHEN POSITION(' - ' IN p.genre) > 0 THEN TRIM(SPLIT_PART(p.genre, ' - ', 2))
      ELSE TRIM(p.genre)
    END AS genre_name
  FROM public.posts p
  WHERE p.genre IS NOT NULL AND TRIM(p.genre) <> ''
),
distinct_genres AS (
  SELECT DISTINCT genre_name
  FROM normalized_posts
  WHERE genre_name <> ''
)
INSERT INTO public.genres (name, slug)
SELECT
  dg.genre_name,
  TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(dg.genre_name), '[^a-z0-9]+', '-', 'g')) AS slug
FROM distinct_genres dg
ON CONFLICT (slug) DO NOTHING;

WITH normalized_posts AS (
  SELECT
    p.id,
    CASE
      WHEN POSITION(' - ' IN p.genre) > 0 THEN TRIM(SPLIT_PART(p.genre, ' - ', 2))
      ELSE TRIM(p.genre)
    END AS genre_name
  FROM public.posts p
)
UPDATE public.posts p
SET genre_id = g.id
FROM normalized_posts np
JOIN public.genres g
  ON LOWER(g.name) = LOWER(np.genre_name)
WHERE p.id = np.id
  AND p.genre_id IS NULL;

WITH normalized_posts AS (
  SELECT
    p.id,
    CASE
      WHEN POSITION(' - ' IN p.genre) > 0 THEN LOWER(TRIM(SPLIT_PART(p.genre, ' - ', 1)))
      ELSE NULL
    END AS origin_label
  FROM public.posts p
)
UPDATE public.posts p
SET origin_id = o.id
FROM normalized_posts np
JOIN public.origins o ON (
  (np.origin_label LIKE '%belge%' AND o.slug = 'belge')
  OR (np.origin_label LIKE '%franc%' AND o.slug = 'francaise')
  OR (np.origin_label LIKE '%etrang%' AND o.slug = 'etrangere')
)
WHERE p.id = np.id
  AND p.origin_id IS NULL;
