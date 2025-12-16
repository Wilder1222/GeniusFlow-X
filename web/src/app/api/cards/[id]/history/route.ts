import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * GET /api/cards/[id]/history
 * Get review history for a specific card
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const resolvedParams = await params;
        const cardId = resolvedParams.id;

        // Verify card belongs to user
        const { data: card } = await supabase
            .from('cards')
            .select('deck_id')
            .eq('id', cardId)
            .single();

        if (!card) {
            return errorResponse(new AppError('Card not found', ErrorCode.NOT_FOUND, 404));
        }

        const { data: deck } = await supabase
            .from('decks')
            .select('user_id')
            .eq('id', card.deck_id)
            .single();

        if (!deck || deck.user_id !== user.id) {
            return errorResponse(new AppError('Access denied', ErrorCode.FORBIDDEN, 403));
        }

        // Get review logs
        const { data: logs, error: logsError } = await supabase
            .from('review_logs')
            .select('*')
            .eq('card_id', cardId)
            .order('review_time', { ascending: false });

        if (logsError) {
            console.error('[Card History] Error fetching logs:', logsError);
            return errorResponse(logsError);
        }

        return successResponse(logs || []);

    } catch (error: any) {
        console.error('[Card History] Error:', error);
        return errorResponse(error);
    }
}
