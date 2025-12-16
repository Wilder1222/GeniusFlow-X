import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
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

        // Get user profile with gamification data
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('xp, level, current_streak, longest_streak, last_study_date')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('[Stats] Profile fetch error:', profileError);
            return errorResponse(profileError);
        }

        // Get user's deck IDs first
        const { data: userDecks } = await supabase
            .from('decks')
            .select('id')
            .eq('user_id', user.id);

        const deckIds = userDecks?.map(d => d.id) || [];

        if (deckIds.length === 0) {
            // No decks yet, return zeros
            return successResponse({
                totalCards: 0,
                totalReviews: 0,
                studyTime: 0,
                currentStreak: profile?.current_streak || 0,
                longestStreak: profile?.longest_streak || 0,
                averageAccuracy: 0,
                cardsReviewed: {
                    today: 0,
                    thisWeek: 0,
                    thisMonth: 0
                }
            });
        }

        // Get total cards count
        const { count: totalCards } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .in('deck_id', deckIds);

        // Get total reviews count (cards that have been reviewed at least once)
        const { count: totalReviews } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .neq('state', 'new')
            .in('deck_id', deckIds);

        // Get study time (estimate based on reviews - 30 seconds per review)
        const studyTime = Math.floor((totalReviews || 0) * 0.5); // in minutes

        // Get cards reviewed today
        const today = new Date().toISOString().split('T')[0];
        const { count: reviewedToday } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .gte('updated_at', `${today}T00:00:00`)
            .in('deck_id', deckIds);

        // Get cards reviewed this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { count: reviewedThisWeek } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .gte('updated_at', weekAgo.toISOString())
            .in('deck_id', deckIds);

        // Get cards reviewed this month
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const { count: reviewedThisMonth } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .gte('updated_at', monthAgo.toISOString())
            .in('deck_id', deckIds);

        // Calculate average accuracy from review logs (rating 3+ is considered "correct")
        const { data: reviewLogs } = await supabase
            .from('review_logs')
            .select('rating')
            .eq('user_id', user.id);

        let averageAccuracy = 0;
        if (reviewLogs && reviewLogs.length > 0) {
            const correctReviews = reviewLogs.filter(log => log.rating >= 3).length;
            averageAccuracy = Math.round((correctReviews / reviewLogs.length) * 100);
        }

        return successResponse({
            totalCards: totalCards || 0,
            totalReviews: totalReviews || 0,
            studyTime,
            currentStreak: profile?.current_streak || 0,
            longestStreak: profile?.longest_streak || 0,
            averageAccuracy,
            cardsReviewed: {
                today: reviewedToday || 0,
                thisWeek: reviewedThisWeek || 0,
                thisMonth: reviewedThisMonth || 0
            }
        });

    } catch (error: any) {
        console.error('[Stats] Overview error:', error);
        return errorResponse(error);
    }
}
