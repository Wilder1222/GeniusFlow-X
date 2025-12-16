-- =============================================
-- Review Logs Table for GeniusFlow-X
-- Tracks每次复习的详细记录，用于统计分析和算法优化
-- =============================================

CREATE TABLE IF NOT EXISTS public.review_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4), -- 1=Again, 2=Hard, 3=Good, 4=Easy
    state TEXT NOT NULL CHECK (state IN ('new', 'learning', 'review', 'relearning')),
    scheduled_days INTEGER,
    ease_factor NUMERIC(4, 2),
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    time_spent_ms INTEGER, -- 复习花费时间（毫秒）
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_review_logs_card_id ON public.review_logs(card_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_user_id ON public.review_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_reviewed_at ON public.review_logs(reviewed_at);

-- 启用行级安全
ALTER TABLE public.review_logs ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户只能查看和插入自己的复习记录
CREATE POLICY "Users can view own review logs"
    ON public.review_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own review logs"
    ON public.review_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 注释
COMMENT ON TABLE public.review_logs IS '复习记录表，记录每次卡片复习的详细信息';
COMMENT ON COLUMN public.review_logs.rating IS '评分：1=Again, 2=Hard, 3=Good, 4=Easy';
COMMENT ON COLUMN public.review_logs.time_spent_ms IS '复习花费时间（毫秒）';
