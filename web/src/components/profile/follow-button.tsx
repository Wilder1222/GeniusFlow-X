'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components';
import { followUser, unfollowUser } from '@/lib/social';
import styles from './follow-button.module.css';

export interface FollowButtonProps {
    targetUserId: string;
    isFollowing: boolean;
    onFollowChange?: (isFollowing: boolean) => void;
    size?: 'small' | 'medium';
}

export function FollowButton({
    targetUserId,
    isFollowing: initialIsFollowing,
    onFollowChange,
    size = 'medium',
}: FollowButtonProps) {
    const t = useTranslations('Profile');
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const handleClick = async () => {
        setLoading(true);

        try {
            if (isFollowing) {
                await unfollowUser(targetUserId);
                setIsFollowing(false);
                onFollowChange?.(false);
            } else {
                await followUser(targetUserId);
                setIsFollowing(true);
                onFollowChange?.(true);
            }
        } catch (err) {
            console.error('Follow action failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const getButtonContent = () => {
        if (loading) return t('processing');
        if (isFollowing) {
            return isHovering ? t('unfollow') : t('followingStatus');
        }
        return t('follow');
    };

    return (
        <button
            className={`${styles.button} ${styles[size]} ${isFollowing ? styles.following : styles.notFollowing} ${isHovering && isFollowing ? styles.unfollowHover : ''}`}
            onClick={handleClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            disabled={loading}
        >
            {getButtonContent()}
        </button>
    );
}
