/**
 * Deck Types - 卡组相关类型定义
 */

export interface Deck {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    is_public: boolean;
    tags: string[];
    created_at: string;
    updated_at: string;
    // 计算字段（可选）
    card_count?: number;
    new_count?: number;
    learning_count?: number;
    review_count?: number;
}

export interface CreateDeckData {
    title: string;
    description?: string;
    is_public?: boolean;
    tags?: string[];
}

export interface UpdateDeckData {
    title?: string;
    description?: string;
    is_public?: boolean;
    tags?: string[];
}

export interface Card {
    id: string;
    deck_id: string;
    front: string;
    back: string;
    tags?: string[];
    fsrs_data: any;
    next_review_at: string;
    state: 'new' | 'learning' | 'review' | 'relearning';
    due: string | null;
    interval: number | null;
    ease_factor: number | null;
    front_media?: string | null;
    back_media?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCardData {
    deck_id: string;
    front: string;
    back: string;
    fsrs_data?: any;
    state?: 'new' | 'learning' | 'review' | 'relearning';
}
