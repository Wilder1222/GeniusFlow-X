
export interface Deck {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    is_public: boolean;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface DeckRow {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    is_public: boolean;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
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
    fsrs_data: any; // Using any for JSONB for now, can be specific later
    next_review_at: string;
    state: 'new' | 'learning' | 'review' | 'relearning';
    // Study metadata
    due: string | null;
    interval: number | null;
    ease_factor: number | null;
    // Media support
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
