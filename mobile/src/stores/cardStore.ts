import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../lib/mmkv';
import { Card } from '../types/decks';
import { cardService } from '../services/card.service';
import { syncService } from '../services/sync.service';
import { Rating, FSRS, State, createEmptyCard, Card as FSRSCard } from 'ts-fsrs';

const fsrs = new FSRS({});

interface CardState {
    // deckId -> Card[]
    cardsByDeck: Record<string, Card[]>;
    loading: boolean;
    error: string | null;

    fetchCards: (deckId: string, force?: boolean) => Promise<void>;
    gradeCardOffline: (card: Card, rating: Rating) => Promise<void>;
    updateCardLocal: (card: Card) => void;
}

const stateMap: Record<number, 'new' | 'learning' | 'review' | 'relearning'> = {
    [State.New]: 'new',
    [State.Learning]: 'learning',
    [State.Review]: 'review',
    [State.Relearning]: 'relearning',
};

function mapDbCardToFsrs(card: Card): FSRSCard {
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

export const useCardStore = create<CardState>()(
    persist(
        (set, get) => ({
            cardsByDeck: {},
            loading: false,
            error: null,

            fetchCards: async (deckId: string, force = false) => {
                if (!force && get().cardsByDeck[deckId]) return;

                set({ loading: true, error: null });
                const { data, error } = await cardService.getCardsByDeckId(deckId);

                if (error) {
                    set({ error, loading: false });
                } else {
                    set((state) => ({
                        cardsByDeck: {
                            ...state.cardsByDeck,
                            [deckId]: data || []
                        },
                        loading: false
                    }));
                }
            },

            gradeCardOffline: async (card: Card, rating: Rating) => {
                // 1. Calculate new state locally
                const fCard = mapDbCardToFsrs(card);
                const schedulingCards = fsrs.repeat(fCard, new Date());
                const schedulingInfo = (schedulingCards as any)[rating];
                const { card: newFCard } = schedulingInfo;
                const newStateString = stateMap[newFCard.state];

                const updatedCard: Card = {
                    ...card,
                    fsrs_data: newFCard,
                    next_review_at: newFCard.due.toISOString(),
                    state: newStateString,
                    updated_at: new Date().toISOString(),
                };

                // 2. Update local store
                const deckId = card.deck_id;
                const deckCards = get().cardsByDeck[deckId] || [];
                set((state) => ({
                    cardsByDeck: {
                        ...state.cardsByDeck,
                        [deckId]: deckCards.map(c => c.id === card.id ? updatedCard : c)
                    }
                }));

                // 3. Queue for sync
                // We add BOTH the grade update AND the review log to the queue
                await syncService.addToQueue('grade_card', { card, rating });
                await syncService.addToQueue('log_review', {
                    cardId: card.id,
                    deckId: card.deck_id,
                    rating,
                    state: newStateString,
                    newFCard
                });
            },

            updateCardLocal: (updatedCard) => {
                const deckId = updatedCard.deck_id;
                const deckCards = get().cardsByDeck[deckId] || [];
                set((state) => ({
                    cardsByDeck: {
                        ...state.cardsByDeck,
                        [deckId]: deckCards.map(c => c.id === updatedCard.id ? updatedCard : c)
                    }
                }));
            }
        }),
        {
            name: 'card-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
