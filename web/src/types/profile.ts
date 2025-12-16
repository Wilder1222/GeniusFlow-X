/**
 * Profile Types - 用户资料相关类型定义
 */

/**
 * 用户资料（完整）
 */
export interface Profile {
    id: string;
    userId: string;             // 9位数字唯一 ID (100000001)
    username: string;           // 可修改的用户名
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    isPublic: boolean;          // 资料是否公开
    createdAt: string;
    updatedAt: string;
}

/**
 * 公开资料（用于展示）
 */
export interface PublicProfile {
    userId: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    followersCount: number;
    followingCount: number;
    isFollowing?: boolean;      // 当前用户是否已关注
}

/**
 * 更新资料数据
 */
export interface UpdateProfileData {
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    bio?: string;
    isPublic?: boolean;
}

/**
 * 用户设置
 */
export interface UserSettings {
    id: string;
    userId: string;
    theme: 'light' | 'dark' | 'system';
    language: string;
    emailNotifications: boolean;
    dailyGoal: number;
    ttsEnabled: boolean;
    ttsAutoPlay: boolean;
    updatedAt: string;
}

/**
 * 更新设置数据
 */
export interface UpdateSettingsData {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    emailNotifications?: boolean;
    dailyGoal?: number;
    ttsEnabled?: boolean;
    ttsAutoPlay?: boolean;
}

/**
 * 学习统计
 */
export interface StudyStats {
    id: string;
    userId: string;
    totalCardsReviewed: number;
    totalStudyTimeMinutes: number;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string | null;
    updatedAt: string;
}

/**
 * 数据库行类型（Supabase 返回的原始格式）
 */
export interface ProfileRow {
    id: string; // UUID from auth.users
    user_id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserSettingsRow {
    id: number;
    // uuid removed
    user_id: string;
    theme: string;
    language: string;
    email_notifications: boolean;
    daily_goal: number;
    tts_enabled: boolean;
    tts_autoplay: boolean;
    updated_at: string;
}

export interface StudyStatsRow {
    id: number;
    // uuid removed
    user_id: string;
    total_cards_reviewed: number;
    total_study_time_minutes: number;
    current_streak: number;
    longest_streak: number;
    last_study_date: string | null;
    updated_at: string;
}

/**
 * 行数据转换为前端类型
 */
export function profileFromRow(row: ProfileRow): Profile {
    return {
        id: row.id,
        userId: row.user_id,
        username: row.username,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        isPublic: row.is_public,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function settingsFromRow(row: UserSettingsRow): UserSettings {
    return {
        id: row.id.toString(),
        userId: row.user_id,
        theme: row.theme as 'light' | 'dark' | 'system',
        language: row.language,
        emailNotifications: row.email_notifications,
        dailyGoal: row.daily_goal,
        ttsEnabled: row.tts_enabled ?? true,    // Default true if null
        ttsAutoPlay: row.tts_autoplay ?? false, // Default false
        updatedAt: row.updated_at,
    };
}

export function statsFromRow(row: StudyStatsRow): StudyStats {
    return {
        id: row.id.toString(),
        userId: row.user_id,
        totalCardsReviewed: row.total_cards_reviewed,
        totalStudyTimeMinutes: row.total_study_time_minutes,
        currentStreak: row.current_streak,
        longestStreak: row.longest_streak,
        lastStudyDate: row.last_study_date,
        updatedAt: row.updated_at,
    };
}
