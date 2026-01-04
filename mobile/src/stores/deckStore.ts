import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../lib/mmkv';
import { Deck } from '../types/decks';
import { deckService } from '../services/deck.service';

interface DeckState {
    decks: Deck[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;

    fetchDecks: (userId: string, force?: boolean) => Promise<void>;
    addDeck: (deck: Deck) => void;
    updateDeck: (deck: Deck) => void;
    removeDeck: (deckId: string) => void;
    setDecks: (decks: Deck[]) => void;
}

export const useDeckStore = create<DeckState>()(
    persist(
        (set, get) => ({
            decks: [],
            loading: false,
            error: null,
            lastFetched: null,

            fetchDecks: async (userId: string, force = false) => {
                const { lastFetched } = get();
                const now = Date.now();

                // 5分钟缓存策略
                if (!force && lastFetched && now - lastFetched < 5 * 60 * 1000) {
                    return;
                }

                set({ loading: true, error: null });
                const { data, error } = await deckService.getUserDecks(userId);

                if (error) {
                    set({ error, loading: false });
                } else {
                    set({ decks: data || [], loading: false, lastFetched: now });
                }
            },

            addDeck: (deck) => set((state) => ({ decks: [deck, ...state.decks] })),

            updateDeck: (updatedDeck) => set((state) => ({
                decks: state.decks.map(d => d.id === updatedDeck.id ? updatedDeck : d)
            })),

            removeDeck: (deckId) => set((state) => ({
                decks: state.decks.filter(d => d.id !== deckId)
            })),

            setDecks: (decks) => set({ decks, lastFetched: Date.now() }),
        }),
        {
            name: 'deck-storage',
            storage: createJSONStorage(() => mmkvStorage),
            partialize: (state) => ({
                decks: state.decks,
                lastFetched: state.lastFetched,
            }),
        }
    )
);
