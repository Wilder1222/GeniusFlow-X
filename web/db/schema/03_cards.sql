-- =============================================
-- GeniusFlow-X Database Schema: Cards (卡片)
-- =============================================

-- 卡片表
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    front TEXT NOT NULL, -- 正面内容 (问题)
    back TEXT NOT NULL, -- 背面内容 (答案)
    tags TEXT[] DEFAULT '{}', -- 标签数组
    state TEXT DEFAULT 'new' CHECK (state IN ('new', 'learning', 'review', 'relearning', 'suspended', 'buried')),
    
    -- FSRS 算法相关字段
    difficulty REAL DEFAULT 0, -- 难度 (0-10)
    stability REAL DEFAULT 0, -- 稳定性
    due_date TIMESTAMPTZ, -- 下次复习时间
    last_review TIMESTAMPTZ, -- 上次复习时间
    reps INTEGER DEFAULT 0, -- 复习次数
    lapses INTEGER DEFAULT 0, -- 遗忘次数
    
    -- 媒体相关
    front_media JSONB DEFAULT '[]', -- 正面媒体文件
    back_media JSONB DEFAULT '[]', -- 背面媒体文件
    
    -- 元数据
    note TEXT, -- 笔记/备注
    source TEXT, -- 来源 (manual, ai, import)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_state ON cards(state);
CREATE INDEX IF NOT EXISTS idx_cards_due_date ON cards(due_date);
CREATE INDEX IF NOT EXISTS idx_cards_tags ON cards USING GIN(tags);

-- 更新时间戳触发器
CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 卡片数量更新触发器
CREATE OR REPLACE FUNCTION update_deck_card_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE decks SET 
            card_count = card_count + 1,
            new_count = CASE WHEN NEW.state = 'new' THEN new_count + 1 ELSE new_count END
        WHERE id = NEW.deck_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE decks SET 
            card_count = card_count - 1,
            new_count = CASE WHEN OLD.state = 'new' THEN new_count - 1 ELSE new_count END
        WHERE id = OLD.deck_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.deck_id != NEW.deck_id THEN
            UPDATE decks SET card_count = card_count - 1 WHERE id = OLD.deck_id;
            UPDATE decks SET card_count = card_count + 1 WHERE id = NEW.deck_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deck_counts_on_card_change
    AFTER INSERT OR UPDATE OR DELETE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_deck_card_counts();

-- 启用 RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view own cards" ON cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON cards
    FOR DELETE USING (auth.uid() = user_id);
