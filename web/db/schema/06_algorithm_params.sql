-- =============================================
-- User Algorithm Parameters Table
-- 存储用户自定义的FSRS算法参数
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_algorithm_params (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    request_retention DECIMAL(3,2) DEFAULT 0.90 CHECK (request_retention >= 0.70 AND request_retention <= 0.99),
    maximum_interval INTEGER DEFAULT 36500 CHECK (maximum_interval >= 1),
    w JSONB, -- FSRS权重参数数组
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_algorithm_params_user_id ON public.user_algorithm_params(user_id);

-- 启用行级安全
ALTER TABLE public.user_algorithm_params ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户只能查看和修改自己的参数
CREATE POLICY "Users can view own algorithm params"
    ON public.user_algorithm_params FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own algorithm params"
    ON public.user_algorithm_params FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own algorithm params"
    ON public.user_algorithm_params FOR UPDATE
    USING (auth.uid() = user_id);

-- 注释
COMMENT ON TABLE public.user_algorithm_params IS '用户自定义FSRS算法参数';
COMMENT ON COLUMN public.user_algorithm_params.request_retention IS '目标留存率（0.70-0.99）';
COMMENT ON COLUMN public.user_algorithm_params.maximum_interval IS '最大复习间隔（天）';
COMMENT ON COLUMN public.user_algorithm_params.w IS 'FSRS权重参数（JSON数组）';
