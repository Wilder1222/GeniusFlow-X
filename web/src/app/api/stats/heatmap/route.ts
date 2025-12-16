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

        // Get user's deck IDs
        const { data: userDecks } = await supabase
            .from('decks')
            .select('id')
            .eq('user_id', user.id);

        const deckIds = userDecks?.map((d: { id: string }) => d.id) || [];

        if (deckIds.length === 0) {
            // No decks yet, return empty heatmap
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
            .neq('state', 'new'); // Only reviewed cards

        if (cardsError) {
            console.error('[Heatmap] Cards fetch error:', cardsError);
            return errorResponse(cardsError);
        }

        // Group by date and count
        const heatmapData: Record<string, number> = {};

        cards?.forEach((card: { updated_at: string }) => {
            const date = card.updated_at.split('T')[0]; // Get YYYY-MM-DD
            heatmapData[date] = (heatmapData[date] || 0) + 1;
        });

        // Convert to array format
        const result = Object.entries(heatmapData).map(([date, count]) => ({
            date,
            count
        }));

        return successResponse(result);

    } catch (error: any) {
        console.error('[Heatmap] Error:', error);
        return errorResponse(error);
    }
}
