/**
 * Social Types - 社交功能相关类型定义
 */

/**
 * 关注关系
 */
export interface Follow {
    id: string;
    followerId: string;
    followingId: string;
    createdAt: string;
}

/**
 * 关注列表中的用户信息
 */
export interface FollowUser {
    userId: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    isFollowing?: boolean;      // 当前用户是否已关注此人
}

/**
 * 关注统计
 */
export interface FollowCounts {
    followersCount: number;
    followingCount: number;
}

/**
 * 数据库行类型
 */
export interface FollowRow {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
}

/**
 * 关注列表查询结果（包含 profile 信息）
 */
export interface FollowWithProfileRow {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
    profiles: {
        user_id: string;
        username: string;
        display_name: string | null;
        avatar_url: string | null;
        bio: string | null;
    };
}

/**
 * 行数据转换为前端类型
 */
export function followFromRow(row: FollowRow): Follow {
    return {
        id: row.id,
        followerId: row.follower_id,
        followingId: row.following_id,
        createdAt: row.created_at,
    };
}

export function followUserFromRow(
    row: FollowWithProfileRow['profiles'],
    isFollowing?: boolean
): FollowUser {
    return {
        userId: row.user_id,
        username: row.username,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        isFollowing,
    };
}
