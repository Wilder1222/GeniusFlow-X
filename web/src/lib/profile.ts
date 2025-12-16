/**
 * Profile API - 用户资料管理
 */

import { supabase } from './supabase';
import {
    type Profile,
    type PublicProfile,
    type UpdateProfileData,
    type ProfileRow,
    profileFromRow,
} from '@/types/profile';

/**
 * 获取当前用户资料
 */
export async function getProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('获取用户资料失败:', error);
        return null;
    }

    return profileFromRow(data as ProfileRow);
}

/**
 * 通过用户 ID（9位数字）获取公开资料
 */
export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, bio, is_public')
        .eq('user_id', userId)
        .eq('is_public', true)
        .single();

    if (error || !data) {
        console.error('获取公开资料失败:', error);
        return null;
    }

    // 获取关注数量
    const [followersResult, followingResult] = await Promise.all([
        supabase
            .from('user_follows')
            .select('id', { count: 'exact', head: true })
            .eq('following_id', data.user_id),
        supabase
            .from('user_follows')
            .select('id', { count: 'exact', head: true })
            .eq('follower_id', data.user_id),
    ]);

    // 检查当前用户是否已关注
    let isFollowing = false;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('id, user_id')
            .eq('id', user.id)
            .single();

        if (currentProfile) {
            const { data: followData } = await supabase
                .from('user_follows')
                .select('id')
                .eq('follower_id', currentProfile.user_id)
                .eq('following_id', data.user_id)
                .single();

            isFollowing = !!followData;
        }
    }

    return {
        userId: data.user_id,
        username: data.username,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        followersCount: followersResult.count || 0,
        followingCount: followingResult.count || 0,
        isFollowing,
    };
}

/**
 * 更新用户资料
 */
export async function updateProfile(data: UpdateProfileData): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const updateData: Record<string, unknown> = {};

    if (data.displayName !== undefined) updateData.display_name = data.displayName;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic;

    // 用户名需要单独处理（验证唯一性）
    if (data.username !== undefined) {
        const isAvailable = await checkUsernameAvailable(data.username);
        if (!isAvailable) {
            throw new Error('用户名已被使用');
        }
        updateData.username = data.username;
    }

    const { data: result, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

    if (error) throw error;
    return profileFromRow(result as ProfileRow);
}

/**
 * 检查用户名是否可用
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
    // 验证用户名格式
    if (username.length < 3 || username.length > 20) {
        return false;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

    if (error && error.code === 'PGRST116') {
        // 未找到，用户名可用
        return true;
    }

    // 如果找到的是当前用户自己，也算可用
    if (data && user && data.id === user.id) {
        return true;
    }

    return false;
}

/**
 * 上传头像
 * @param file 图片文件
 * @returns 头像 URL
 */
export async function uploadAvatar(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const fileExt = file.name.split('.').pop();
    // 使用 GeniusFlow-X bucket，avatars 文件夹下按用户 ID 分目录存储
    const fileName = `avatars/${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('GeniusFlow-X')
        .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('GeniusFlow-X')
        .getPublicUrl(fileName);

    // 更新用户资料中的头像 URL
    await updateProfile({ avatarUrl: publicUrl });

    return publicUrl;
}
