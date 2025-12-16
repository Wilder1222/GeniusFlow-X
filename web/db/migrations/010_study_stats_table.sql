-- =============================================
-- GeniusFlow-X: Study Stats Table
-- 用户学习统计汇总表
-- =============================================

-- 创建 study_stats 表
CREATE TABLE IF NOT EXISTS public.study_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    total_cards_reviewed INTEGER DEFAULT 0,
    total_study_time_minutes INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_study_stats_user_id ON study_stats(user_id);

-- 启用 RLS
ALTER TABLE study_stats ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户可以查看和更新自己的统计
CREATE POLICY "Users can view own study stats" ON study_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study stats" ON study_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study stats" ON study_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- 添加注释
COMMENT ON TABLE study_stats IS '用户学习统计汇总表';
COMMENT ON COLUMN study_stats.total_cards_reviewed IS '总复习卡片数';
COMMENT ON COLUMN study_stats.total_study_time_minutes IS '总学习时间（分钟）';
COMMENT ON COLUMN study_stats.current_streak IS '当前连续学习天数';
COMMENT ON COLUMN study_stats.longest_streak IS '最长连续学习天数';
COMMENT ON COLUMN study_stats.last_study_date IS '最后学习日期';
