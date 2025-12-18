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
            return successResponse({ totalCards: 0, totalReviews: 0, studyTime: 0 });
        }

        // Get total cards count
        const { count: totalCards } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .in('deck_id', deckIds);

        // Get total reviews count
        const { count: totalReviews } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .neq('state', 'new')
            .in('deck_id', deckIds);

        // Study time estimate (30 seconds per review)
        const studyTime = Math.floor((totalReviews || 0) * 0.5);

        return successResponse({
            totalCards: totalCards || 0,
            totalReviews: totalReviews || 0,
            studyTime
        });
    } catch (error: any) {
        return errorResponse(error);
    }
}
