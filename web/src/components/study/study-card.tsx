'use client';

import React, { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Card } from '@/types/decks';
import { Rating } from '@/lib/study';
import { useTTS } from '@/hooks/use-tts';
import { LuVolume2 } from 'react-icons/lu';
import styles from './study-card.module.css';

interface StudyCardProps {
    card: Card;
    isRevealed: boolean;
    onReveal?: () => void;
    onGrade: (rating: Rating) => void;
    ttsEnabled?: boolean;
    ttsAutoPlay?: boolean;
}

export function StudyCard({ card, isRevealed, onReveal, onGrade, ttsEnabled = true, ttsAutoPlay = false }: StudyCardProps) {
    const { speak, isSpeaking } = useTTS();

    // Swipe values
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacityLeft = useTransform(x, [-150, -50], [1, 0]);
    const opacityRight = useTransform(x, [50, 150], [0, 1]);

    // TTS Effect
    React.useEffect(() => {
        if (!ttsEnabled || !ttsAutoPlay) return;
        const textToSpeak = isRevealed ? card.back : card.front;
        speak(textToSpeak);
    }, [card.id, isRevealed, ttsEnabled, ttsAutoPlay, speak, card.front, card.back]);

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation();
        const text = isRevealed ? card.back : card.front;
        speak(text);
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 120;
        if (info.offset.x > threshold && isRevealed) {
            onGrade(Rating.Good);
        } else if (info.offset.x < -threshold && isRevealed) {
            onGrade(Rating.Again);
        }
    };

    const handleClick = () => {
        if (onReveal) {
            onReveal();
        }
    };

    return (
        <div className={styles.cardWrapper}>
            <motion.div
                className={styles.perspectiveContainer}
                style={{ x, rotate, touchAction: 'none' }}
                drag={isRevealed ? "x" : false}
                dragListener={isRevealed}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={handleDragEnd}
                onClick={handleClick}
            >
                {/* Swipe Feedback Overlays */}
                <AnimatePresence>
                    {isRevealed && x.get() < -20 && (
                        <motion.div
                            className={`${styles.swipeIndicator} ${styles.indicatorLeft}`}
                            style={{ opacity: opacityLeft }}
                        >
                            忘记
                        </motion.div>
                    )}
                    {isRevealed && x.get() > 20 && (
                        <motion.div
                            className={`${styles.swipeIndicator} ${styles.indicatorRight}`}
                            style={{ opacity: opacityRight }}
                        >
                            记得
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className={styles.cardInner}
                    animate={{ rotateY: isRevealed ? 180 : 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20
                    }}
                >
                    {/* FRONT FACE */}
                    <div className={styles.cardFront}>
                        <div className={styles.cardContent}>
                            <div className={styles.tag}>问题</div>
                            <div className={styles.text}>{card.front}</div>
                        </div>
                        <div className={styles.cardFooter}>
                            <span className={styles.hint}>点击卡片显示答案</span>
                        </div>
                        {ttsEnabled && (
                            <button
                                className={`${styles.speakerBtn} ${isSpeaking ? styles.speaking : ''}`}
                                onClick={handleSpeak}
                            >
                                <LuVolume2 />
                            </button>
                        )}
                    </div>

                    {/* BACK FACE */}
                    <div className={styles.cardBack}>
                        <div className={styles.cardContent}>
                            <div className={styles.tag}>答案</div>
                            <div className={styles.text}>{card.back}</div>
                        </div>
                        <div className={styles.cardFooter}>
                            <span className={styles.hint}>左右滑动卡片快速评分</span>
                        </div>
                        {ttsEnabled && (
                            <button
                                className={`${styles.speakerBtn} ${isSpeaking ? styles.speaking : ''}`}
                                onClick={handleSpeak}
                            >
                                <LuVolume2 />
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
