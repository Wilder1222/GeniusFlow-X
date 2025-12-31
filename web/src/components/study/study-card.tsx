'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Card } from '@/types/decks';
import { Rating } from '@/lib/study';
import { useTTS } from '@/hooks/use-tts';
import { LuVolume2 } from 'react-icons/lu';
import { MarkdownContent } from '@/components/common/markdown-content';
import styles from './study-card.module.css';

interface StudyCardProps {
    card: Card;
    isRevealed: boolean;
    onReveal?: () => void;
    onGrade: (rating: Rating) => void;
    ttsEnabled?: boolean;
    ttsAutoPlay?: boolean;
    disabled?: boolean;
}

export function StudyCard({ card, isRevealed, onReveal, onGrade, ttsEnabled = true, ttsAutoPlay = false, disabled = false }: StudyCardProps) {
    const { speak, isSpeaking } = useTTS();
    const t = useTranslations('StudyCard');

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
        const threshold = 150; // Increased threshold
        const { x: dx, y: dy } = info.offset;

        // Calculate if the swipe is primarily horizontal (within 30 degrees)
        const angle = Math.abs(Math.atan2(dy, dx));
        const angleDeg = (angle * 180) / Math.PI;

        // Horizontal means it's close to 0 (right) or 180 (left)
        const isHorizontal = angleDeg < 30 || angleDeg > 150;

        if (isHorizontal && isRevealed) {
            if (dx > threshold) {
                onGrade(Rating.Good);
            } else if (dx < -threshold) {
                onGrade(Rating.Again);
            }
        }
    };

    return (
        <div className={styles.cardWrapper}>
            <motion.div
                className={styles.perspectiveContainer}
                style={{ x, rotate, touchAction: 'none' }}
                drag={isRevealed && !disabled ? "x" : false}
                dragListener={isRevealed && !disabled}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={handleDragEnd}
                onTap={() => {
                    // motion's onTap only fires if it wasn't a drag
                    if (onReveal && !disabled) onReveal();
                }}
            >
                {/* Swipe Feedback Overlays */}
                <AnimatePresence>
                    {isRevealed && x.get() < -20 && (
                        <motion.div
                            className={`${styles.swipeIndicator} ${styles.indicatorLeft}`}
                            style={{ opacity: opacityLeft }}
                        >
                            {t('forgot')}
                        </motion.div>
                    )}
                    {isRevealed && x.get() > 20 && (
                        <motion.div
                            className={`${styles.swipeIndicator} ${styles.indicatorRight}`}
                            style={{ opacity: opacityRight }}
                        >
                            {t('remember')}
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
                            <div className={styles.tag}>{t('question')}</div>
                            <div className={styles.text}>{card.front}</div>
                        </div>
                        <div className={styles.cardFooter}>
                            <span className={styles.hint}>{t('clickToReveal')}</span>
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
                            <div className={styles.tag}>{t('answer')}</div>
                            <div className={styles.text}>
                                <MarkdownContent content={card.back} />
                            </div>
                        </div>
                        <div className={styles.cardFooter}>
                            <span className={styles.hint}>{t('swipeToGrade')}</span>
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
