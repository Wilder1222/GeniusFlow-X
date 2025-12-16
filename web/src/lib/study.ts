import { FSRS, Card as FSRSCard, Rating, State, createEmptyCard } from 'ts-fsrs';
import { supabase } from '@/lib/supabase';
import { Card } from '@/types/decks';

const fsrs = new FSRS({});

// Helper to map DB card to FSRS Card
function mapDbCardToFsrs(card: Card): FSRSCard {
    // If fsrs_data is empty or invalid, create a new empty card state
    if (!card.fsrs_data || Object.keys(card.fsrs_data).length === 0) {
        const newCard = createEmptyCard();
        // Since FSRS V3/V4 changes, ensure we might need to sync the date?
        // Usually creating a new card is enough.
        return newCard;
    }

    // Assuming fsrs_data strictly follows FSRSCard structure
    // We also need to ensure dates are Date objects, not strings if JSON parsed
    const fetchCard = card.fsrs_data as FSRSCard;
    return {
        ...fetchCard,
        due: new Date(fetchCard.due),
        last_review: fetchCard.last_review ? new Date(fetchCard.last_review) : undefined,
    };
}

export async function getDueCards(deckId?: string, limit = 20): Promise<Card[]> {
    let query = supabase
        .from('cards')
        .select('*')
        .lte('next_review_at', new Date().toISOString()) // Due now or in past
        .order('next_review_at', { ascending: true }) // Oldest due first
        .limit(limit);

    if (deckId) {
        query = query.eq('deck_id', deckId);
    }

    const { data: dueCards, error } = await query;

    if (error) throw error;

    // If we have enough due cards, return them
    // If NOT enough, we might want to mix in 'New' cards (state = 'new')
    // For MVP, separate 'New' query if needed, or just rely on next_review_at defaults.
    // NOTE: 'new' cards usually have next_review_at = creation time or now(), so they should be caught by logic above if default is now().

    // Checking if we need to fetch specifically 'new' cards if they have future dates?
    // In our schema: "next_review_at default now()". So new cards are immediately due.

    return (dueCards || []) as Card[];
}

export async function gradeCard(cardId: string, rating: Rating): Promise<Card> {
    // 1. Fetch current card
    const { data: currentDbCard, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .single();

    if (fetchError) throw fetchError;
    const dbCard = currentDbCard as Card;

    // 2. Convert to FSRS Card
    const fCard = mapDbCardToFsrs(dbCard);

    // 3. Calculate schedule
    // grade: Rating.Again(1) | Hard(2) | Good(3) | Easy(4)
    const schedulingCards = fsrs.repeat(fCard, new Date());

    // Get the specific schedule for the chosen rating
    // schedulingCards is a map/array. We find the one matching the rating.
    // ts-fsrs 'repeat' returns Record<Rating, { log: ReviewLog, card: Card }>
    // Actually it returns Record<number, ...> basically.

    const schedulingInfo = (schedulingCards as any)[rating];
    if (!schedulingInfo) {
        throw new Error('Invalid rating calculation');
    }

    const { card: newFCard, log: _reviewLog } = schedulingInfo;

    // 4. Update Database
    // Map FSRS state number to our DB enum string
    const stateMap: Record<State, 'new' | 'learning' | 'review' | 'relearning'> = {
        [State.New]: 'new',
        [State.Learning]: 'learning',
        [State.Review]: 'review',
        [State.Relearning]: 'relearning',
    };

    const newStateString = stateMap[newFCard.state as State];

    const { data: updatedCard, error: updateError } = await supabase
        .from('cards')
        .update({
            fsrs_data: newFCard, // Store the entire FSRS card object as JSON
            next_review_at: newFCard.due.toISOString(),
            state: newStateString,
            updated_at: new Date().toISOString(),
        })
        .eq('id', cardId)
        .select()
        .single();

    if (updateError) throw updateError;

    // Get user_id from deck for review log
    const { data: deck } = await supabase
        .from('decks')
        .select('user_id')
        .eq('id', dbCard.deck_id)
        .single();

    // Insert review log for analytics and algorithm optimization
    const { error: logError } = await supabase
        .from('review_logs')
        .insert({
            card_id: cardId,
            user_id: deck?.user_id || '',
            rating,
            state: newStateString,
            scheduled_days: Math.round((newFCard.due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            ease_factor: newFCard.stability,
            reviewed_at: new Date().toISOString()
        });

    if (logError) {
        console.error('[Study] Failed to insert review log:', logError);
        // Don't throw - log insertion failure shouldn't block card review
    }

    return updatedCard as Card;
}

// Re-export Rating for frontend use
export { Rating };
