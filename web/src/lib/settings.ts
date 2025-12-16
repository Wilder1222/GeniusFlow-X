/**
 * Settings API - 用户设置管理
 */

import { supabase } from './supabase';
import {
    type UserSettings,
    type UpdateSettingsData,
    type UserSettingsRow,
    settingsFromRow,
} from '@/types/profile';

/**
 * 获取用户设置
 */
export async function getSettings(): Promise<UserSettings | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profile_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('获取用户设置失败:', error);
        return null;
    }

    return settingsFromRow(data as unknown as UserSettingsRow);
}

/**
 * 更新用户设置
 */
export async function updateSettings(settings: UpdateSettingsData): Promise<UserSettings | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const updateData: Record<string, unknown> = {};

    if (settings.theme !== undefined) updateData.theme = settings.theme;
    if (settings.language !== undefined) updateData.language = settings.language;
    if (settings.emailNotifications !== undefined) updateData.email_notifications = settings.emailNotifications;
    if (settings.dailyGoal !== undefined) {
        // 验证每日目标范围
        if (settings.dailyGoal < 1 || settings.dailyGoal > 500) {
            throw new Error('每日目标必须在 1-500 之间');
        }
        updateData.daily_goal = settings.dailyGoal;
    }
    if (settings.ttsEnabled !== undefined) updateData.tts_enabled = settings.ttsEnabled;
    if (settings.ttsAutoPlay !== undefined) updateData.tts_autoplay = settings.ttsAutoPlay;

    const { data, error } = await supabase
        .from('profile_settings')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) throw error;
    return settingsFromRow(data as UserSettingsRow);
}

/**
 * 重置设置为默认值
 */
export async function resetSettings(): Promise<UserSettings | null> {
    return updateSettings({
        theme: 'system',
        language: 'zh-CN',
        emailNotifications: true,
        dailyGoal: 20,
    });
}
