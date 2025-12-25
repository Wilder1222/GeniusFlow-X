import { apiClient } from './api-client';
import { AIDomain } from './ai-domains';

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

interface ExtractFileResponse {
    success: boolean;
    data: {
        text: string;
        filename: string;
        size: number;
        charCount: number;
    };
    error?: {
        code: string;
        message: string;
    };
}

export interface GenerateOptions {
    topic: string;
    count?: number;
    domain?: AIDomain;
    sourceType?: 'text' | 'file';
}

export const aiService = {
    /**
     * Generate flashcards from text using AI
     */
    generateFlashcards: async (options: GenerateOptions): Promise<GeneratedCard[]> => {
        try {
            const { topic, count, domain = 'general', sourceType = 'text' } = options;

            const response = await apiClient.post<GenerateResponse>('/api/ai/generate-cards', {
                text: topic,
                count,
                domain,
                sourceType
            });

            if (response.success && response.data && Array.isArray(response.data.cards)) {
                return response.data.cards;
            }

            throw new Error(response.error?.message || 'Failed to generate cards');
        } catch (error) {
            console.error('AI Service Error:', error);
            throw error;
        }
    },

    /**
     * Extract text from uploaded file (PDF, DOCX, TXT)
     */
    extractFromFile: async (file: File): Promise<{ text: string; filename: string; charCount: number }> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/ai/extract-file', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result: ExtractFileResponse = await response.json();

            if (result.success && result.data) {
                return {
                    text: result.data.text,
                    filename: result.data.filename,
                    charCount: result.data.charCount
                };
            }

            throw new Error(result.error?.message || 'Failed to extract text from file');
        } catch (error) {
            console.error('File extraction error:', error);
            throw error;
        }
    }
};

// Backward compatible wrapper
export const generateFlashcards = (topic: string, count?: number) =>
    aiService.generateFlashcards({ topic, count });
