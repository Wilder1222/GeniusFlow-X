import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

export async function GET(req: NextRequest) {
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

        // Get streak and gamification data from profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('xp, level, current_streak, longest_streak, last_study_date')
            .eq('id', user.id)
            .single();

        if (profileError) {
            return errorResponse(profileError);
        }

        return successResponse({
            xp: profile.xp || 0,
            level: profile.level || 1,
            currentStreak: profile.current_streak || 0,
            longestStreak: profile.longest_streak || 0,
            lastStudyDate: profile.last_study_date
        });
    } catch (error: any) {
        return errorResponse(error);
    }
}
