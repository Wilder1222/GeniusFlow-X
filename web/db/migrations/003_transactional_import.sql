-- =============================================
-- Migration 003: Add transactional import function
-- =============================================
-- This function handles deck + cards import in a single transaction

CREATE OR REPLACE FUNCTION import_deck_with_cards(
    p_user_id UUID,
    p_deck_title TEXT,
    p_deck_description TEXT,
    p_cards JSONB -- Array of {front, back, tags}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deck_id UUID;
    v_card JSONB;
    v_inserted_count INTEGER := 0;
BEGIN
    -- Validate input
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    IF p_deck_title IS NULL OR p_deck_title = '' THEN
        RAISE EXCEPTION 'deck_title is required';
    END IF;

    -- Create deck
    INSERT INTO decks (user_id, title, description)
    VALUES (p_user_id, p_deck_title, COALESCE(p_deck_description, ''))
    RETURNING id INTO v_deck_id;

    -- Insert cards
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

    -- Return result
    RETURN jsonb_build_object(
        'success', true,
        'deck_id', v_deck_id,
        'cards_imported', v_inserted_count
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Transaction will be automatically rolled back
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION import_deck_with_cards TO authenticated;
