import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createRouteClient, cachedResponse } from '@/lib/supabase-server';
import { AppError, ErrorCode } from '@/lib/errors';

export async function GET(req: NextRequest) {
    try {
        const supabase = createRouteClient(req);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        // Get streak and gamification data from profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('xp, level, current_streak, longest_streak, last_study_date')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            return errorResponse(profileError);
        }

        if (!profile) {
            return cachedResponse({
                xp: 0,
                level: 1,
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null
            }, 1);
        }

        return cachedResponse({
            xp: profile.xp || 0,
            level: profile.level || 1,
            currentStreak: profile.current_streak || 0,
            longestStreak: profile.longest_streak || 0,
            lastStudyDate: profile.last_study_date
        }, 1);
    } catch (error: any) {
        return errorResponse(error);
    }
}
