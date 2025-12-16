import { supabase } from '@/lib/supabase';
import { CreateDeckData, Deck, DeckRow, UpdateDeckData } from '@/types/decks';

export async function createDeck(userId: string, data: CreateDeckData): Promise<Deck> {
    const { data: deck, error } = await supabase
        .from('decks')
        .insert({
            user_id: userId,
            title: data.title,
            description: data.description,
            is_public: data.is_public || false,
            tags: data.tags || [],
        })
        .select()
        .single();

    if (error) throw error;
    return deck as Deck;
}

export async function getUserDecks(userId: string): Promise<Deck[]> {
    const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Deck[];
}

export async function getDeckById(id: string): Promise<Deck | null> {
    const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data as Deck;
}

export async function updateDeck(id: string, data: UpdateDeckData): Promise<Deck> {
    const { data: deck, error } = await supabase
        .from('decks')
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return deck as Deck;
}

export async function deleteDeck(id: string): Promise<void> {
    const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
