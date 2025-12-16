'use client';

import React, { useRef, useState, useEffect } from 'react';
import styles from './audio-player.module.css';

interface Props {
    src: string;
    title?: string;
}

export default function AudioPlayer({ src, title }: Props) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const time = parseFloat(e.target.value);
        audio.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.container}>
            <audio ref={audioRef} src={src} preload="metadata" />

            {title && <div className={styles.title}>{title}</div>}

            <div className={styles.controls}>
                <button
                    className={styles.playButton}
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? '⏸' : '▶️'}
                </button>

                <div className={styles.timeDisplay}>
                    {formatTime(currentTime)}
                </div>

                <input
                    type="range"
                    className={styles.seekBar}
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    step="0.1"
                />

                <div className={styles.timeDisplay}>
                    {formatTime(duration)}
                </div>
            </div>
        </div>
    );
}
