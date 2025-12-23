import { NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

export async function GET(req: NextRequest) {
    try {
        const supabase = createRouteClient(req);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        // Run count queries in parallel instead of fetching all data
        const [totalResult, correctResult] = await Promise.all([
            supabase
                .from('review_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id),
            supabase
                .from('review_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('rating', 3)
        ]);

        const totalReviews = totalResult.count || 0;
        const correctReviews = correctResult.count || 0;
        const averageAccuracy = totalReviews > 0
            ? Math.round((correctReviews / totalReviews) * 100)
            : 0;

        return successResponse({
            averageAccuracy,
            totalReviews,
            correctReviews
        });
    } catch (error: any) {
        return errorResponse(error);
    }
}
