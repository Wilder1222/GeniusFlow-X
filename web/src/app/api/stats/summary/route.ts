import { NextRequest } from 'next/server';
import { createRouteClient, getUserDeckIds, cachedResponse } from '@/lib/supabase-server';
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
            return successResponse({ totalCards: 0, totalReviews: 0, studyTime: 0 });
        }

        // Run both count queries in parallel
        const [cardsResult, reviewsResult] = await Promise.all([
            supabase
                .from('cards')
                .select('*', { count: 'exact', head: true })
                .in('deck_id', deckIds),
            supabase
                .from('cards')
                .select('*', { count: 'exact', head: true })
                .neq('state', 'new')
                .in('deck_id', deckIds)
        ]);

        const totalCards = cardsResult.count || 0;
        const totalReviews = reviewsResult.count || 0;
        const studyTime = Math.floor(totalReviews * 0.5);

        return successResponse({
            totalCards,
            totalReviews,
            studyTime
        });
    } catch (error: any) {
        return errorResponse(error);
    }
}
