import { SupabaseClient } from '@supabase/supabase-js';
import { ProfileRow } from '@/types/profile';

export const MEMBERSHIP_LIMITS = {
    free: 10,
    pro: 200,
} as const;

export interface MembershipStatus {
    tier: 'free' | 'pro';
    limit: number;
    used: number;
    remaining: number;
    canGenerate: boolean;
}

/**
 * Get the current membership status and handle daily reset if needed
 */
export async function getMembershipStatus(
    supabase: SupabaseClient,
    userId: string
): Promise<MembershipStatus> {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('membership_tier, ai_generation_count, last_ai_reset')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        return {
            tier: 'free',
            limit: MEMBERSHIP_LIMITS.free,
            used: 0,
            remaining: MEMBERSHIP_LIMITS.free,
            canGenerate: true,
        };
    }

    const tier = (profile.membership_tier as 'free' | 'pro') || 'free';
    const limit = MEMBERSHIP_LIMITS[tier];
    let used = profile.ai_generation_count || 0;
    const lastReset = new Date(profile.last_ai_reset || 0);
    const now = new Date();

    // Check if we need to reset the daily count
    // Reset if last reset was on a different day (UTC)
    const isSameDay =
        lastReset.getUTCFullYear() === now.getUTCFullYear() &&
        lastReset.getUTCMonth() === now.getUTCMonth() &&
        lastReset.getUTCDate() === now.getUTCDate();

    if (!isSameDay) {
        used = 0;
        await supabase
            .from('profiles')
            .update({
                ai_generation_count: 0,
                last_ai_reset: now.toISOString(),
            })
            .eq('id', userId);
    }

    return {
        tier,
        limit,
        used,
        remaining: Math.max(0, limit - used),
        canGenerate: used < limit,
    };
}

/**
 * Increment the AI generation count
 */
export async function incrementAIUsage(
    supabase: SupabaseClient,
    userId: string
): Promise<void> {
    const { data: profile } = await supabase
        .from('profiles')
        .select('ai_generation_count')
        .eq('id', userId)
        .single();

    const currentUsed = profile?.ai_generation_count || 0;

    await supabase
        .from('profiles')
        .update({
            ai_generation_count: currentUsed + 1,
        })
        .eq('id', userId);
}
