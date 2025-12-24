import { apiClient } from './api-client';

export interface GeneratedCard {
    front: string;
    back: string;
    tags?: string[];
}

interface GenerateResponse {
    success: boolean;
    data: {
        cards: GeneratedCard[];
        provider: string;
        model: string;
        usage: {
            promptTokens: number;
            completionTokens: number;
        };
    };
    error?: {
        code: string;
        message: string;
    };
}

export const aiService = {
    generateFlashcards: async (topic: string, count?: number): Promise<GeneratedCard[]> => {
        try {
            // Use existing endpoint /api/ai/generate-cards
            // Backend expects 'text' not 'topic'
            const response = await apiClient.post<GenerateResponse>('/api/ai/generate-cards', {
                text: topic,
                count
            });

            if (response.success && response.data && Array.isArray(response.data.cards)) {
                return response.data.cards;
            }

            throw new Error(response.error?.message || 'Failed to generate cards');
        } catch (error) {
            console.error('AI Service Error:', error);
            throw error;
        }
    }
};
