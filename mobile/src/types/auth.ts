/**
 * Auth Types - 认证相关类型定义
 */

import { AuthResponse as SupabaseAuthResponse, User, Session } from '@supabase/supabase-js';

export interface SignInCredentials {
    email: string;
    password: string;
}

export interface SignUpCredentials {
    email: string;
    password: string;
    username: string;
}

export interface UpdateProfileData {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
}

export interface AuthResponse {
    data: SupabaseAuthResponse['data'] | null;
    error: string | null;
}

export interface AuthContextType {
    user: User | null;
    session: Session | null;
    isInitialLoading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    profile: Profile | null;
}

export interface Profile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    membership_tier: 'free' | 'pro';
    ai_generation_count: number;
    last_ai_reset: string | null;
    // 统计字段 (可能通过 join 或单独查询获取)
    current_streak?: number;
    longest_streak?: number;
    total_cards_reviewed?: number;
    total_study_time_minutes?: number;
    created_at: string;
    updated_at: string;
}
