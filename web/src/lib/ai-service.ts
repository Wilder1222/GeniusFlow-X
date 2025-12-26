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
    },

    /**
     * Analyze resume and generate interview cards
     */
    analyzeResume: async (resumeText: string, batchIndex: number = 0): Promise<{
        suggestions: string[];
        interviewCards: GeneratedCard[];
        hasMore: boolean;
        nextBatchIndex: number;
    }> => {
        try {
            const response = await apiClient.post<any>('/api/ai/analyze-resume', {
                resumeText,
                batchIndex
            });

            if (response.success && response.data) {
                return {
                    suggestions: response.data.suggestions || [],
                    interviewCards: response.data.interviewCards || [],
                    hasMore: response.data.hasMore || false,
                    nextBatchIndex: response.data.nextBatchIndex || batchIndex + 1
                };
            }

            throw new Error(response.error?.message || 'Failed to analyze resume');
        } catch (error) {
            console.error('Resume analysis error:', error);
            throw error;
        }
    },

    /**
     * Regenerate a single card (consumes 1 AI usage)
     */
    regenerateCard: async (originalCard: { front: string; back: string }, context?: string, instruction?: string): Promise<GeneratedCard> => {
        try {
            const response = await apiClient.post<any>('/api/ai/regenerate-card', {
                originalCard,
                context,
                instruction
            });

            if (response.success && response.data?.card) {
                return response.data.card;
            }

            throw new Error(response.error?.message || 'Failed to regenerate card');
        } catch (error) {
            console.error('Card regeneration error:', error);
            throw error;
        }
    },

    /**
     * Get current AI usage status for the user
     */
    getUsageStatus: async (): Promise<AIUsageStatus> => {
        try {
            const response = await apiClient.get<any>('/api/ai/usage');

            if (response.success && response.data) {
                return {
                    tier: response.data.tier || 'free',
                    limit: response.data.limit || 10,
                    used: response.data.used || 0,
                    remaining: response.data.remaining || 0,
                    canGenerate: response.data.canGenerate !== false
                };
            }

            return { tier: 'free', limit: 10, used: 0, remaining: 10, canGenerate: true };
        } catch (error) {
            console.error('Get usage status error:', error);
            return { tier: 'free', limit: 10, used: 0, remaining: 10, canGenerate: true };
        }
    }
};

export interface AIUsageStatus {
    tier: 'free' | 'pro';
    limit: number;
    used: number;
    remaining: number;
    canGenerate: boolean;
}

// Backward compatible wrapper
export const generateFlashcards = (topic: string, count?: number) =>
    aiService.generateFlashcards({ topic, count });
