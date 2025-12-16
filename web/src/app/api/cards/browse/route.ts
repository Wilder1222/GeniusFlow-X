import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

interface BrowseCardsQuery {
    deckId?: string;
    state?: string;
    tags?: string[];
    search?: string;
    sortBy?: 'created_at' | 'updated_at' | 'front';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}

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

        // Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        // Parse query parameters
        const searchParams = req.nextUrl.searchParams;
        const deckId = searchParams.get('deckId') || undefined;
        const state = searchParams.get('state') || undefined;
        const search = searchParams.get('search') || undefined;
        const sortBy = (searchParams.get('sortBy') as any) || 'created_at';
        const sortOrder = (searchParams.get('sortOrder') as any) || 'desc';
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '50');

        // Get user's deck IDs
        const { data: userDecks } = await supabase
            .from('decks')
            .select('id')
            .eq('user_id', user.id);

        const deckIds = userDecks?.map((d: { id: string }) => d.id) || [];

        if (deckIds.length === 0) {
            return successResponse({
                cards: [],
                total: 0,
                page,
                pageSize,
                totalPages: 0
            });
        }

        // Build query
        let query = supabase
            .from('cards')
            .select('id, front, back, state, tags, deck_id, created_at, updated_at, decks(title)', { count: 'exact' })
            .in('deck_id', deckIds);

        // Apply filters
        if (deckId) {
            query = query.eq('deck_id', deckId);
        }

        if (state) {
            query = query.eq('state', state);
        }

        if (search) {
            // Search in front or back
            query = query.or(`front.ilike.%${search}%,back.ilike.%${search}%`);
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data: cards, error: cardsError, count } = await query;

        if (cardsError) {
            console.error('[Browse] Query error:', cardsError);
            return errorResponse(cardsError);
        }

        const totalPages = count ? Math.ceil(count / pageSize) : 0;

        return successResponse({
            cards: cards || [],
            total: count || 0,
            page,
            pageSize,
            totalPages
        });

    } catch (error: any) {
        console.error('[Browse] Error:', error);
        return errorResponse(error);
    }
}
