import { NextRequest } from 'next/server';
import { createRouteClient, getUserDeckIds } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

export async function GET(req: NextRequest) {
    try {
        const supabase = createRouteClient(req);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        const deckIds = await getUserDeckIds(supabase, user.id);

        if (deckIds.length === 0) {
            return successResponse({ today: 0, thisWeek: 0, thisMonth: 0 });
        }

        // Calculate date boundaries
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        // Run all count queries in parallel
        const [todayResult, weekResult, monthResult] = await Promise.all([
            supabase
                .from('cards')
                .select('*', { count: 'exact', head: true })
                .gte('updated_at', `${today}T00:00:00`)
                .in('deck_id', deckIds),
            supabase
                .from('cards')
                .select('*', { count: 'exact', head: true })
                .gte('updated_at', weekAgo.toISOString())
                .in('deck_id', deckIds),
            supabase
                .from('cards')
                .select('*', { count: 'exact', head: true })
                .gte('updated_at', monthAgo.toISOString())
                .in('deck_id', deckIds)
        ]);

        return successResponse({
            today: todayResult.count || 0,
            thisWeek: weekResult.count || 0,
            thisMonth: monthResult.count || 0
        });
    } catch (error: any) {
        return errorResponse(error);
    }
}
