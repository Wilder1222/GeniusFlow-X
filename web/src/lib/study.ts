import { apiClient } from '@/lib/api-client';
import { Card } from '@/types/decks';
import { Rating } from 'ts-fsrs';

export async function getDueCards(deckId?: string, limit = 20): Promise<Card[]> {
    try {
        let url = `/api/cards?type=due&limit=${limit}`;
        if (deckId) {
            url += `&deckId=${deckId}`;
        }
        const response = await apiClient.get<{ success: boolean; data: Card[] }>(url);
        return response.data || [];
    } catch (error) {
        console.error('Failed to fetch due cards:', error);
        return [];
    }
}

export async function gradeCard(cardId: string, rating: Rating): Promise<Card> {
    try {
        const response = await apiClient.post<{ success: boolean; data: Card }>(`/api/cards/${cardId}/review`, { rating });
        return response.data;
    } catch (error) {
        console.error('Failed to grade card:', error);
        throw error;
    }
}

// Re-export Rating for frontend use
export { Rating };
