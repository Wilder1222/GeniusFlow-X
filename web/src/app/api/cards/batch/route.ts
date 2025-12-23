import { NextRequest, NextResponse } from 'next/server';
import { createActionClient } from '@/lib/supabase-server';

/**
 * Batch insert cards for a deck.
 * Expected body:
 * {
 *   deck_id: string;
 *   cards: Array<{ front: string; back: string; tags?: string[] }>;
 * }
 */
export async function POST(request: NextRequest) {
    console.log('[API /cards/batch] Received request');

    try {
        const supabase = await createActionClient();

        // Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('[API /cards/batch] Auth error:', authError);
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
        }
        console.log('[API /cards/batch] User authenticated:', user.id);

        const body = await request.json();
        console.log('[API /cards/batch] Request body:', JSON.stringify({ deck_id: body.deck_id, cardCount: body.cards?.length }));

        const { deck_id, cards } = body as { deck_id: string; cards: Array<{ front: string; back: string; tags?: string[] }> };

        if (!deck_id || !Array.isArray(cards) || cards.length === 0) {
            console.error('[API /cards/batch] Validation failed:', { deck_id, cardsIsArray: Array.isArray(cards), cardsLength: cards?.length });
            return NextResponse.json({ success: false, error: { message: 'deck_id and non-empty cards array required' } }, { status: 400 });
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
            return NextResponse.json({ success: false, error: { message: 'Deck not found or access denied' } }, { status: 404 });
        }
        console.log('[API /cards/batch] Deck verified:', deck_id);

        // Build bulk payload
        const payload = cards.map(c => ({
            deck_id,
            front: c.front,
            back: c.back,
            tags: c.tags ?? [],
            state: 'new',
            user_id: user.id,
        }));
        console.log('[API /cards/batch] Inserting', payload.length, 'cards');

        const { data: inserted, error: insertError } = await supabase.from('cards').insert(payload).select();

        if (insertError) {
            console.error('[API /cards/batch] Insert error:', insertError);
            return NextResponse.json({ success: false, error: { message: insertError.message, details: insertError } }, { status: 500 });
        }

        console.log('[API /cards/batch] Successfully inserted', inserted?.length, 'cards');
        return NextResponse.json({ success: true, data: inserted });
    } catch (error: any) {
        console.error('[API /cards/batch] Unexpected error:', error);
        return NextResponse.json({ success: false, error: { message: error.message, stack: error.stack } }, { status: 500 });
    }
}
