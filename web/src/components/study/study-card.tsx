'use client';

import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '@/types/decks';
import { Rating } from '@/lib/study';
import styles from './study-card.module.css';

import { useTTS } from '@/hooks/use-tts';

interface StudyCardProps {
    card: Card;
    isRevealed: boolean;
    onReveal?: () => void;
    onGrade: (rating: Rating) => void;
    ttsEnabled?: boolean;
    ttsAutoPlay?: boolean;
}

export function StudyCard({ card, isRevealed, onReveal, onGrade, ttsEnabled = true, ttsAutoPlay = false }: StudyCardProps) {

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacityLeft = useTransform(x, [-150, -50], [1, 0]);
    const opacityRight = useTransform(x, [50, 150], [0, 1]);

    const { speak, cancel, isSpeaking } = useTTS();

    // Auto-play when card changes or is revealed
    React.useEffect(() => {
        if (!ttsEnabled || !ttsAutoPlay) return;

        // Determine what text to speak
        // If not revealed: speak front
        // If revealed: speak back (or both? Usually just the new info)

        // Strategy:
        // 1. Mount (Front): Speak Front
        // 2. Reveal (Back): Speak Back

        const textToSpeak = isRevealed ? card.back : card.front;
        // Simple clean up of HTML tags if necessary, but browser TTS usually handles text well or reads tags.
        // Ideally strip markdown/html. For now assume plain text or simple markdown.
        speak(textToSpeak);

    }, [card.id, isRevealed, ttsEnabled, ttsAutoPlay, speak, card.front, card.back]);

    // Handlers
    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation();
        const text = isRevealed ? card.back : card.front;
        speak(text);
    };


    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold && isRevealed) {
            // Swipe Right -> Good (or Easy)
            onGrade(Rating.Good);
        } else if (info.offset.x < -threshold && isRevealed) {
            // Swipe Left -> Hard (or Again)
            onGrade(Rating.Hard);
        }
        // If not revealed, maybe revealing on tap is better than dragging?
        // Dragging while hidden is confusing for grading.
    };

    const handleClick = () => {
        if (!isRevealed && onReveal) {
            onReveal();
        }
    };

    return (
        <div className={styles.cardContainer}>
            <motion.div
                className={styles.card}
                style={{ x, rotate, touchAction: 'none' }}
                drag={isRevealed ? "x" : false} // Only drag when revealed to grade
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                onClick={handleClick}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                {/* Speaker Icon */}
                {ttsEnabled && (
                    <button
                        className={styles.speakerBtn}
                        onClick={handleSpeak}
                        title="朗读"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ opacity: isSpeaking ? 0.5 : 1 }}
                        >
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    </button>
                )}

                {/* Overlays for swipe feedback */}
                {isRevealed && (
                    <>
                        <motion.div
                            className={`${styles.hintOverlay} ${styles.overlayLeft}`}
                            style={{ opacity: opacityLeft }}
                        >
                            Hard / Again
                        </motion.div>
                        <motion.div
                            className={`${styles.hintOverlay} ${styles.overlayRight}`}
                            style={{ opacity: opacityRight }}
                        >
                            Good / Easy
                        </motion.div>
                    </>
                )}

                <motion.div layout className={styles.text}>
                    {card.front}
                </motion.div>

                {isRevealed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        <div className={styles.divider} />
                        <div className={`${styles.text} ${styles.answer}`}>
                            {card.back}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
