-- =============================================
-- GeniusFlow-X Database Schema: Decks (卡组)
-- =============================================

-- 卡组表
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    color TEXT DEFAULT '#6366f1', -- 主题颜色
    icon TEXT DEFAULT '📚', -- 图标 emoji
    is_public BOOLEAN DEFAULT false, -- 是否公开
    parent_id UUID REFERENCES public.decks(id) ON DELETE SET NULL, -- 父卡组（支持嵌套）
    card_count INTEGER DEFAULT 0, -- 缓存的卡片数量
    new_count INTEGER DEFAULT 0, -- 新卡片数量
    learning_count INTEGER DEFAULT 0, -- 学习中数量
    review_count INTEGER DEFAULT 0, -- 待复习数量
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_decks_parent_id ON decks(parent_id);
CREATE INDEX IF NOT EXISTS idx_decks_is_public ON decks(is_public) WHERE is_public = true;

-- 更新时间戳触发器
CREATE TRIGGER update_decks_updated_at
    BEFORE UPDATE ON decks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 启用 RLS
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view own decks" ON decks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decks" ON decks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks" ON decks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks" ON decks
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public decks are viewable" ON decks
    FOR SELECT USING (is_public = true);
