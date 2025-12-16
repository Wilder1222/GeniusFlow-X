import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { awardXP } from './xp-service';

/**
 * Achievement Detection Service
 * Checks and unlocks achievements based on user progress
 */

interface Achievement {
    id: string;
    code: string;
    name: string;
    xp_reward: number;
    requirement: {
        type: 'review_count' | 'streak' | 'ai_cards' | 'level';
        value: number;
    };
}

/**
 * Check and unlock achievements for a user
 */
export async function checkAndUnlockAchievements(userId: string): Promise<{
    unlockedAchievements: Achievement[];
    totalXPGained: number;
}> {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: '', ...options });
                    }
                }
            }
        );

        // Get all achievements
        const { data: allAchievements } = await supabase
            .from('achievements')
            .select('*');

        if (!allAchievements) return { unlockedAchievements: [], totalXPGained: 0 };

        // Get user's already unlocked achievements
        const { data: userAchievements } = await supabase
            .from('user_achievements')
            .select('achievement_id')
            .eq('user_id', userId);

        const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

        // Get user stats
        const { data: profile } = await supabase
            .from('profiles')
            .select('xp, level, current_streak')
            .eq('id', userId)
            .single();

        // Get user's deck IDs
        const { data: userDecks } = await supabase
            .from('decks')
            .select('id')
            .eq('user_id', userId);

        const deckIds = userDecks?.map(d => d.id) || [];

        // Count total reviews
        const { count: totalReviews } = await supabase
            .from('review_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Count AI generated cards (cards with ai_generate tag or from AI generation)
        const { count: aiCards } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .contains('tags', ['ai'])
            .in('deck_id', deckIds);

        const userStats = {
            reviewCount: totalReviews || 0,
            streak: profile?.current_streak || 0,
            aiCards: aiCards || 0,
            level: profile?.level || 1
        };

        // Check each achievement
        const newlyUnlocked: Achievement[] = [];

        for (const achievement of allAchievements) {
            if (unlockedIds.has(achievement.id)) continue; // Already unlocked

            const req = achievement.requirement as Achievement['requirement'];
            let shouldUnlock = false;

            switch (req.type) {
                case 'review_count':
                    shouldUnlock = userStats.reviewCount >= req.value;
                    break;
                case 'streak':
                    shouldUnlock = userStats.streak >= req.value;
                    break;
                case 'ai_cards':
                    shouldUnlock = userStats.aiCards >= req.value;
                    break;
                case 'level':
                    shouldUnlock = userStats.level >= req.value;
                    break;
            }

            if (shouldUnlock) {
                // Unlock achievement
                const { error } = await supabase
                    .from('user_achievements')
                    .insert({
                        user_id: userId,
                        achievement_id: achievement.id
                    });

                if (!error) {
                    newlyUnlocked.push(achievement);

                    // Award XP for achievement
                    await awardXP({
                        userId,
                        amount: achievement.xp_reward,
                        reason: 'achievement_unlock',
                        metadata: {
                            achievementCode: achievement.code,
                            achievementName: achievement.name
                        }
                    });
                }
            }
        }

        const totalXPGained = newlyUnlocked.reduce((sum, a) => sum + a.xp_reward, 0);

        return {
            unlockedAchievements: newlyUnlocked,
            totalXPGained
        };

    } catch (error) {
        console.error('[Achievement] Check error:', error);
        return { unlockedAchievements: [], totalXPGained: 0 };
    }
}
