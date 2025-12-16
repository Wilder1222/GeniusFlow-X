-- =============================================
-- Migration 001: Add tags column to cards table
-- =============================================
-- Run this in Supabase SQL Editor to add tags support

-- Add tags column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'tags'
    ) THEN
        ALTER TABLE cards ADD COLUMN tags TEXT[] DEFAULT '{}';
        
        -- Create GIN index for efficient tag searches
        CREATE INDEX IF NOT EXISTS idx_cards_tags ON cards USING GIN(tags);
        
        RAISE NOTICE 'Added tags column to cards table';
    ELSE
        RAISE NOTICE 'tags column already exists';
    END IF;
END $$;
