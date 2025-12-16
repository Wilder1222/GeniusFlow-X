-- =============================================
-- XP Transactions Table
-- 记录所有XP变动，用于审计和统计
-- =============================================

CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    metadata JSONB, -- 额外信息（如卡片ID、成就ID等）
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON public.xp_transactions(created_at);

-- 启用行级安全
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- RLS策略
CREATE POLICY "Users can view own xp transactions"
    ON public.xp_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp transactions"
    ON public.xp_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 注释
COMMENT ON TABLE public.xp_transactions IS 'XP变动记录表';
COMMENT ON COLUMN public.xp_transactions.amount IS 'XP变动量（可为负数）';
COMMENT ON COLUMN public.xp_transactions.reason IS '变动原因：review_card, create_card, daily_login, achievement等';
COMMENT ON COLUMN public.xp_transactions.metadata IS '额外信息（JSON格式）';
