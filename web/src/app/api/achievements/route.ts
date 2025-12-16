import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

export async function GET(req: NextRequest) {
    try {
        // Create server-side Supabase client
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

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        // Get all achievements
        const { data: achievements, error: achievementsError } = await supabase
            .from('achievements')
            .select('*')
            .order('xp_reward', { ascending: true });

        if (achievementsError) {
            console.error('[Achievements] Fetch error:', achievementsError);
            return errorResponse(achievementsError);
        }

        // Get user's unlocked achievements
        const { data: userAchievements } = await supabase
            .from('user_achievements')
            .select('achievement_id, unlocked_at')
            .eq('user_id', user.id);

        const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

        // Combine data
        const result = achievements?.map(achievement => ({
            ...achievement,
            unlocked: unlockedIds.has(achievement.id),
            unlockedAt: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.unlocked_at || null
        })) || [];

        return successResponse(result);

    } catch (error: any) {
        console.error('[Achievements] Error:', error);
        return errorResponse(error);
    }
}
