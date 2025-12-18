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

        // Get mastery breakdown (e.g., how many cards are in 'easy', 'medium', 'hard' states based on interval)
        // For simplicity, we'll just return accuracy for now as per the old API
        return successResponse({
            averageAccuracy,
            totalReviews: reviewLogs?.length || 0,
            correctReviews: reviewLogs?.filter(log => log.rating >= 3).length || 0
        });
    } catch (error: any) {
        return errorResponse(error);
    }
}
