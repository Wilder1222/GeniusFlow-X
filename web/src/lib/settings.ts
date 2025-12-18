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
    if (!user) {
        console.log('[Settings] 用户未登录');
        return null;
    }

    console.log('[Settings] 正在获取用户设置，user.id:', user.id);

    const { data, error } = await supabase
        .from('profile_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('获取用户设置失败 - 详细信息:');
        console.error('  错误对象:', error);
        console.error('  错误码:', error.code);
        console.error('  错误消息:', error.message);
        console.error('  错误详情:', error.details);
        console.error('  错误提示:', error.hint);
        console.log('  用户 ID:', user.id);

        // 如果是 PGRST116 错误（没有找到记录），自动创建默认设置
        if (error.code === 'PGRST116') {
            console.log('[Settings] 未找到设置记录，正在创建默认设置...');

            try {
                const defaultSettings = {
                    user_id: user.id,
                    theme: 'system',
                    language: 'zh-CN',
                    email_notifications: true,
                    daily_goal: 20,
                    tts_enabled: true,
                    tts_autoplay: false,
                };

                const { data: newData, error: insertError } = await supabase
                    .from('profile_settings')
                    .insert(defaultSettings)
                    .select()
                    .single();

                if (insertError) {
                    console.error('[Settings] 创建默认设置失败:', insertError);
                    return null;
                }

                console.log('[Settings] 成功创建默认设置:', newData);
                return settingsFromRow(newData as UserSettingsRow);
            } catch (createError) {
                console.error('[Settings] 创建设置时发生异常:', createError);
                return null;
            }
        }

        return null;
    }

    console.log('[Settings] 成功获取设置:', data);
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
