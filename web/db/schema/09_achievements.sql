-- =============================================
-- Achievements System Tables
-- 成就系统
-- =============================================

-- 成就定义表
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('beginner', 'streak', 'creator', 'accuracy', 'special')),
    requirement JSONB NOT NULL, -- 解锁条件 {"type": "review_count", "target": 50}
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户成就表
CREATE TABLE IF NOT EXISTS public.user_achievements (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON public.user_achievements(unlocked_at);

-- 启用行级安全
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS策略 - 成就表所有人可读
CREATE POLICY "Anyone can view achievements"
    ON public.achievements FOR SELECT
    USING (true);

-- RLS策略 - 用户成就
CREATE POLICY "Users can view own achievements"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
    ON public.user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 注释
COMMENT ON TABLE public.achievements IS '成就定义表';
COMMENT ON TABLE public.user_achievements IS '用户已解锁成就表';

-- 插入默认成就
INSERT INTO public.achievements (key, name, description, icon, category, requirement, xp_reward) VALUES
-- 新手成就
('beginner_10', '初学者', '复习10张卡片', '🎓', 'beginner', '{"type": "review_count", "target": 10}', 20),
('beginner_50', '学习者', '复习50张卡片', '📚', 'beginner', '{"type": "review_count", "target": 50}', 50),
('beginner_200', '学霸', '复习200张卡片', '🏆', 'beginner', '{"type": "review_count", "target": 200}', 100),
('beginner_1000', '大师', '复习1000张卡片', '🌟', 'beginner', '{"type": "review_count", "target": 1000}', 500),

-- 连胜成就
('streak_3', '热情', '保持3天连胜', '🔥', 'streak', '{"type": "streak", "target": 3}', 30),
('streak_7', '坚持', '保持7天连胜', '⚡', 'streak', '{"type": "streak", "target": 7}', 70),
('streak_30', '毅力', '保持30天连胜', '💎', 'streak', '{"type": "streak", "target": 30}', 300),

-- 创造者成就
('creator_10', '创作者', '创建10张卡片', '✏️', 'creator', '{"type": "create_count", "target": 10}', 25),
('creator_ai_50', 'AI助手', 'AI生成50张卡片', '🤖', 'creator', '{"type": "ai_generate_count", "target": 50}', 50),
('creator_500', '知识库', '拥有500张卡片', '📖', 'creator', '{"type": "total_cards", "target": 500}', 200),

-- 准确率成就
('accuracy_90', '精准', '单日准确率达到90%', '🎯', 'accuracy', '{"type": "daily_accuracy", "target": 90}', 40),
('accuracy_100', '完美', '单日准确率达到100%', '💯', 'accuracy', '{"type": "daily_accuracy", "target": 100}', 100),

-- 特殊成就
('level_10', '十级学者', '达到10级', '⭐', 'special', '{"type": "level", "target": 10}', 150),
('first_deck', '第一步', '创建第一个卡组', '🎉', 'special', '{"type": "deck_count", "target": 1}', 10)
ON CONFLICT (key) DO NOTHING;
