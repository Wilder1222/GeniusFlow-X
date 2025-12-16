-- =============================================
-- Migration 002: Add user_id column to cards table
-- =============================================
-- Run this in Supabase SQL Editor

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'user_id'
    ) THEN
        -- Add the user_id column
        ALTER TABLE cards ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Update existing cards to set user_id from their deck's owner
        UPDATE cards c
        SET user_id = d.user_id
        FROM decks d
        WHERE c.deck_id = d.id AND c.user_id IS NULL;
        
        -- Make user_id NOT NULL after populating data
        ALTER TABLE cards ALTER COLUMN user_id SET NOT NULL;
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
        
        RAISE NOTICE 'Added user_id column to cards table';
    ELSE
        RAISE NOTICE 'user_id column already exists';
    END IF;
END $$;
