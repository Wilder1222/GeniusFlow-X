'use client';

import React from 'react';
import styles from './card-media-display.module.css';

interface CardMediaDisplayProps {
    frontMedia?: string | null;
    backMedia?: string | null;
    compact?: boolean;
}

export default function CardMediaDisplay({ frontMedia, backMedia, compact = false }: CardMediaDisplayProps) {
    if (!frontMedia && !backMedia) return null;

    return (
        <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
            {frontMedia && (
                <div className={styles.mediaItem}>
                    <img
                        src={frontMedia}
                        alt="Front media"
                        className={styles.image}
                        loading="lazy"
                    />
                </div>
            )}
            {backMedia && (
                <div className={styles.mediaItem}>
                    <img
                        src={backMedia}
                        alt="Back media"
                        className={styles.image}
                        loading="lazy"
                    />
                </div>
            )}
        </div>
    );
}
