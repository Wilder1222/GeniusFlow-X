'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/types/decks';
import { Rating } from '@/lib/study';
import { getSettings } from '@/lib/settings';
import { apiClient } from '@/lib/api-client';
import { StudyCard } from './study-card';
import styles from './study-interface.module.css';

interface StudyInterfaceProps {
    cards: Card[];
    onGrade: (cardId: string, rating: Rating) => Promise<void>;
}

export function StudyInterface({ cards, onGrade }: StudyInterfaceProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [finished, setFinished] = useState(false);
    const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
    const [xpResult, setXpResult] = useState<any>(null);
    const [ttsSettings, setTtsSettings] = useState({ enabled: true, autoPlay: false });

    useEffect(() => {
        // Fetch user settings for TTS
        async function fetchSettings() {
            try {
                const settings = await getSettings();
                if (settings) {
                    setTtsSettings({
                        enabled: settings.ttsEnabled,
                        autoPlay: settings.ttsAutoPlay
                    });
                }
            } catch (e) {
                console.warn('Failed to fetch settings, using defaults', e);
            }
        }
        fetchSettings();
    }, []);

    useEffect(() => {
        if (cards.length > 0 && currentIndex >= cards.length && !finished) {
            setFinished(true);
            // Award XP on completion
            completeSession();
        }
    }, [currentIndex, cards.length, finished]);

    const completeSession = async () => {
        try {
            const data = await apiClient.post('/api/study/complete', {
                correctCount: stats.correct,
                incorrectCount: stats.incorrect
            });

            if (data.success) {
                setXpResult(data.data);
            }
        } catch (error) {
            console.error('Failed to complete session:', error);
        }
    };

    if (cards.length === 0 || finished) {
        return (
            <div className={styles.emptyState}>
                <h2>🎉 全部完成！</h2>
                <p>今天没有待复习的卡片了。</p>
                {xpResult && (
                    <>
                        <div className={styles.xpReward}>
                            <p className={styles.xpGained}>+{xpResult.xpGained} XP</p>
                            {xpResult.leveledUp && (
                                <p className={styles.levelUp}>🎊 Level Up! 现在是 Level {xpResult.newLevel}!</p>
                            )}
                            <p className={styles.xpTotal}>总 XP: {xpResult.newXP}</p>
                        </div>

                        {xpResult.achievements && xpResult.achievements.unlocked.length > 0 && (
                            <div className={styles.achievementsUnlocked}>
                                <h3>🏆 解锁成就！</h3>
                                {xpResult.achievements.unlocked.map((achievement: any, index: number) => (
                                    <div key={index} className={styles.achievementItem}>
                                        <span className={styles.achievementName}>{achievement.name}</span>
                                        <span className={styles.achievementXP}>+{achievement.xpReward} XP</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    const handleReveal = () => setIsRevealed(true);

    const handleGrade = async (rating: Rating) => {
        // Track statistics (Good/Easy = correct, Again/Hard = incorrect)
        if (rating === Rating.Good || rating === Rating.Easy) {
            setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        } else {
            setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
        }

        await onGrade(currentCard.id, rating);
        // Move to next card
        setIsRevealed(false);
        setCurrentIndex(prev => prev + 1);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span>待复习: {cards.length - currentIndex}</span>
                <span className={styles.stats}>
                    ✅ {stats.correct} | ❌ {stats.incorrect}
                </span>
            </div>



            <div className={styles.cardArea}>
                <StudyCard
                    card={currentCard}
                    isRevealed={isRevealed}
                    onReveal={handleReveal}
                    onGrade={handleGrade}
                    ttsEnabled={ttsSettings.enabled}
                    ttsAutoPlay={ttsSettings.autoPlay}
                />
            </div>

            <div className={styles.controls}>
                {!isRevealed ? (
                    <button className={styles.revealBtn} onClick={handleReveal}>
                        显示答案
                    </button>
                ) : (
                    <>
                        <button className={`${styles.gradeBtn} ${styles.again}`} onClick={() => handleGrade(Rating.Again)}>
                            忘记 (Again)
                        </button>
                        <button className={`${styles.gradeBtn} ${styles.hard}`} onClick={() => handleGrade(Rating.Hard)}>
                            困难 (Hard)
                        </button>
                        <button className={`${styles.gradeBtn} ${styles.good}`} onClick={() => handleGrade(Rating.Good)}>
                            一般 (Good)
                        </button>
                        <button className={`${styles.gradeBtn} ${styles.easy}`} onClick={() => handleGrade(Rating.Easy)}>
                            简单 (Easy)
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
