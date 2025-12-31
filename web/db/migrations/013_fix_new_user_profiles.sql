-- Migration: Fix New User Profiles and Naming Inconsistency
-- Description: Adds missing xp/level to profiles, unifies table/column naming, and fixes existing users.

-- 1. Unify profiles table naming and add missing columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- If 'user_code' exists but 'user_id' is null, sync them
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_code') THEN
        UPDATE public.profiles SET user_id = user_code WHERE user_id IS NULL;
    END IF;
END $$;

-- 2. Ensure profile_settings table exists and is named correctly
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        ALTER TABLE public.user_settings RENAME TO profile_settings;
    END IF;
END $$;

-- 3. Update handle_new_user function to be robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id TEXT;
BEGIN
    -- Generate 9-digit ID
    v_user_id := LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
    
    -- Insert into profiles
    INSERT INTO public.profiles (id, user_id, email, username, xp, level)
    VALUES (
        NEW.id,
        v_user_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)),
        0,
        1
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = COALESCE(profiles.username, EXCLUDED.username);
    
    -- Insert into profile_settings
    INSERT INTO public.profile_settings (user_id, theme, language, daily_goal)
    VALUES (NEW.id, 'system', 'zh-CN', 20)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert into study_stats
    INSERT INTO public.study_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fix existing users missing profiles/settings/stats
INSERT INTO public.profiles (id, user_id, email, username, xp, level)
SELECT 
    u.id, 
    LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0'),
    u.email,
    'user_' || SUBSTRING(u.id::TEXT, 1, 8),
    0,
    1
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

INSERT INTO public.profile_settings (user_id, theme, language, daily_goal)
SELECT id, 'system', 'zh-CN', 20
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profile_settings);

INSERT INTO public.study_stats (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.study_stats);
