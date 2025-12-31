import { apiClient } from '@/lib/api-client';
import { Card, CreateCardData } from '@/types/decks';

export async function createCard(data: CreateCardData): Promise<Card> {
    const response = await apiClient.post<{ success: boolean; data: Card }>('/api/cards', data);
    return response.data;
}

export async function getCardsByDeckId(deckId: string): Promise<Card[]> {
    // Uses the updated GET /api/cards?deck_id=...
    const response = await apiClient.get<{ success: boolean; data: Card[] }>(`/api/cards?deck_id=${deckId}`);
    return response.data;
}

export async function updateCard(id: string, data: Partial<CreateCardData>): Promise<Card> {
    const response = await apiClient.put<{ success: boolean; data: Card }>(`/api/cards/${id}`, data);
    return response.data;
}

export async function deleteCard(id: string): Promise<void> {
    await apiClient.delete(`/api/cards/${id}`);
}
