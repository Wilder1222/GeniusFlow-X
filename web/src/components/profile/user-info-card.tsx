'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components';
import { FollowButton } from './follow-button';
import styles from './user-info-card.module.css';

interface UserInfoCardProps {
    profile: {
        userId: string; // 9-digit
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
        bio: string | null;
        followersCount: number;
        followingCount: number;
        isFollowing: boolean;
        isOwnProfile: boolean;
    };
}

export function UserInfoCard({ profile }: UserInfoCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.avatarContainer}>
                    {profile.avatarUrl ? (
                        <Image
                            src={profile.avatarUrl}
                            alt={profile.displayName || profile.username}
                            width={100}
                            height={100}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {(profile.displayName || profile.username || '?')[0].toUpperCase()}
                        </div>
                    )}
                </div>

                <div className={styles.info}>
                    <h1 className={styles.name}>{profile.displayName || profile.username}</h1>
                    <p className={styles.username}>@{profile.username}</p>
                    <p className={styles.joinDate}>ID: {profile.userId}</p>
                </div>

                <div className={styles.actions}>
                    {profile.isOwnProfile ? (
                        <Link href="/profile">
                            <Button variant="secondary">
                                编辑资料
                            </Button>
                        </Link>
                    ) : (
                        <FollowButton
                            targetUserId={profile.userId}
                            isFollowing={profile.isFollowing}
                        />
                    )}
                </div>
            </div>

            <div className={styles.bio}>
                {profile.bio || '这个人很懒，什么都没写~'}
            </div>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{profile.followersCount}</span>
                    <span className={styles.statLabel}>粉丝</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{profile.followingCount}</span>
                    <span className={styles.statLabel}>关注</span>
                </div>
            </div>
        </div>
    );
}
