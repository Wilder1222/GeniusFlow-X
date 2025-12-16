import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * POST /api/achievements/check
 * Check and unlock achievements for user
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return req.cookies.get(name)?.value;
                    },
                    set() { },
                    remove() { }
                }
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        // Get all achievements
        const { data: allAchievements } = await supabase
            .from('achievements')
            .select('*');

        // Get user's unlocked achievements
        const { data: unlockedAchievements } = await supabase
            .from('user_achievements')
            .select('achievement_id')
            .eq('user_id', user.id);

        const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);

        // Get user stats
        const { data: profile } = await supabase
            .from('profiles')
            .select('current_streak, level, xp')
            .eq('id', user.id)
            .single();

        // Get review count from review_logs
        const { count: reviewCount } = await supabase
            .from('review_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        // Get total cards count
        const { data: decks } = await supabase
            .from('decks')
            .select('id')
            .eq('user_id', user.id);

        const deckIds = decks?.map(d => d.id) || [];
        const { count: totalCards } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .in('deck_id', deckIds);

        // Check each achievement
        const newlyUnlocked = [];

        for (const achievement of allAchievements || []) {
            if (unlockedIds.has(achievement.id)) continue;

            const req = achievement.requirement;
            let unlocked = false;

            switch (req.type) {
                case 'review_count':
                    unlocked = (reviewCount || 0) >= req.target;
                    break;
                case 'streak':
                    unlocked = (profile?.current_streak || 0) >= req.target;
                    break;
                case 'total_cards':
                    unlocked = (totalCards || 0) >= req.target;
                    break;
                case 'level':
                    unlocked = (profile?.level || 1) >= req.target;
                    break;
                case 'deck_count':
                    unlocked = deckIds.length >= req.target;
                    break;
            }

            if (unlocked) {
                // Unlock achievement
                const { error: unlockError } = await supabase
                    .from('user_achievements')
                    .insert({
                        user_id: user.id,
                        achievement_id: achievement.id
                    });

                if (!unlockError) {
                    newlyUnlocked.push(achievement);

                    // Award XP
                    if (achievement.xp_reward > 0) {
                        await supabase
                            .from('profiles')
                            .update({
                                xp: (profile?.xp || 0) + achievement.xp_reward
                            })
                            .eq('id', user.id);

                        await supabase
                            .from('xp_transactions')
                            .insert({
                                user_id: user.id,
                                amount: achievement.xp_reward,
                                reason: 'achievement',
                                metadata: { achievement_id: achievement.id }
                            });
                    }
                }
            }
        }

        return successResponse({
            newlyUnlocked,
            totalUnlocked: unlockedIds.size + newlyUnlocked.length
        });

    } catch (error: any) {
        console.error('[Achievements] Error:', error);
        return errorResponse(error);
    }
}
