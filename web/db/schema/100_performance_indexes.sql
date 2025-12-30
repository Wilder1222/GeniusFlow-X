-- Database Performance Optimization Indexes

-- Cards Table Optimization
-- Used in getDueCards, getCardsByDeckId
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON public.cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck_next_review ON public.cards(deck_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_cards_deck_created_at ON public.cards(deck_id, created_at);

-- Decks Table Optimization
-- Used in getUserDecks
CREATE INDEX IF NOT EXISTS idx_decks_user_id_created_at ON public.decks(user_id, created_at DESC);

-- Review Logs Optimization
-- Used in analytics and history fetch
CREATE INDEX IF NOT EXISTS idx_review_logs_card_id_reviewed_at ON public.review_logs(card_id, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_logs_user_id_reviewed_at ON public.review_logs(user_id, reviewed_at DESC);

-- Social Optimization
-- Used in follow lists
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_created_at ON public.user_follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_created_at ON public.user_follows(following_id, created_at DESC);

-- Gamification & Tasks Optimization
-- Used in daily tasks and XP history
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id_date ON public.daily_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id_created_at ON public.xp_transactions(user_id, created_at DESC);
