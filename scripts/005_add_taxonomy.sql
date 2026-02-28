CREATE TABLE IF NOT EXISTS public.origins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS origin_id UUID REFERENCES public.origins(id) ON DELETE SET NULL;

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS genre_id UUID REFERENCES public.genres(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS posts_origin_id_idx ON public.posts(origin_id);
CREATE INDEX IF NOT EXISTS posts_genre_id_idx ON public.posts(genre_id);

ALTER TABLE public.origins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'origins'
      AND policyname = 'origins_public_read'
  ) THEN
    CREATE POLICY "origins_public_read"
      ON public.origins
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'genres'
      AND policyname = 'genres_public_read'
  ) THEN
    CREATE POLICY "genres_public_read"
      ON public.genres
      FOR SELECT
      USING (true);
  END IF;
END $$;

INSERT INTO public.origins (slug, name)
VALUES
  ('belge', 'Belge'),
  ('francaise', 'Francaise'),
  ('etrangere', 'Etrangere')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.genres (slug, name)
VALUES
  ('thriller', 'Thriller'),
  ('cosy-mystery', 'Cosy Mystery'),
  ('jeunesse', 'Jeunesse'),
  ('bd', 'BD'),
  ('romance-noel', 'Romance (Noel)'),
  ('feel-good', 'Feel Good'),
  ('young-adult', 'Young Adult')
ON CONFLICT (slug) DO NOTHING;
