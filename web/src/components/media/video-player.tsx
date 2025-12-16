'use client';

import React from 'react';
import styles from './video-player.module.css';

interface Props {
    src: string;
    title?: string;
    type?: 'local' | 'youtube' | 'bilibili';
}

export default function VideoPlayer({ src, title, type = 'local' }: Props) {
    const renderPlayer = () => {
        if (type === 'youtube') {
            // Extract video ID from URL
            const videoId = src.includes('youtube.com')
                ? new URL(src).searchParams.get('v')
                : src.split('/').pop();

            return (
                <iframe
                    className={styles.iframe}
                    src={`https://www.youtube.com/embed/${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            );
        }

        if (type === 'bilibili') {
            // Extract BV ID
            const bvMatch = src.match(/BV[a-zA-Z0-9]+/);
            const bvId = bvMatch ? bvMatch[0] : '';

            return (
                <iframe
                    className={styles.iframe}
                    src={`https://player.bilibili.com/player.html?bvid=${bvId}`}
                    scrolling="no"
                    allowFullScreen
                />
            );
        }

        // Local video
        return (
            <video
                className={styles.video}
                src={src}
                controls
                preload="metadata"
            >
                Your browser does not support the video tag.
            </video>
        );
    };

    return (
        <div className={styles.container}>
            {title && <div className={styles.title}>{title}</div>}
            <div className={styles.playerWrapper}>
                {renderPlayer()}
            </div>
        </div>
    );
}
