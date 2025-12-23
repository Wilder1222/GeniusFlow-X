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
            return successResponse([]);
        }

        // Get card update dates for the last 365 days
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const { data: cards, error: cardsError } = await supabase
            .from('cards')
            .select('updated_at')
            .in('deck_id', deckIds)
            .gte('updated_at', oneYearAgo.toISOString())
            .neq('state', 'new');

        if (cardsError) {
            console.error('[Heatmap] Cards fetch error:', cardsError);
            return errorResponse(cardsError);
        }

        // Group by date and count using Map for O(1) lookups
        const heatmapData = new Map<string, number>();

        for (const card of cards || []) {
            const date = card.updated_at.split('T')[0];
            heatmapData.set(date, (heatmapData.get(date) || 0) + 1);
        }

        // Convert to array format
        const result = Array.from(heatmapData, ([date, count]) => ({ date, count }));

        return successResponse(result);
    } catch (error: any) {
        console.error('[Heatmap] Error:', error);
        return errorResponse(error);
    }
}
