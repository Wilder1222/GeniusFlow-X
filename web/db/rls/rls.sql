-- GeniusFlow-X Consolidated RLS Policies (Live Synchronized)
-- This file documents and enables RLS for the actual tables in Supabase.

-- Helper function: Is user the owner of the deck?
CREATE OR REPLACE FUNCTION is_deck_owner(deck_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM decks
        WHERE id = deck_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Is the deck public?
CREATE OR REPLACE FUNCTION is_deck_public(deck_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM decks
        WHERE id = deck_id AND is_public = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-------------------------------------------------------------------------------
-- ENABLE RLS
-------------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_algorithm_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- POLICIES
-------------------------------------------------------------------------------

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (is_public = true OR auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Profile Settings
CREATE POLICY "Users can view own settings" ON profile_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON profile_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON profile_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Decks
CREATE POLICY "Public decks are viewable by everyone" ON decks FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own decks" ON decks FOR ALL USING (auth.uid() = user_id);

-- Cards
CREATE POLICY "Cards in public decks are viewable" ON cards FOR SELECT USING (is_deck_public(deck_id) OR auth.uid() = user_id);
CREATE POLICY "Users can manage own cards" ON cards FOR ALL USING (auth.uid() = user_id);

-- Study & Logs
CREATE POLICY "Users can view own review logs" ON review_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own review logs" ON review_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own study stats" ON study_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own study stats" ON study_stats FOR UPDATE USING (auth.uid() = user_id);

-- Gamification
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own XP transactions" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily tasks" ON daily_tasks FOR ALL USING (auth.uid() = user_id);

-- Algorithm & Templates
CREATE POLICY "Users can manage own algorithm params" ON user_algorithm_params FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public templates are viewable" ON card_templates FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own templates" ON card_templates FOR ALL USING (auth.uid() = user_id);

-- Social
CREATE POLICY "Anyone can view follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON user_follows FOR INSERT WITH CHECK (true); -- Usually restricted to auth, but follow live DB setup
CREATE POLICY "Users can unfollow" ON user_follows FOR DELETE USING (follower_id::text = auth.uid()::text OR following_id::text = auth.uid()::text);
