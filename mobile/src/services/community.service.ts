import { apiClient } from '../lib/api-client';
import { Deck } from '../types/decks';

export interface PublicProfile {
    id: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    level: number;
    xp: number;
    membership_tier: 'free' | 'pro';
    is_public: boolean;
    created_at: string;
}

export interface CommunityService {
    getPublicDecks(params: {
        page?: number;
        pageSize?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        decks: Deck[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;

    getUserProfile(userId: string): Promise<PublicProfile>;

    getUserPublicDecks(userId: string): Promise<Deck[]>;

    forkDeck(deckId: string): Promise<Deck>;
}

export const communityService: CommunityService = {
    async getPublicDecks(params) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
            if (params.search) queryParams.append('search', params.search);
            if (params.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

            const response = await apiClient.get<any>(`/api/public-decks?${queryParams.toString()}`);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.error || 'Failed to fetch public decks');
        } catch (error: any) {
            console.error('getPublicDecks error:', error);
            throw error;
        }
    },

    async getUserProfile(userId) {
        try {
            const response = await apiClient.get<any>(`/api/user/${userId}/profile`);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.error || 'Failed to fetch user profile');
        } catch (error: any) {
            console.error('getUserProfile error:', error);
            throw error;
        }
    },

    async getUserPublicDecks(userId) {
        try {
            const response = await apiClient.get<any>(`/api/user/${userId}/decks`);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.error || 'Failed to fetch user public decks');
        } catch (error: any) {
            console.error('getUserPublicDecks error:', error);
            throw error;
        }
    },

    async forkDeck(deckId) {
        try {
            const response = await apiClient.post<any>(`/api/decks/${deckId}/fork`, {});
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.error || 'Failed to fork deck');
        } catch (error: any) {
            console.error('forkDeck error:', error);
            throw error;
        }
    }
};
