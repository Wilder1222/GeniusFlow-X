/**
 * Study Screen - 学习页面
 * 
 * 核心复习界面，处理卡片切换、评分和算法更新
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { cardService } from '../../src/services/card.service';
import { Card } from '../../src/types/decks';
import { Rating } from 'ts-fsrs';
import { StudyCard } from '../../src/components/study/StudyCard';
import { FocusTimer } from '../../src/components/study/FocusTimer';
import { Button, LoadingSpinner } from '../../src/components/common';
import { studyService, SessionResult } from '../../src/services/study.service';
import { gamificationService } from '../../src/services/gamification.service';
import { syncService } from '../../src/services/sync.service';
import { useCardStore } from '../../src/stores/cardStore';
import { Ionicons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function StudyScreen() {
    const { deckId } = useLocalSearchParams<{ deckId: string }>();
    const { theme, isDark } = useTheme();

    const { cardsByDeck, fetchCards, gradeCardOffline, loading: storeLoading } = useCardStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);

    // 统计数据
    const [stats, setStats] = useState({
        correct: 0,
        incorrect: 0,
        totalTimeMs: 0
    });
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);

    // 加载待复习卡片并开始会话
    useEffect(() => {
        const initStudy = async () => {
            if (!deckId) return;
            setLoading(true);

            // 离线优先：先从 Store 获取
            await fetchCards(deckId);

            // 开始会话
            const sid = await studyService.startSession(deckId);
            setSessionId(sid);
            setLoading(false);
        };
        initStudy();
    }, [deckId, fetchCards]);

    const cards = cardsByDeck[deckId || ''] || [];

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleGrade = async (rating: Rating) => {
        const currentCard = cards[currentIndex];
        if (!currentCard) return;

        // 1. 更新本地统计
        const isCorrect = rating >= Rating.Good;
        setStats(prev => ({
            ...prev,
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        }));

        // 2. 离线评分 (更新本地状态并加入同步队列)
        try {
            await gradeCardOffline(currentCard, rating);
        } catch (error) {
            showMessage({ message: '本地评分保存失败', type: 'danger' });
            return;
        }

        // 3. 移动到下一张或结束
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        // 如果是最后一张，上面的 handleGrade 已经更新了 stats
        const result = await studyService.completeSession(
            stats.correct,
            stats.incorrect,
            sessionId || undefined,
            stats.totalTimeMs
        );

        if (result) {
            setSessionResult(result);
        }
        setIsFinished(true);
        setLoading(false);
    };

    if (loading && !isFinished) return <LoadingSpinner fullScreen text="准备卡片中..." />;

    if (cards.length === 0 || isFinished) {
        return (
            <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background.primary }]}>
                <Ionicons name="checkmark-circle" size={80} color={theme.colors.interactive.primary} />
                <Text style={[styles.finishTitle, { color: theme.colors.text.primary }]}>学习完成！</Text>

                {sessionResult && (
                    <View style={styles.resultContainer}>
                        <View style={styles.resultRow}>
                            <Text style={[styles.resultLabel, { color: theme.colors.text.secondary }]}>获得经验</Text>
                            <Text style={[styles.resultValue, { color: theme.colors.interactive.primary }]}>+{sessionResult.xpGained} XP</Text>
                        </View>
                        {sessionResult.achievements.unlocked.length > 0 && (
                            <View style={styles.resultRow}>
                                <Text style={[styles.resultLabel, { color: theme.colors.text.secondary }]}>解锁成就</Text>
                                <Text style={[styles.resultValue, { color: '#FFB300' }]}>{sessionResult.achievements.unlocked.length} 个新成就!</Text>
                            </View>
                        )}
                    </View>
                )}

                <Text style={[styles.finishSub, { color: theme.colors.text.secondary }]}>您已完成本次所有复习任务</Text>
                <Button
                    title="确定"
                    onPress={() => router.back()}
                    style={{ marginTop: 32, width: 200 }}
                />
            </SafeAreaView>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* 顶部状态 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color={theme.colors.text.primary} />
                </TouchableOpacity>

                <FocusTimer onTick={(sec) => setStats(prev => ({ ...prev, totalTimeMs: sec * 1000 }))} />

                <View style={styles.headerRight}>
                    <View style={[styles.progressBadge, { backgroundColor: theme.colors.background.tertiary, marginRight: 8 }]}>
                        <Text style={{ color: theme.colors.text.secondary, fontSize: 12 }}>
                            {currentIndex + 1} / {cards.length}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => {/* 设置 */ }}>
                        <Ionicons name="settings-outline" size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 卡片展示区 */}
            <View style={styles.cardArea}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleFlip}
                    style={styles.cardTouchable}
                >
                    <StudyCard
                        card={currentCard}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                    />
                </TouchableOpacity>
            </View>

            {/* 底部操作区 */}
            <View style={styles.footer}>
                {!isFlipped ? (
                    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.hintContainer}>
                        <Text style={[styles.hintText, { color: theme.colors.text.tertiary }]}>点击卡片翻转</Text>
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeIn} style={styles.gradeButtons}>
                        <GradeButton
                            label="错误"
                            sub="Again"
                            color="#FF5252"
                            onPress={() => handleGrade(Rating.Again)}
                        />
                        <GradeButton
                            label="困难"
                            sub="Hard"
                            color="#FFB300"
                            onPress={() => handleGrade(Rating.Hard)}
                        />
                        <GradeButton
                            label="良好"
                            sub="Good"
                            color="#4CAF50"
                            onPress={() => handleGrade(Rating.Good)}
                        />
                        <GradeButton
                            label="简单"
                            sub="Easy"
                            color="#2196F3"
                            onPress={() => handleGrade(Rating.Easy)}
                        />
                    </Animated.View>
                )}
            </View>
        </SafeAreaView>
    );
}

// 评分按钮小组件
const GradeButton = ({ label, sub, color, onPress }: any) => {
    return (
        <TouchableOpacity
            style={[styles.gradeBtn, { backgroundColor: color + '15', borderColor: color }]}
            onPress={onPress}
        >
            <Text style={[styles.gradeLabel, { color }]}>{label}</Text>
            <Text style={[styles.gradeSub, { color }]}>{sub}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    cardArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    cardTouchable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        height: 120,
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    hintContainer: {
        alignItems: 'center',
    },
    hintText: {
        fontSize: 16,
    },
    gradeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    gradeBtn: {
        flex: 1,
        height: 70,
        marginHorizontal: 4,
        borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradeLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    gradeSub: {
        fontSize: 10,
        marginTop: 2,
        opacity: 0.8,
    },
    finishTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 24,
    },
    finishSub: {
        fontSize: 16,
        marginTop: 8,
    },
    resultContainer: {
        marginTop: 24,
        padding: 20,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.03)',
        width: '80%',
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    resultLabel: {
        fontSize: 16,
    },
    resultValue: {
        fontSize: 18,
        fontWeight: '700',
    }
});
