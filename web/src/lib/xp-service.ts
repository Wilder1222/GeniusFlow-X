import { SupabaseClient } from '@supabase/supabase-js';

/**
 * XP Service - Handles all XP-related operations
 */

export const XP_REWARDS = {
    REVIEW_CORRECT: 10,
    REVIEW_INCORRECT: 5,
    CREATE_CARD: 15,
    AI_GENERATE_CARD: 20,
    DAILY_LOGIN: 50,
    ACHIEVEMENT_UNLOCK: 0, // Variable based on achievement
} as const;

export type XPReason =
    | 'review_correct'
    | 'review_incorrect'
    | 'create_card'
    | 'ai_generate'
    | 'daily_login'
    | 'achievement_unlock';

interface XPTransaction {
    userId: string;
    amount: number;
    reason: XPReason;
    metadata?: Record<string, any>;
}

/**
 * Calculate level from XP
 * Formula: level = floor(sqrt(xp / 100))
 */
export function calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Get XP required for a specific level
 */
export function getXPForLevel(level: number): number {
    return (level - 1) * (level - 1) * 100;
}

/**
 * Award XP to a user
 */
export async function awardXP(
    supabase: SupabaseClient,
    transaction: XPTransaction
): Promise<{
    success: boolean;
    newXP: number;
    newLevel: number;
    leveledUp: boolean;
}> {
    try {

        // Get current profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('xp, level')
            .eq('id', transaction.userId)
            .single();

        if (profileError || !profile) {
            throw new Error('Failed to fetch user profile');
        }

        const currentXP = profile.xp || 0;
        const currentLevel = profile.level || 1;
        const newXP = currentXP + transaction.amount;
        const newLevel = calculateLevel(newXP);
        const leveledUp = newLevel > currentLevel;

        // Insert XP transaction
        const { error: transactionError } = await supabase
            .from('xp_transactions')
            .insert({
                user_id: transaction.userId,
                amount: transaction.amount,
                reason: transaction.reason,
                metadata: transaction.metadata || {}
            });

        if (transactionError) {
            console.error('[XP] Transaction insert error:', transactionError);
            throw transactionError;
        }

        // Update profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                xp: newXP,
                level: newLevel
            })
            .eq('id', transaction.userId);

        if (updateError) {
            console.error('[XP] Profile update error:', updateError);
            throw updateError;
        }

        return {
            success: true,
            newXP,
            newLevel,
            leveledUp
        };

    } catch (error) {
        console.error('[XP] Award error:', error);
        return {
            success: false,
            newXP: 0,
            newLevel: 1,
            leveledUp: false
        };
    }
}

/**
 * Award XP for card reviews
 */
export async function awardReviewXP(
    supabase: SupabaseClient,
    userId: string,
    correctCount: number,
    incorrectCount: number
): Promise<ReturnType<typeof awardXP>> {
    const totalXP =
        correctCount * XP_REWARDS.REVIEW_CORRECT +
        incorrectCount * XP_REWARDS.REVIEW_INCORRECT;

    return awardXP(supabase, {
        userId,
        amount: totalXP,
        reason: correctCount > incorrectCount ? 'review_correct' : 'review_incorrect',
        metadata: {
            correctCount,
            incorrectCount,
            totalCards: correctCount + incorrectCount
        }
    });
}
