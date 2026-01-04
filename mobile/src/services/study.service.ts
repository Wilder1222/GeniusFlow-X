import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../services/ai.service'; // Reuse for simplicity or define in a config
import { Achievement } from './achievement.service';

export interface StudySession {
    id: string;
    user_id: string;
    deck_id?: string;
    started_at: string;
    ended_at?: string;
    cards_studied: number;
    cards_new: number;
    cards_reviewed: number;
    cards_relearned: number;
    correct_count: number;
    wrong_count: number;
    total_time_ms: number;
}

export interface SessionResult {
    xpGained: number;
    newXP: number;
    newLevel: number;
    leveledUp: boolean;
    totalCards: number;
    achievements: {
        unlocked: {
            code: string;
            name: string;
            xpReward: number;
        }[];
        xpGained: number;
    };
}

export const studyService = {
    /**
     * 开始学习会话
     */
    async startSession(deckId?: string): Promise<string | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('study_sessions')
                .insert({
                    user_id: user.id,
                    deck_id: deckId,
                    started_at: new Date().toISOString(),
                    cards_studied: 0,
                    total_time_ms: 0
                })
                .select()
                .single();

            if (error) throw error;
            return data.id;
        } catch (error) {
            console.error('Failed to start study session:', error);
            return null;
        }
    },

    /**
     * 更新会话进度 (火快发，不等待响应)
     */
    async updateSessionProgress(sessionId: string, data: Partial<StudySession>) {
        try {
            await supabase
                .from('study_sessions')
                .update(data)
                .eq('id', sessionId);
        } catch (error) {
            console.error('Failed to update session progress:', error);
        }
    },

    /**
     * 完成学习会话
     */
    async completeSession(
        correctCount: number,
        incorrectCount: number,
        sessionId?: string,
        durationMs?: number
    ): Promise<SessionResult | null> {
        try {
            const { data: { session: authSession } } = await supabase.auth.getSession();
            if (!authSession) return null;

            // 1. 如果有 sessionId，先更新数据库中的最终状态
            if (sessionId) {
                await this.updateSessionProgress(sessionId, {
                    ended_at: new Date().toISOString(),
                    correct_count: correctCount,
                    wrong_count: incorrectCount,
                    total_time_ms: durationMs || 0,
                    cards_studied: correctCount + incorrectCount
                });
            }

            // 2. 调用 Web API 处理 XP、成就和连胜
            const response = await fetch(`${API_BASE_URL}/api/study/complete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authSession.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correctCount,
                    incorrectCount
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to complete session via API');
            }

            const result = await response.json();
            return result.data as SessionResult;
        } catch (error) {
            console.error('Failed to complete study session:', error);
            return null;
        }
    }
};
