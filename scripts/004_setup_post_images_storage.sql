INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'post_images_public_read'
  ) THEN
    CREATE POLICY "post_images_public_read"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'post-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'post_images_auth_insert'
  ) THEN
    CREATE POLICY "post_images_auth_insert"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'post-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'post_images_auth_update'
  ) THEN
    CREATE POLICY "post_images_auth_update"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'post-images')
      WITH CHECK (bucket_id = 'post-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'post_images_auth_delete'
  ) THEN
    CREATE POLICY "post_images_auth_delete"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'post-images');
  END IF;
END $$;
