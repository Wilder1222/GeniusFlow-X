import { NextRequest, NextResponse } from 'next/server';
import { createActionClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    console.log('[API /cards] Received request');
    const supabase = await createActionClient();

    try {
        const body = await request.json();
        console.log('[API /cards] Body:', JSON.stringify(body));
        const { deck_id, front, back, tags } = body;

        // Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('[API /cards] Auth error', authError);
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
        }

        if (!deck_id || !front || !back) {
            console.error('[API /cards] Missing fields', { deck_id, front, back });
            return NextResponse.json({ success: false, error: { message: 'deck_id, front, and back are required' } }, { status: 400 });
        }

        // Verify deck ownership
        const { data: deck, error: deckError } = await supabase
            .from('decks')
            .select('id')
            .eq('id', deck_id)
            .eq('user_id', user.id)
            .single();
        if (deckError || !deck) {
            console.error('[API /cards] Deck verification failed', { deckError, deck_id, userId: user.id });
            return NextResponse.json({ success: false, error: { message: 'Deck not found or access denied' } }, { status: 404 });
        }

        // Insert card
        const { data: card, error } = await supabase
            .from('cards')
            .insert({
                deck_id,
                front,
                back,
                tags: tags || [],
                state: 'new',
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error('[API /cards] Insert error', error);
            return NextResponse.json({ success: false, error: { message: error.message, stack: (error as any).stack } }, { status: 500 });
        }

        console.log('[API /cards] Card created', { cardId: card.id });
        return NextResponse.json({ success: true, data: card });
    } catch (e: any) {
        console.error('[API /cards] Unexpected error', e);
        return NextResponse.json({ success: false, error: { message: e.message, stack: e.stack } }, { status: 500 });
    }
}
