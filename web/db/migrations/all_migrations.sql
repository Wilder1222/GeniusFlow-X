-- =============================================
-- GeniusFlow-X 完整迁移脚本
-- 在 Supabase SQL Editor 中一次性执行
-- =============================================

-- 1. 添加 tags 列
ALTER TABLE cards ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_cards_tags ON cards USING GIN(tags);

-- 2. 添加 user_id 列（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE cards ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        UPDATE cards c
        SET user_id = d.user_id
        FROM decks d
        WHERE c.deck_id = d.id AND c.user_id IS NULL;
        
        CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
    END IF;
END $$;

-- 3. 创建事务性导入函数
CREATE OR REPLACE FUNCTION import_deck_with_cards(
    p_user_id UUID,
    p_deck_title TEXT,
    p_deck_description TEXT,
    p_cards JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deck_id UUID;
    v_inserted_count INTEGER := 0;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    IF p_deck_title IS NULL OR p_deck_title = '' THEN
        RAISE EXCEPTION 'deck_title is required';
    END IF;

    INSERT INTO decks (user_id, title, description)
    VALUES (p_user_id, p_deck_title, COALESCE(p_deck_description, ''))
    RETURNING id INTO v_deck_id;

    IF p_cards IS NOT NULL AND jsonb_array_length(p_cards) > 0 THEN
        INSERT INTO cards (deck_id, user_id, front, back, tags, state)
        SELECT 
            v_deck_id,
            p_user_id,
            (card->>'front')::TEXT,
            (card->>'back')::TEXT,
            COALESCE(
                ARRAY(SELECT jsonb_array_elements_text(card->'tags')),
                '{}'::TEXT[]
            ),
            'new'
        FROM jsonb_array_elements(p_cards) AS card;
        
        GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'deck_id', v_deck_id,
        'cards_imported', v_inserted_count
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

GRANT EXECUTE ON FUNCTION import_deck_with_cards TO authenticated;

-- 完成提示
DO $$ BEGIN RAISE NOTICE 'Migration completed successfully!'; END $$;
