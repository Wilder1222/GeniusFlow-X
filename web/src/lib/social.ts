/**
 * Social API - 社交功能（关注/粉丝）
 */

import { supabase } from './supabase';
import {
    type Follow,
    type FollowUser,
    type FollowCounts,
    type FollowRow,
    followFromRow,
} from '@/types/social';

/**
 * 关注用户
 * @param targetUserId 要关注的用户 ID（9位数字）
 */
export async function followUser(targetUserId: string): Promise<Follow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    // 获取目标用户的 UUID
    const { data: targetProfile, error: targetError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('user_id', targetUserId)
        .single();

    if (targetError || !targetProfile) {
        throw new Error('用户不存在');
    }

    // 不能关注自己
    if (targetProfile.id === user.id) {
        throw new Error('不能关注自己');
    }

    // 获取当前用户的 9-digit user_id
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', user.id)
        .single();

    if (!currentUserProfile) throw new Error('当前用户资料不存在');

    const { data, error } = await supabase
        .from('user_follows')
        .insert({
            follower_id: currentUserProfile.user_id,
            following_id: targetProfile.user_id,
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new Error('已经关注过该用户');
        }
        throw error;
    }

    return followFromRow(data as FollowRow);
}

/**
 * 取消关注
 * @param targetUserId 要取关的用户 ID（9位数字）
 */
export async function unfollowUser(targetUserId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    // 获取目标用户的 UUID
    const { data: targetProfile, error: targetError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', targetUserId)
        .single();

    if (targetError || !targetProfile) {
        throw new Error('用户不存在');
    }

    // 获取当前用户的 9-digit user_id
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', user.id)
        .single();

    if (!currentUserProfile) throw new Error('当前用户资料不存在');

    const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', currentUserProfile.user_id)
        .eq('following_id', targetProfile.user_id);

    if (error) throw error;
}

/**
 * 检查是否已关注
 * @param targetUserId 目标用户 ID（9位数字）
 */
export async function isFollowing(targetUserId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // 获取目标用户的 UUID
    const { data: targetProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', targetUserId)
        .single();

    if (!targetProfile) return false;

    // 获取当前用户的 9-digit user_id
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', user.id)
        .single();

    if (!currentUserProfile) return false;

    const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', currentUserProfile.user_id)
        .eq('following_id', targetProfile.user_id)
        .single();

    return !!data;
}

/**
 * 获取关注/粉丝数量
 * @param userId 用户 ID（9位数字）
 */
export async function getFollowCounts(userId: string): Promise<FollowCounts> {
    // 获取用户的 UUID
    const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

    if (!profile) {
        return { followersCount: 0, followingCount: 0 };
    }

    const [followersResult, followingResult] = await Promise.all([
        supabase
            .from('user_follows')
            .select('id', { count: 'exact', head: true })
            .eq('following_id', profile.user_id),
        supabase
            .from('user_follows')
            .select('id', { count: 'exact', head: true })
            .eq('follower_id', profile.user_id),
    ]);

    return {
        followersCount: followersResult.count || 0,
        followingCount: followingResult.count || 0,
    };
}

/**
 * 获取粉丝列表
 * @param userId 用户 ID（9位数字）
 * @param limit 每页数量
 * @param offset 偏移量
 */
export async function getFollowers(
    userId: string,
    limit: number = 20,
    offset: number = 0
): Promise<FollowUser[]> {
    // 获取用户的 UUID
    const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

    if (!profile) return [];

    const { data, error } = await supabase
        .from('user_follows')
        .select(`
            id,
            follower_id,
            profiles!follows_follower_id_fkey (
                user_id,
                username,
                display_name,
                avatar_url,
                bio
            )
        `)
        .eq('following_id', profile.user_id)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('获取粉丝列表失败:', error);
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((item: any) => ({
        userId: item.profiles.user_id,
        username: item.profiles.username,
        displayName: item.profiles.display_name,
        avatarUrl: item.profiles.avatar_url,
        bio: item.profiles.bio,
    }));
}

/**
 * 获取关注列表
 * @param userId 用户 ID（9位数字）
 * @param limit 每页数量
 * @param offset 偏移量
 */
export async function getFollowing(
    userId: string,
    limit: number = 20,
    offset: number = 0
): Promise<FollowUser[]> {
    // 获取用户的 UUID
    const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

    if (!profile) return [];

    const { data, error } = await supabase
        .from('user_follows')
        .select(`
            id,
            following_id,
            profiles!follows_following_id_fkey (
                user_id,
                username,
                display_name,
                avatar_url,
                bio
            )
        `)
        .eq('follower_id', profile.user_id)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('获取关注列表失败:', error);
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((item: any) => ({
        userId: item.profiles.user_id,
        username: item.profiles.username,
        displayName: item.profiles.display_name,
        avatarUrl: item.profiles.avatar_url,
        bio: item.profiles.bio,
    }));
}
