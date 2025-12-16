import { supabase } from '@/lib/supabase';
import { Card, CreateCardData } from '@/types/decks';

export async function createCard(data: CreateCardData): Promise<Card> {
    const { data: card, error } = await supabase
        .from('cards')
        .insert({
            deck_id: data.deck_id,
            front: data.front,
            back: data.back,
            fsrs_data: data.fsrs_data || {},
            state: data.state || 'new',
        })
        .select()
        .single();

    if (error) throw error;
    return card as Card;
}

export async function getCardsByDeckId(deckId: string): Promise<Card[]> {
    const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: true }); // Often chronological creation for study order

    if (error) throw error;
    return (data || []) as Card[];
}

export async function updateCard(id: string, data: Partial<CreateCardData>): Promise<Card> {
    const { data: card, error } = await supabase
        .from('cards')
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return card as Card;
}

export async function deleteCard(id: string): Promise<void> {
    const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
