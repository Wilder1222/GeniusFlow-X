import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { errorResponse } from '@/lib/api-response';
import { cachedResponse } from '@/lib/supabase-server';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * GET /api/stats/forecast
 * 预测未来7天的学习负荷
 */
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

        // Create two parallel requests: one for user decks, one for the user object (already done but for consistency)
        const { data: userDecks } = await supabase
            .from('decks')
            .select('id')
            .eq('user_id', user.id);

        const deckIds = userDecks?.map(d => d.id) || [];

        if (deckIds.length === 0) {
            return cachedResponse({
                forecast: [],
                totalDue: 0,
                estimatedMinutes: 0
            }, 1);
        }

        // Fetch all cards for these decks
        const { data: cards } = await supabase
            .from('cards')
            .select('next_review_at, state')
            .in('deck_id', deckIds);

        if (!cards || cards.length === 0) {
            return cachedResponse({
                forecast: [],
                totalDue: 0,
                estimatedMinutes: 0
            }, 1);
        }

        // ... processing logic remains same ...
        const forecast = [];
        const now = new Date();
        let totalDue = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const nextDateStr = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const dueCards = cards.filter(card => {
                if (!card.next_review_at) return false;
                const reviewDate = card.next_review_at.split('T')[0];
                return reviewDate >= dateStr && reviewDate < nextDateStr;
            });

            const count = dueCards.length;
            totalDue += count;

            const byState = {
                new: dueCards.filter(c => c.state === 'new').length,
                learning: dueCards.filter(c => c.state === 'learning').length,
                review: dueCards.filter(c => c.state === 'review').length,
                relearning: dueCards.filter(c => c.state === 'relearning').length
            };

            forecast.push({ date: dateStr, count, byState });
        }

        const estimatedMinutes = Math.round((totalDue * 30) / 60);

        return cachedResponse({
            forecast,
            totalDue,
            estimatedMinutes
        }, 1);

    } catch (error: any) {
        console.error('[Forecast] Error:', error);
        return errorResponse(error);
    }
}
