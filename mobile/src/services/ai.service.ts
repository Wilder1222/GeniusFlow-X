/**
 * AI Service - AI卡片生成服务
 * 
 * 处理AI相关的API调用，包括卡片生成、文件提取、简历分析等
 */

import { supabase } from '../lib/supabase';
import { ERROR_MESSAGES } from '../config/constants';

const isDev = __DEV__;
export const API_BASE_URL = isDev ? 'http://10.0.2.2:3000' : 'https://geniusflow-x.vercel.app'; // 针对 Android 模拟器，10.0.2.2 是宿主机的 localhost:3000';

export interface GeneratedCard {
    front: string;
    back: string;
    tags?: string[];
}

export interface AIUsageStatus {
    tier: 'free' | 'pro';
    limit: number;
    used: number;
    remaining: number;
    canGenerate: boolean;
}

export interface GenerateOptions {
    topic: string;
    count?: number;
    domain?: string;
    sourceType?: 'text' | 'file';
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

/**
 * 获取认证token
 */
async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

/**
 * 通用API请求函数
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
}

export const aiService = {
    /**
     * 从文本生成记忆卡片
     */
    async generateFlashcards(options: GenerateOptions): Promise<GeneratedCard[]> {
        try {
            const { topic, count = 5, domain = 'general', sourceType = 'text' } = options;

            const response = await apiRequest<ApiResponse<{
                cards: GeneratedCard[];
                provider: string;
                model: string;
            }>>('/api/ai/generate-cards', {
                method: 'POST',
                body: JSON.stringify({
                    text: topic,
                    count,
                    domain,
                    sourceType
                }),
            });

            if (response.success && response.data?.cards) {
                return response.data.cards;
            }

            throw new Error(response.error?.message || 'Failed to generate cards');
        } catch (error: any) {
            console.error('AI Service - Generate Error:', error);
            throw new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
        }
    },

    /**
     * 从上传的文件中提取文本
     */
    async extractFromFile(fileUri: string, fileName: string, mimeType: string): Promise<{
        text: string;
        filename: string;
        charCount: number;
    }> {
        try {
            const token = await getAuthToken();

            // 创建FormData
            const formData = new FormData();
            formData.append('file', {
                uri: fileUri,
                name: fileName,
                type: mimeType,
            } as any);

            const response = await fetch(`${API_BASE_URL}/api/ai/extract-file`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || 'File extraction failed');
            }

            const result: ApiResponse<{
                text: string;
                filename: string;
                charCount: number;
            }> = await response.json();

            if (result.success && result.data) {
                return result.data;
            }

            throw new Error(result.error?.message || 'Failed to extract text from file');
        } catch (error: any) {
            console.error('AI Service - Extract Error:', error);
            throw new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
        }
    },

    /**
     * 分析简历并生成面试卡片
     */
    async analyzeResume(resumeText: string, batchIndex: number = 0): Promise<{
        suggestions: string[];
        interviewCards: GeneratedCard[];
        hasMore: boolean;
        nextBatchIndex: number;
    }> {
        try {
            const response = await apiRequest<ApiResponse<{
                suggestions: string[];
                interviewCards: GeneratedCard[];
                hasMore: boolean;
                nextBatchIndex: number;
            }>>('/api/ai/analyze-resume', {
                method: 'POST',
                body: JSON.stringify({
                    resumeText,
                    batchIndex
                }),
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
        } catch (error: any) {
            console.error('AI Service - Resume Analysis Error:', error);
            throw new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
        }
    },

    /**
     * 重新生成单张卡片
     */
    async regenerateCard(
        originalCard: { front: string; back: string },
        context?: string,
        instruction?: string
    ): Promise<GeneratedCard> {
        try {
            const response = await apiRequest<ApiResponse<{
                card: GeneratedCard;
            }>>('/api/ai/regenerate-card', {
                method: 'POST',
                body: JSON.stringify({
                    originalCard,
                    context,
                    instruction
                }),
            });

            if (response.success && response.data?.card) {
                return response.data.card;
            }

            throw new Error(response.error?.message || 'Failed to regenerate card');
        } catch (error: any) {
            console.error('AI Service - Regenerate Error:', error);
            throw new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
        }
    },

    /**
     * 获取当前用户的AI使用状态
     */
    async getUsageStatus(): Promise<AIUsageStatus> {
        try {
            const response = await apiRequest<ApiResponse<{
                tier: 'free' | 'pro';
                limit: number;
                used: number;
                remaining: number;
                canGenerate: boolean;
            }>>('/api/ai/usage', {
                method: 'GET',
            });

            if (response.success && response.data) {
                return {
                    tier: response.data.tier || 'free',
                    limit: response.data.limit || 10,
                    used: response.data.used || 0,
                    remaining: response.data.remaining || 0,
                    canGenerate: response.data.canGenerate !== false
                };
            }

            // 返回默认值
            return {
                tier: 'free',
                limit: 10,
                used: 0,
                remaining: 10,
                canGenerate: true
            };
        } catch (error: any) {
            console.error('AI Service - Usage Status Error:', error);
            // 出错时返回默认值，不阻塞UI
            return {
                tier: 'free',
                limit: 10,
                used: 0,
                remaining: 10,
                canGenerate: true
            };
        }
    }
};
