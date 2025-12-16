'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import styles from './history.module.css';

interface ReviewLog {
    id: string;
    rating: number;
    review_time: string;
    scheduled_days: number;
    elapsed_days: number;
    state: string;
}

interface CardInfo {
    id: string;
    front: string;
    back: string;
}

export default function CardHistoryPage() {
    const params = useParams();
    const cardId = params.id as string;
    const [card, setCard] = useState<CardInfo | null>(null);
    const [logs, setLogs] = useState<ReviewLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (cardId) {
            loadData();
        }
    }, [cardId]);

    const loadData = async () => {
        try {
            // Load card info
            const cardResult = await apiClient.get<{ success: boolean; data: CardInfo }>(`/api/cards/${cardId}`);
            if (cardResult.success) {
                setCard(cardResult.data);
            }

            // Load review logs
            const logsResult = await apiClient.get<{ success: boolean; data: ReviewLog[] }>(`/api/cards/${cardId}/history`);
            if (logsResult.success) {
                setLogs(logsResult.data);
            }
        } catch (error) {
            console.error('Failed to load card history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRatingLabel = (rating: number) => {
        const labels: Record<number, { text: string; color: string; emoji: string }> = {
            1: { text: 'Again', color: '#f44336', emoji: '😓' },
            2: { text: 'Hard', color: '#ff9800', emoji: '😐' },
            3: { text: 'Good', color: '#4caf50', emoji: '😊' },
            4: { text: 'Easy', color: '#2196f3', emoji: '🎉' }
        };
        return labels[rating] || { text: 'Unknown', color: '#999', emoji: '❓' };
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>加载中...</div>
            </div>
        );
    }

    // Calculate statistics
    const totalReviews = logs.length;
    const correctReviews = logs.filter(l => l.rating >= 3).length;
    const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;
    const avgInterval = totalReviews > 0
        ? Math.round(logs.reduce((sum, l) => sum + l.scheduled_days, 0) / totalReviews)
        : 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>📊 复习历史</h1>
                <a href={`/cards/${cardId}`} className={styles.backLink}>← 返回卡片</a>
            </div>

            {card && (
                <div className={styles.cardPreview}>
                    <div className={styles.cardFront}>{card.front}</div>
                    <div className={styles.cardBack}>{card.back}</div>
                </div>
            )}

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{totalReviews}</span>
                    <span className={styles.statLabel}>总复习次数</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{accuracy}%</span>
                    <span className={styles.statLabel}>正确率</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{avgInterval}天</span>
                    <span className={styles.statLabel}>平均间隔</span>
                </div>
            </div>

            <div className={styles.timeline}>
                <h2 className={styles.sectionTitle}>复习时间轴</h2>
                {logs.length === 0 ? (
                    <div className={styles.emptyState}>暂无复习记录</div>
                ) : (
                    <div className={styles.timelineList}>
                        {logs.map((log, index) => {
                            const rating = getRatingLabel(log.rating);
                            return (
                                <div key={log.id} className={styles.timelineItem}>
                                    <div className={styles.timelineDot} style={{ background: rating.color }} />
                                    {index < logs.length - 1 && <div className={styles.timelineLine} />}

                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineHeader}>
                                            <span className={styles.ratingBadge} style={{ background: rating.color }}>
                                                {rating.emoji} {rating.text}
                                            </span>
                                            <span className={styles.timelineDate}>{formatDate(log.review_time)}</span>
                                        </div>
                                        <div className={styles.timelineDetails}>
                                            <span>间隔: {log.scheduled_days}天</span>
                                            <span>状态: {log.state}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
