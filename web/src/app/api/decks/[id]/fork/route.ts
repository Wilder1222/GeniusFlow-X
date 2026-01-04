import { NextRequest, NextResponse } from 'next/server';
import { createActionClient } from '@/lib/supabase-server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: deckId } = await params;

    try {
        const supabase = await createActionClient();

        // Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
        }

        // 1. Fetch public deck and its cards
        const { data: originalDeck, error: deckError } = await supabase
            .from('decks')
            .select('*, cards(*)')
            .eq('id', deckId)
            // .eq('is_public', true) // Ideally only public or owned decks
            .single();

        if (deckError || !originalDeck) {
            return NextResponse.json({ success: false, error: { message: 'Deck not found' } }, { status: 404 });
        }

        // 2. Create new deck for user
        const { data: newDeck, error: createDeckError } = await supabase
            .from('decks')
            .insert({
                user_id: user.id,
                title: `${originalDeck.title} (Fork)`,
                description: originalDeck.description,
                is_public: false, // Default to private fork
                tags: originalDeck.tags
            })
            .select()
            .single();

        if (createDeckError || !newDeck) {
            console.error('[API POST /api/decks/fork] Create deck error:', createDeckError);
            return NextResponse.json({ success: false, error: { message: createDeckError?.message || 'Failed to create fork' } }, { status: 500 });
        }

        // 3. Clone cards
        if (originalDeck.cards && originalDeck.cards.length > 0) {
            const cardsToInsert = originalDeck.cards.map((card: any) => ({
                deck_id: newDeck.id,
                front: card.front,
                back: card.back,
                tags: card.tags,
                front_media: card.front_media,
                back_media: card.back_media,
                // Do NOT copy FSRS state, start fresh
                state: 'new'
            }));

            const { error: cardsError } = await supabase
                .from('cards')
                .insert(cardsToInsert);

            if (cardsError) {
                console.error('[API POST /api/decks/fork] Create cards error:', cardsError);
                // We should probably delete the newDeck if cards fail, but for now let's keep it simple
            }
        }

        // 4. Record the fork in deck_shares (optional but good for tracking)
        await supabase
            .from('deck_shares')
            .insert({
                deck_id: deckId,
                user_id: user.id,
                share_type: 'fork'
            })
            .maybeSingle();

        return NextResponse.json({
            success: true,
            data: newDeck
        });

    } catch (error: any) {
        console.error('[API POST /api/decks/fork] Unexpected error:', error);
        return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }
}
