import { NextRequest, NextResponse } from 'next/server';
import { createActionClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
    const supabase = await createActionClient();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const deckId = searchParams.get('deck_id') || searchParams.get('deckId');
    const limit = parseInt(searchParams.get('limit') || '20');

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
        }

        if (type === 'due') {
            let query = supabase
                .from('cards')
                .select('*')
                .eq('user_id', user.id)
                .lte('next_review_at', new Date().toISOString())
                .order('next_review_at', { ascending: true })
                .limit(limit);

            if (deckId) {
                query = query.eq('deck_id', deckId);
            }

            const { data: dueCards, error } = await query;
            if (error) throw error;

            return NextResponse.json({ success: true, data: dueCards || [] });
        } else if (deckId) {
            // Fetch all cards for a specific deck (e.g. for Deck Detail page)
            // Note: Deck ownership/visibility check is implicitly handled by RLS if used, 
            // but for API we might want to check if the deck is public or belongs to user.
            // For now, let's assume if the user can see the deck (checked via middleware/RLS), they can see the cards.
            // However, to match the direct supabase call behavior:
            const { data: cards, error } = await supabase
                .from('cards')
                .select('*')
                .eq('deck_id', deckId)
                .order('created_at', { ascending: true }); // Chronological order

            if (error) throw error;
            return NextResponse.json({ success: true, data: cards || [] });
        }

        // Default: list cards (can add more filters later if needed)
        // For now, if no type specified, maybe return error or empty
        return NextResponse.json({ success: true, data: [] });

    } catch (e: any) {
        console.error('[API /cards result]', e);
        return NextResponse.json({ success: false, error: { message: e.message } }, { status: 500 });
    }
}

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

        // Award XP for creating a card
        const { awardXP, XP_REWARDS } = await import('@/lib/xp-service');
        await awardXP(supabase, {
            userId: user.id,
            amount: XP_REWARDS.CREATE_CARD,
            reason: 'create_card',
            metadata: { cardId: card.id, deckId: deck_id }
        });

        return NextResponse.json({ success: true, data: card });
    } catch (e: any) {
        console.error('[API /cards] Unexpected error', e);
        return NextResponse.json({ success: false, error: { message: e.message, stack: e.stack } }, { status: 500 });
    }
}
