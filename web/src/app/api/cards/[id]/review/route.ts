import { NextRequest, NextResponse } from 'next/server';
import { createActionClient } from '@/lib/supabase-server';
import { FSRS, Card as FSRSCard, Rating, State, createEmptyCard } from 'ts-fsrs';

const fsrs = new FSRS({});

// Helper to map DB card to FSRS Card
function mapDbCardToFsrs(card: any): FSRSCard {
    if (!card.fsrs_data || Object.keys(card.fsrs_data).length === 0) {
        return createEmptyCard();
    }
    const fetchCard = card.fsrs_data as FSRSCard;
    return {
        ...fetchCard,
        due: new Date(fetchCard.due),
        last_review: fetchCard.last_review ? new Date(fetchCard.last_review) : undefined,
    };
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: cardId } = await context.params;
        const body = await request.json();
        const { rating } = body;

        if (rating === undefined) {
            return NextResponse.json({ success: false, error: { message: 'Rating is required' } }, { status: 400 });
        }

        const supabase = await createActionClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
        }

        // 1. Fetch current card
        const { data: currentDbCard, error: fetchError } = await supabase
            .from('cards')
            .select('*')
            .eq('id', cardId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !currentDbCard) {
            return NextResponse.json({ success: false, error: { message: 'Card not found' } }, { status: 404 });
        }

        // 2. Convert to FSRS Card
        const fCard = mapDbCardToFsrs(currentDbCard);

        // 3. Calculate schedule
        const schedulingCards = fsrs.repeat(fCard, new Date());
        const schedulingInfo = (schedulingCards as any)[rating];
        if (!schedulingInfo) {
            return NextResponse.json({ success: false, error: { message: 'Invalid rating calculation' } }, { status: 400 });
        }
        const { card: newFCard } = schedulingInfo;

        // 4. Transform state to string
        const stateMap: Record<State, 'new' | 'learning' | 'review' | 'relearning'> = {
            [State.New]: 'new',
            [State.Learning]: 'learning',
            [State.Review]: 'review',
            [State.Relearning]: 'relearning',
        };
        const newStateString = stateMap[newFCard.state as State];

        // 5. Use RPC to update card and insert review log in one transaction
        const { data: updatedCard, error: rpcError } = await supabase.rpc('apply_card_review', {
            p_card_id: cardId,
            p_user_id: user.id,
            p_rating: rating,
            p_fsrs_data: newFCard,
            p_next_review_at: newFCard.due.toISOString(),
            p_state: newStateString
        });

        if (rpcError) throw rpcError;

        return NextResponse.json({ success: true, data: updatedCard });

    } catch (error: any) {
        console.error('[API Review] Error:', error);
        return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }
}
