import { apiClient } from '@/lib/api-client';
import { CreateDeckData, Deck, UpdateDeckData } from '@/types/decks';

export async function createDeck(userId: string, data: CreateDeckData): Promise<Deck> {
    // userId is handled by the session in the API, we ignore the argument here
    const response = await apiClient.post<{ success: boolean; data: Deck }>('/api/decks', data);
    return response.data;
}

export async function getUserDecks(userId: string): Promise<Deck[]> {
    // Note: This API currently only fetches the *current* user's decks.
    // If userId != current user, this might be incorrect if the intention was to fetch another user's public decks.
    // However, for the standard "My Decks" use case, this is correct.
    // If we need to fetch another user's decks, we should create a specific endpoint like /api/user/[userId]/decks
    const response = await apiClient.get<{ success: boolean; data: Deck[] }>('/api/decks');
    return response.data || [];
}

export async function getDeckById(id: string): Promise<Deck | null> {
    try {
        const response = await apiClient.get<{ success: boolean; data: Deck }>(`/api/decks/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch deck:', error);
        return null;
    }
}

export async function updateDeck(id: string, data: UpdateDeckData): Promise<Deck> {
    const response = await apiClient.put<{ success: boolean; data: Deck }>(`/api/decks/${id}`, data);
    return response.data;
}

export async function deleteDeck(id: string): Promise<void> {
    await apiClient.delete(`/api/decks/${id}`);
}
