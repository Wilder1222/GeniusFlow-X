/**
 * Deck Service - 卡组服务
 * 
 * 处理卡组的增删改查逻辑
 */

import { supabase } from '../lib/supabase';
import { Deck, CreateDeckData, UpdateDeckData } from '../types/decks';
import { ERROR_MESSAGES } from '../config/constants';

export const deckService = {
    /**
     * 获取用户的所有卡组
     */
    async getUserDecks(userId: string) {
        try {
            const { data, error } = await supabase
                .from('decks')
                .select(`
          *,
          cards(count)
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // 转换数据格式，提取 card_count
            const decks = data.map(deck => ({
                ...deck,
                card_count: deck.cards?.[0]?.count || 0,
            }));

            return { data: decks as Deck[], error: null };
        } catch (error: any) {
            console.error('GetUserDecks Error:', error.message);
            return { data: null, error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    },

    /**
     * 获取卡组详情
     */
    async getDeckById(id: string) {
        try {
            const { data, error } = await supabase
                .from('decks')
                .select(`
          *,
          cards(count)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            const deck = {
                ...data,
                card_count: data.cards?.[0]?.count || 0,
            };

            return { data: deck as Deck, error: null };
        } catch (error: any) {
            console.error('GetDeckById Error:', error.message);
            return { data: null, error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    },

    /**
     * 创建新卡组
     */
    async createDeck(userId: string, data: CreateDeckData) {
        try {
            const { data: deck, error } = await supabase
                .from('decks')
                .insert({
                    user_id: userId,
                    title: data.title,
                    description: data.description,
                    is_public: data.is_public || false,
                    tags: data.tags || [],
                })
                .select()
                .single();

            if (error) throw error;
            return { data: deck as Deck, error: null };
        } catch (error: any) {
            console.error('CreateDeck Error:', error.message);
            return { data: null, error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    },

    /**
     * 更新卡组
     */
    async updateDeck(id: string, data: UpdateDeckData) {
        try {
            const { data: deck, error } = await supabase
                .from('decks')
                .update({
                    ...data,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { data: deck as Deck, error: null };
        } catch (error: any) {
            console.error('UpdateDeck Error:', error.message);
            return { data: null, error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    },

    /**
     * 删除卡组
     */
    async deleteDeck(id: string) {
        try {
            const { error } = await supabase
                .from('decks')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error('DeleteDeck Error:', error.message);
            return { error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    }
};
