/**
 * Card Service - 卡片服务
 * 
 * 处理卡片的增删改查及学习逻辑（集成 FSRS 算法）
 */

import { FSRS, Card as FSRSCard, Rating, State, createEmptyCard } from 'ts-fsrs';
import { supabase } from '../lib/supabase';
import { Card, CreateCardData } from '../types/decks';
import { ERROR_MESSAGES } from '../config/constants';

const fsrs = new FSRS({});

/**
 * 将数据库卡片数据转换为 FSRS 卡片对象
 */
function mapDbCardToFsrs(card: Card): FSRSCard {
    if (!card.fsrs_data || Object.keys(card.fsrs_data).length === 0) {
        return createEmptyCard();
    }

    const fetchCard = card.fsrs_data as FSRSCard;
    return {
        ...fetchCard,
        due: new Date(fetchCard.due),
        last_review: fetchCard.last_review ? new Date(fetchCard.last_review) : undefined,
    };
}

/**
 * 将 FSRS 状态转换为数据库状态枚举
 */
const stateMap: Record<number, 'new' | 'learning' | 'review' | 'relearning'> = {
    [State.New]: 'new',
    [State.Learning]: 'learning',
    [State.Review]: 'review',
    [State.Relearning]: 'relearning',
};

export const cardService = {
    /**
     * 获取卡组下的所有卡片
     */
    async getCardsByDeckId(deckId: string) {
        try {
            const { data, error } = await supabase
                .from('cards')
                .select('*')
                .eq('deck_id', deckId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return { data: (data || []) as Card[], error: null };
        } catch (error: any) {
            console.error('GetCards Error:', error.message);
            return { data: null, error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    },

    /**
     * 获取待复习卡片
     */
    async getDueCards(deckId?: string, limit = 50) {
        try {
            let query = supabase
                .from('cards')
                .select('*')
                .lte('next_review_at', new Date().toISOString())
                .order('next_review_at', { ascending: true })
                .limit(limit);

            if (deckId) {
                query = query.eq('deck_id', deckId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return { data: (data || []) as Card[], error: null };
        } catch (error: any) {
            console.error('GetDueCards Error:', error.message);
            return { data: null, error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    },

    /**
     * 创建新卡片
     */
    async createCard(data: CreateCardData) {
        try {
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
            return { data: card as Card, error: null };
        } catch (error: any) {
            console.error('CreateCard Error:', error.message);
            return { data: null, error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    },

    /**
     * 评分并在数据库中更新卡片状态
     */
    async gradeCard(card: Card, rating: Rating) {
        try {
            const fCard = mapDbCardToFsrs(card);
            const schedulingCards = fsrs.repeat(fCard, new Date());
            const schedulingInfo = (schedulingCards as any)[rating];

            if (!schedulingInfo) throw new Error('Invalid rating calculation');

            const { card: newFCard } = schedulingInfo;
            const newStateString = stateMap[newFCard.state];

            const { data: updatedCard, error: updateError } = await supabase
                .from('cards')
                .update({
                    fsrs_data: newFCard,
                    next_review_at: newFCard.due.toISOString(),
                    state: newStateString,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', card.id)
                .select()
                .single();

            if (updateError) throw updateError;

            // 异步记录复习日志，不阻塞 UI
            this.logReview(card.id, deckIdFromCard(card), rating, newStateString, newFCard);

            return { data: updatedCard as Card, error: null };
        } catch (error: any) {
            console.error('GradeCard Error:', error.message);
            return { data: null, error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    },

    /**
     * 记录复习日志
     */
    async logReview(cardId: string, deckId: string, rating: Rating, state: string, newFCard: FSRSCard) {
        try {
            // 需要获取 user_id，这里简化处理，假设我们可以通用的获取
            const { data: deck } = await supabase.from('decks').select('user_id').eq('id', deckId).single();

            await supabase.from('review_logs').insert({
                card_id: cardId,
                user_id: deck?.user_id || '',
                rating,
                state,
                scheduled_days: Math.round((newFCard.due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
                ease_factor: newFCard.stability,
                reviewed_at: new Date().toISOString()
            });
        } catch (e) {
            console.warn('LogReview Silent Error:', e);
        }
    },

    /**
     * 删除卡片
     */
    async deleteCard(id: string) {
        try {
            const { error } = await supabase.from('cards').delete().eq('id', id);
            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            return { error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    }
};

// 辅助函数
function deckIdFromCard(card: Card): string {
    return card.deck_id;
}
