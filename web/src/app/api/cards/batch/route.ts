import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase-server';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api-response';

/**
 * Batch insert cards for a deck.
 */
export const POST = withAuth<ApiResponse<any>>(async (req, { user, supabase }) => {
    console.log('[API /cards/batch] Received request for user:', user.id);

    try {
        const body = await req.json();
        const { deck_id, cards } = body as { deck_id: string; cards: Array<{ front: string; back: string; tags?: string[] }> };

        if (!deck_id || !Array.isArray(cards) || cards.length === 0) {
            return errorResponse(new Error('deck_id and non-empty cards array required'));
        }

        // Verify deck ownership
        const { data: deck, error: deckError } = await supabase
            .from('decks')
            .select('id')
            .eq('id', deck_id)
            .eq('user_id', user.id)
            .single();

        if (deckError || !deck) {
            console.error('[API /cards/batch] Deck verification failed:', { deckError, deck_id, userId: user.id });
            return errorResponse(new Error('Deck not found or access denied'));
        }

        // Build bulk payload
        const payload = cards.map(c => ({
            deck_id,
            front: c.front,
            back: c.back,
            tags: c.tags ?? [],
            state: 'new',
            user_id: user.id,
        }));

        const { data: inserted, error: insertError } = await supabase.from('cards').insert(payload).select();

        if (insertError) {
            console.error('[API /cards/batch] Insert error:', insertError);
            return errorResponse(insertError);
        }

        return successResponse(inserted);
    } catch (error: any) {
        console.error('[API /cards/batch] Unexpected error:', error);
        return errorResponse(error);
    }
});
