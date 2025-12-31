-- CARD REVIEW RPC
CREATE OR REPLACE FUNCTION apply_card_review(
    p_card_id UUID,
    p_user_id UUID,
    p_rating INTEGER,
    p_fsrs_data JSONB,
    p_next_review_at TIMESTAMPTZ,
    p_state TEXT
) RETURNS JSONB AS $$
DECLARE
    v_updated_card JSONB;
BEGIN
    -- Update the card
    UPDATE cards
    SET 
        fsrs_data = p_fsrs_data,
        next_review_at = p_next_review_at,
        state = p_state,
        updated_at = NOW()
    WHERE id = p_card_id AND user_id = p_user_id
    RETURNING to_jsonb(cards.*) INTO v_updated_card;

    IF v_updated_card IS NULL THEN
        RAISE EXCEPTION 'Card not found or unauthorized';
    END IF;

    -- Insert review log
    INSERT INTO review_logs (
        card_id,
        user_id,
        rating,
        state,
        scheduled_days,
        ease_factor,
        reviewed_at
    ) VALUES (
        p_card_id,
        p_user_id,
        p_rating,
        p_state,
        ROUND(EXTRACT(EPOCH FROM (p_next_review_at - NOW())) / 86400)::INTEGER,
        (p_fsrs_data->>'stability')::NUMERIC,
        NOW()
    );

    RETURN v_updated_card;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AWARD XP RPC
CREATE OR REPLACE FUNCTION award_xp(
    p_user_id UUID,
    p_amount INTEGER,
    p_reason TEXT,
    p_metadata JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_profile RECORD;
    v_new_xp INTEGER;
    v_new_level INTEGER;
    v_leveled_up BOOLEAN;
BEGIN
    -- Get current profile
    SELECT xp, level INTO v_profile FROM profiles WHERE id = p_user_id FOR UPDATE;
    
    IF v_profile IS NULL THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;

    v_new_xp := COALESCE(v_profile.xp, 0) + p_amount;
    
    -- Level formula: level = floor(sqrt(xp/100)) + 1 (Approximate for example, should match your xp-service.ts logic)
    -- If your logic is complex, you might need to pass new_level from frontend, 
    -- but let's assume simple level = floor(new_xp / 1000) + 1 for this example or just use the passed value if we prefer.
    -- Better: let frontend calculate and pass if it's complex, OR define here.
    -- Let's use a common formula: level = floor(log10(xp+1)) + 1 or similar.
    -- For now, let's just use the passed value or assume simple linear growth for this RPC example.
    -- Actually, let's just update XP and return it, frontend can handle level-up logic if it's purely display-based, 
    -- but leveling is usually DB-persisted.
    
    -- Let's stick to a simpler version where we pass the calculated level if needed, or define the formula here.
    -- For GeniusFlow-X, level = floor(sqrt(xp/10)) + 1
    v_new_level := FLOOR(SQRT(v_new_xp / 10.0)) + 1;
    v_leveled_up := v_new_level > v_profile.level;

    UPDATE profiles
    SET 
        xp = v_new_xp,
        level = v_new_level,
        updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO xp_transactions (user_id, amount, reason, metadata)
    VALUES (p_user_id, p_amount, p_reason, p_metadata);

    RETURN jsonb_build_object(
        'xp', v_new_xp,
        'level', v_new_level,
        'leveledUp', v_leveled_up,
        'xpGained', p_amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CHECK ACHIEVEMENTS RPC
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID) 
RETURNS TABLE (
    achievement_id UUID,
    name TEXT,
    icon TEXT,
    xp_reward INTEGER
) AS $$
DECLARE
    v_review_count INTEGER;
    v_total_cards INTEGER;
    v_profile RECORD;
BEGIN
    -- 1. Get user stats efficiently
    SELECT COUNT(*) INTO v_review_count FROM review_logs WHERE user_id = p_user_id;
    SELECT current_streak, level, xp INTO v_profile FROM profiles WHERE id = p_user_id;
    
    -- Count total cards across all decks owned by user
    SELECT COUNT(*) INTO v_total_cards 
    FROM cards c
    JOIN decks d ON c.deck_id = d.id
    WHERE d.user_id = p_user_id;

    -- 2. Find and unlock new achievements in one sweep
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT p_user_id, a.id
    FROM achievements a
    WHERE NOT EXISTS (
        SELECT 1 FROM user_achievements ua 
        WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
    )
    AND (
        (a.requirement->>'type' = 'review_count' AND v_review_count >= (a.requirement->>'target')::INTEGER) OR
        (a.requirement->>'type' = 'streak' AND v_profile.current_streak >= (a.requirement->>'target')::INTEGER) OR
        (a.requirement->>'type' = 'total_cards' AND v_total_cards >= (a.requirement->>'target')::INTEGER) OR
        (a.requirement->>'type' = 'level' AND v_profile.level >= (a.requirement->>'target')::INTEGER)
    )
    ON CONFLICT DO NOTHING;

    -- 3. Trigger XP rewards for newly unlocked ones (if any)
    -- This is slightly complex in one query, but we can return the items and handle XP in the same call if we use a CTE
    
    -- Let's return the newly unlocked ones
    RETURN QUERY
    SELECT a.id, a.name, a.icon, a.xp_reward
    FROM achievements a
    JOIN user_achievements ua ON ua.achievement_id = a.id
    WHERE ua.user_id = p_user_id 
    AND ua.unlocked_at > (NOW() - INTERVAL '5 seconds'); -- Heuristic for "newly" in this transaction

    -- Note: We could also update XP here, but award_xp already handles it. 
    -- To keep it fully atomic, we could do it here too, but let's keep it simple first.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
