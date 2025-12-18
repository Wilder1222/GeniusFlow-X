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

        // Get user's deck IDs
        const { data: userDecks } = await supabase
            .from('decks')
            .select('id')
            .eq('user_id', user.id);

        const deckIds = userDecks?.map(d => d.id) || [];

        if (deckIds.length === 0) {
            return successResponse({ today: 0, thisWeek: 0, thisMonth: 0 });
        }

        const today = new Date().toISOString().split('T')[0];
        const { count: reviewedToday } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .gte('updated_at', `${today}T00:00:00`)
            .in('deck_id', deckIds);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { count: reviewedThisWeek } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .gte('updated_at', weekAgo.toISOString())
            .in('deck_id', deckIds);

        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const { count: reviewedThisMonth } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .gte('updated_at', monthAgo.toISOString())
            .in('deck_id', deckIds);

        return successResponse({
            today: reviewedToday || 0,
            thisWeek: reviewedThisWeek || 0,
            thisMonth: reviewedThisMonth || 0
        });
    } catch (error: any) {
        return errorResponse(error);
    }
}
