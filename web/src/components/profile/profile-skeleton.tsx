import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import styles from './profile-skeleton.module.css';

export function ProfileSkeleton() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <Skeleton circle width={100} height={100} className={styles.avatar} />
                    <div className={styles.info}>
                        <Skeleton width="40%" height={32} style={{ marginBottom: 8 }} />
                        <Skeleton width="20%" height={24} style={{ marginBottom: 8 }} />
                        <Skeleton width="30%" height={20} />
                    </div>
                </div>
                <div className={styles.content}>
                    <Skeleton width="100%" height={20} style={{ marginBottom: 8 }} />
                    <Skeleton width="80%" height={20} />
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.left}>
                    <Skeleton width="100%" height={300} style={{ borderRadius: 16 }} />
                </div>
                <div className={styles.right}>
                    <Skeleton width="100%" height={200} style={{ marginBottom: 16, borderRadius: 16 }} />
                    <Skeleton width="100%" height={200} style={{ borderRadius: 16 }} />
                </div>
            </div>
        </div>
    );
}
