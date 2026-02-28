CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  genre TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  excerpt TEXT NOT NULL,
  review TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  cover_images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  instagram_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_public_read" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "posts_auth_insert" ON public.posts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "posts_auth_update" ON public.posts
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "posts_auth_delete" ON public.posts
  FOR DELETE TO authenticated USING (true);
