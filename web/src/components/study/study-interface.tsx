'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/types/decks';
import { Rating } from '@/lib/study';
import { getSettings } from '@/lib/settings';
import { apiClient } from '@/lib/api-client';
import { StudyCard } from './study-card';
import { useGamification } from '@/lib/contexts/gamification-context';
import { CheckCircle, X, ChevronLeft, Zap, Trophy, Loader2 } from 'lucide-react';
import styles from './study-interface.module.css';

interface StudyInterfaceProps {
    cards: Card[];
    onGrade: (cardId: string, rating: Rating) => Promise<void>;
}

export function StudyInterface({ cards, onGrade }: StudyInterfaceProps) {
    const { refreshLevelInfo, awardXPLocally } = useGamification();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [finished, setFinished] = useState(false);
    const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
    const [xpResult, setXpResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [ttsSettings, setTtsSettings] = useState({ enabled: true, autoPlay: false });
    const t = useTranslations('Study');

    useEffect(() => {
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
                // Refresh global gamification state
                refreshLevelInfo();
            }
        } catch (error) {
            console.error('Failed to complete session:', error);
        }
    };

    if (cards.length === 0 || finished) {
        return (
            <div className={styles.finishContainer}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={styles.finishCard}
                >
                    <div className={styles.finishIcon}><CheckCircle /></div>
                    <h2 className={styles.finishTitle}>{t('completed')}</h2>
                    <p className={styles.finishSubtitle}>{t('todayProgress')}</p>

                    {xpResult && (
                        <div className={styles.xpSection}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className={styles.xpGained}
                            >
                                <Zap className={styles.zapIcon} />
                                <span>{t('xpGained', { amount: xpResult.xpGained })}</span>
                            </motion.div>

                            {xpResult.leveledUp && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={styles.levelUpBadge}
                                >
                                    <Trophy /> {t('levelUp', { level: xpResult.newLevel })}
                                </motion.div>
                            )}
                        </div>
                    )}

                    <button
                        className={styles.backBtn}
                        onClick={() => window.location.href = '/home'}
                    >
                        {t('backHome')}
                    </button>
                </motion.div>

                <AnimatePresence>
                    {xpResult?.achievements?.unlocked?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.achievementSection}
                        >
                            <h3 className={styles.sectionTitle}>{t('newAchievements')}</h3>
                            <div className={styles.achievementGrid}>
                                {xpResult.achievements.unlocked.map((a: any, i: number) => (
                                    <div key={i} className={styles.achievementCard}>
                                        <div className={styles.aIcon}>{a.icon || '✨'}</div>
                                        <div className={styles.aInfo}>
                                            <div className={styles.aName}>{a.name}</div>
                                            <div className={styles.aXp}>+{a.xpReward} XP</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    // Safety check: if currentCard is undefined (race condition when finishing), show loading or return early
    if (!currentCard) {
        return (
            <div className={styles.finishContainer}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={styles.finishCard}
                >
                    <div className={styles.finishIcon}><CheckCircle /></div>
                    <h2 className={styles.finishTitle}>{t('completed')}</h2>
                </motion.div>
            </div>
        );
    }

    const progress = ((currentIndex) / cards.length) * 100;

    const toggleReveal = () => setIsRevealed(prev => !prev);

    const handleGrade = async (rating: Rating) => {
        if (isLoading) return;
        setIsLoading(true);

        const isCorrect = rating === Rating.Good || rating === Rating.Easy;
        const xpAmount = isCorrect ? 10 : 5;

        // 1. Immediate UI update (XP is local-first for satisfying feel)
        awardXPLocally(xpAmount);

        try {
            // 2. Persistent backend updates
            await Promise.all([
                apiClient.post('/api/gamification/xp', {
                    amount: xpAmount,
                    reason: isCorrect ? 'review_correct' : 'review_incorrect',
                    metadata: { cardId: currentCard.id, rating }
                }),
                onGrade(currentCard.id, rating)
            ]);

            if (isCorrect) {
                setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
            } else {
                setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
            }

            setIsRevealed(false);
            setCurrentIndex(prev => prev + 1);
        } catch (err) {
            console.error('Failed to sync state:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const gradeButtons = [
        { label: t('again'), sub: 'Again', rating: Rating.Again, color: '#ef4444', class: styles.again },
        { label: t('hard'), sub: 'Hard', rating: Rating.Hard, color: '#f59e0b', class: styles.hard },
        { label: t('good'), sub: 'Good', rating: Rating.Good, color: '#3b82f6', class: styles.good },
        { label: t('easy'), sub: 'Easy', rating: Rating.Easy, color: '#10b981', class: styles.easy },
    ];

    return (
        <div className={styles.studyWrapper}>
            <div className={styles.glassWrapper}>
                <div className={styles.studyHeader}>
                    <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                            <span className={styles.label}>{t('progress')}</span>
                            <span className={styles.stats}>
                                <CheckCircle size={18} /> {stats.correct} &nbsp;
                                <X size={18} /> {stats.incorrect}
                            </span>
                        </div>
                        <div className={styles.progressBar}>
                            <motion.div
                                className={styles.progressFill}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className={styles.remaining}>
                            {t('remaining', { count: cards.length - currentIndex })}
                        </div>
                    </div>
                </div>

                <div className={styles.cardContainer}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentCard.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={styles.cardMotion}
                        >
                            <StudyCard
                                card={currentCard}
                                isRevealed={isRevealed}
                                onReveal={toggleReveal}
                                onGrade={handleGrade}
                                ttsEnabled={ttsSettings.enabled}
                                ttsAutoPlay={ttsSettings.autoPlay}
                                disabled={isLoading}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {isLoading && (
                        <div className={styles.loadingOverlay}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={styles.loadingContent}
                            >
                                <Loader2 className={styles.spinner} size={40} />
                                <span className={styles.loadingText}>{t('syncing')}</span>
                            </motion.div>
                        </div>
                    )}
                </div>

                <div className={styles.actionContainer}>
                    {!isRevealed ? (
                        <motion.button
                            className={styles.revealAction}
                            onClick={toggleReveal}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {t('showAnswer')}
                        </motion.button>
                    ) : (
                        <div className={styles.gradeGrid}>
                            {gradeButtons.map((btn, i) => (
                                <motion.button
                                    key={i}
                                    className={`${styles.gradeBtn} ${btn.class} ${isLoading ? styles.disabled : ''}`}
                                    onClick={() => handleGrade(btn.rating)}
                                    disabled={isLoading}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={isLoading ? {} : { y: -5 }}
                                    whileTap={isLoading ? {} : { scale: 0.95 }}
                                >
                                    <span className={styles.btnLabel}>{btn.label}</span>
                                    <span className={styles.btnDesc}>{btn.sub}</span>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
