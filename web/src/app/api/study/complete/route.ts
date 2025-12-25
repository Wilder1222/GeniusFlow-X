import { NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';
import { awardReviewXP } from '@/lib/xp-service';
import { checkAndUnlockAchievements } from '@/lib/achievement-service';

interface CompleteSessionRequest {
    correctCount: number;
    incorrectCount: number;
}

export async function POST(req: NextRequest) {
    try {
        const supabase = createRouteClient(req);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        const body: CompleteSessionRequest = await req.json();
        const { correctCount, incorrectCount } = body;

        // Validate input
        if (typeof correctCount !== 'number' || typeof incorrectCount !== 'number') {
            return errorResponse(new Error('Invalid request: correctCount and incorrectCount must be numbers'));
        }

        if (correctCount < 0 || incorrectCount < 0) {
            return errorResponse(new Error('Invalid request: counts cannot be negative'));
        }

        // Run XP award and profile fetch in parallel
        const [xpResult, profileResult] = await Promise.all([
            awardReviewXP(supabase, user.id, correctCount, incorrectCount),
            supabase
                .from('profiles')
                .select('last_study_date, current_streak, longest_streak')
                .eq('id', user.id)
                .single()
        ]);

        if (!xpResult.success) {
            return errorResponse(new Error('Failed to award XP'));
        }

        const profile = profileResult.data;
        const today = new Date().toISOString().split('T')[0];

        // Update streak if needed
        if (profile && profile.last_study_date !== today) {
            let currentStreak = profile.current_streak || 0;
            let longestStreak = profile.longest_streak || 0;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (profile.last_study_date === yesterdayStr) {
                currentStreak += 1;
            } else {
                currentStreak = 1;
            }

            longestStreak = Math.max(longestStreak, currentStreak);

            // Update streak (fire and forget for performance, or await if needed)
            await supabase
                .from('profiles')
                .update({
                    last_study_date: today,
                    current_streak: currentStreak,
                    longest_streak: longestStreak
                })
                .eq('id', user.id);
        }

        // Check achievements
        const achievementResult = await checkAndUnlockAchievements(user.id);

        return successResponse({
            xpGained: correctCount * 10 + incorrectCount * 5,
            newXP: xpResult.newXP,
            newLevel: xpResult.newLevel,
            leveledUp: xpResult.leveledUp,
            totalCards: correctCount + incorrectCount,
            achievements: {
                unlocked: achievementResult.unlockedAchievements.map(a => ({
                    code: a.code,
                    name: a.name,
                    xpReward: a.xp_reward
                })),
                xpGained: achievementResult.totalXPGained
            }
        });

    } catch (error: any) {
        console.error('[Study Session] Complete error:', error);
        return errorResponse(error);
    }
}
