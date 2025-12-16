-- =============================================
-- Daily Tasks System
-- 每日任务系统
-- =============================================

CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_key TEXT NOT NULL,
    task_name TEXT NOT NULL,
    task_description TEXT,
    target INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    xp_reward INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, task_key, date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_completed ON public.daily_tasks(completed);

-- 启用行级安全
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- RLS策略
CREATE POLICY "Users can view own daily tasks"
    ON public.daily_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily tasks"
    ON public.daily_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily tasks"
    ON public.daily_tasks FOR UPDATE
    USING (auth.uid() = user_id);

-- 注释
COMMENT ON TABLE public.daily_tasks IS '每日任务表';
COMMENT ON COLUMN public.daily_tasks.task_key IS '任务类型键：daily_review, daily_create等';
COMMENT ON COLUMN public.daily_tasks.target IS '目标数量';
COMMENT ON COLUMN public.daily_tasks.progress IS '当前进度';
COMMENT ON COLUMN public.daily_tasks.date IS '任务日期';
