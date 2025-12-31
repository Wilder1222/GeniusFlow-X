/**
 * Social API - 社交功能（关注/粉丝）
 */

import { apiClient } from '@/lib/api-client';
import {
    type Follow,
    type FollowUser,
    type FollowCounts,
} from '@/types/social';

/**
 * 关注用户
 * @param targetUserId 要关注的用户 ID（9位数字）
 */
export async function followUser(targetUserId: string): Promise<Follow> {
    const result = await apiClient.post<{ followed: boolean }>(`/api/user/${targetUserId}/follow`);
    // Mocking return type to satisfy interface until strict unification
    // In reality we just need to know it succeeded
    return {
        id: 'temp-id',
        follower_id: '',
        following_id: '',
        created_at: new Date().toISOString()
    };
}

/**
 * 取消关注
 * @param targetUserId 要取关的用户 ID（9位数字）
 */
export async function unfollowUser(targetUserId: string): Promise<void> {
    await apiClient.delete(`/api/user/${targetUserId}/follow`);
}

/**
 * 检查是否已关注
 * @param targetUserId 目标用户 ID（9位数字）
 */
export async function isFollowing(targetUserId: string): Promise<boolean> {
    try {
        const { isFollowing } = await apiClient.get<{ isFollowing: boolean }>(`/api/user/${targetUserId}/follow/status`);
        return isFollowing;
    } catch (error) {
        console.error('Check following status failed:', error);
        return false;
    }
}

/**
 * 获取关注/粉丝数量
 * @param userId 用户 ID（9位数字）
 */
export async function getFollowCounts(userId: string): Promise<FollowCounts> {
    try {
        const response = await apiClient.get<{ success: boolean; data: FollowCounts }>(`/api/user/${userId}/follows/stats`);
        return response.data;
    } catch (error) {
        console.error('Get follow counts failed:', error);
        return { followersCount: 0, followingCount: 0 };
    }
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
    try {
        const response = await apiClient.get<{ success: boolean; data: FollowUser[] }>(`/api/user/${userId}/follows/followers?limit=${limit}&offset=${offset}`);
        return response.data || [];
    } catch (error) {
        console.error('Get followers failed:', error);
        return [];
    }
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
    try {
        const response = await apiClient.get<{ success: boolean; data: FollowUser[] }>(`/api/user/${userId}/follows/following?limit=${limit}&offset=${offset}`);
        return response.data || [];
    } catch (error) {
        console.error('Get following failed:', error);
        return [];
    }
}
