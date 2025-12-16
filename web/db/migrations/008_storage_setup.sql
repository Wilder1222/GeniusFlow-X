-- Supabase Storage Setup for GeniusFlow-X Media Support
-- Run this SQL in your Supabase SQL Editor
-- Note: Using existing 'GeniusFlow-X' bucket with folder structure: category/user_id/...

-- ============================================
-- Step 1: RLS Policies for Storage
-- ============================================
-- Note: Bucket 'GeniusFlow-X' already exists, just adding policies

-- Policy 1: Allow authenticated users to upload files to card-media/{their_user_id}/
CREATE POLICY "Users can upload card media to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'GeniusFlow-X' AND
  (storage.foldername(name))[1] = 'card-media' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 2: Allow authenticated users to delete their own card media files
CREATE POLICY "Users can delete own card media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'GeniusFlow-X' AND
  (storage.foldername(name))[1] = 'card-media' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 3: Allow public read access to card-media files
CREATE POLICY "Public read access to card media"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'GeniusFlow-X' AND
  (storage.foldername(name))[1] = 'card-media'
);

-- ============================================
-- Step 3: Update Cards Table Schema
-- ============================================

-- Add media columns to cards table
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS front_media TEXT,
ADD COLUMN IF NOT EXISTS back_media TEXT;

-- Add comments for documentation
COMMENT ON COLUMN cards.front_media IS '正面图片URL (Supabase Storage public URL)';
COMMENT ON COLUMN cards.back_media IS '背面图片URL (Supabase Storage public URL)';

-- ============================================
-- Step 3: Verification Queries
-- ============================================

-- Check if GeniusFlow-X bucket exists and is public
SELECT id, name, public FROM storage.buckets WHERE id = 'GeniusFlow-X';

-- Check card-media policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%card media%';

-- Check cards table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cards' 
AND column_name IN ('front_media', 'back_media');
