-- Add membership fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS ai_generation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_ai_reset TIMESTAMPTZ DEFAULT NOW();

-- Add check constraint for membership_tier
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS membership_tier_check;

ALTER TABLE public.profiles
ADD CONSTRAINT membership_tier_check 
CHECK (membership_tier IN ('free', 'pro'));
