-- Supabase Storage RLS Policies for Avatars
-- Run this SQL in your Supabase SQL Editor
-- Fixes: "new row violates row-level security policy" error for avatar uploads

-- ============================================
-- Step 1: RLS Policies for Avatars
-- ============================================

-- Policy 1: Allow authenticated users to upload avatars to avatars/{their_user_id}/
CREATE POLICY "Users can upload avatars to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'GeniusFlow-X' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 2: Allow authenticated users to update their own avatars (upsert)
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'GeniusFlow-X' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'GeniusFlow-X' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 3: Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'GeniusFlow-X' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 4: Allow public read access to all avatars
CREATE POLICY "Public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'GeniusFlow-X' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- ============================================
-- Verification Queries
-- ============================================

-- Check avatar policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%avatar%';
