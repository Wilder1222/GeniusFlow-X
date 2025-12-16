-- =============================================
-- RLS Policies Summary
-- =============================================
-- This file consolidates all RLS policies for reference
-- Individual policies are defined in their respective schema files

-- Enable RLS on all tables (run if not already enabled)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS deck_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS likes ENABLE ROW LEVEL SECURITY;

-- Helper function to check deck ownership
CREATE OR REPLACE FUNCTION is_deck_owner(deck_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM decks 
        WHERE id = deck_uuid AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if deck is public
CREATE OR REPLACE FUNCTION is_deck_public(deck_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM decks 
        WHERE id = deck_uuid AND is_public = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
