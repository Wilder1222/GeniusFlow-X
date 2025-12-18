-- Migration: Add TTS and email notification columns to profile_settings
-- Date: 2025-12-18

-- Add missing columns to profile_settings table
ALTER TABLE public.profile_settings 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tts_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tts_autoplay BOOLEAN DEFAULT false;

-- Update existing rows to have default values
UPDATE public.profile_settings 
SET 
    email_notifications = COALESCE(email_notifications, true),
    tts_enabled = COALESCE(tts_enabled, true),
    tts_autoplay = COALESCE(tts_autoplay, false)
WHERE email_notifications IS NULL 
   OR tts_enabled IS NULL 
   OR tts_autoplay IS NULL;
