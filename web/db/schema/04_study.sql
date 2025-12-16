-- =============================================
-- GeniusFlow-X Database Schema: Study Records (学习记录)
-- =============================================

-- 学习会话表
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deck_id UUID REFERENCES public.decks(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    cards_studied INTEGER DEFAULT 0,
    cards_new INTEGER DEFAULT 0,
    cards_reviewed INTEGER DEFAULT 0,
    cards_relearned INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    total_time_ms INTEGER DEFAULT 0 -- 总学习时间（毫秒）
);

-- 单次复习记录表
CREATE TABLE IF NOT EXISTS public.review_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.study_sessions(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4), -- 1=Again, 2=Hard, 3=Good, 4=Easy
    state_before TEXT, -- 复习前状态
    state_after TEXT, -- 复习后状态
    elapsed_ms INTEGER, -- 思考时间（毫秒）
    scheduled_days REAL, -- 下次复习间隔（天）
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 每日统计表（汇总数据，提升查询性能）
CREATE TABLE IF NOT EXISTS public.daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    cards_studied INTEGER DEFAULT 0,
    cards_new INTEGER DEFAULT 0,
    cards_reviewed INTEGER DEFAULT 0,
    study_time_ms INTEGER DEFAULT 0,
    retention_rate REAL, -- 正确率
    streak_days INTEGER DEFAULT 0, -- 连续学习天数
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_review_logs_user_id ON review_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_card_id ON review_logs(card_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_reviewed_at ON review_logs(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);

-- 启用 RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view own study sessions" ON study_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own review logs" ON review_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily stats" ON daily_stats
    FOR ALL USING (auth.uid() = user_id);
