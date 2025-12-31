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
import { Button, LoadingSpinner } from '../../src/components/common';
import { Ionicons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function StudyScreen() {
    const { deckId } = useLocalSearchParams<{ deckId: string }>();
    const { theme, isDark } = useTheme();

    const [cards, setCards] = useState<Card[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);

    // 加载待复习卡片
    useEffect(() => {
        const loadCards = async () => {
            setLoading(true);
            const { data, error } = await cardService.getDueCards(deckId);
            if (error) {
                showMessage({ message: error, type: 'danger' });
            } else {
                setCards(data || []);
            }
            setLoading(false);
        };
        loadCards();
    }, [deckId]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleGrade = async (rating: Rating) => {
        const currentCard = cards[currentIndex];
        if (!currentCard) return;

        // 乐观更新 UI
        // 这里只是简单的移动到下一张，实际上可以根据评分决定是否回炉

        // 1. 调用服务更新状态
        const { error } = await cardService.gradeCard(currentCard, rating);
        if (error) {
            showMessage({ message: '评分同步失败', type: 'warning' });
        }

        // 2. 移动到下一张或结束
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            setIsFinished(true);
        }
    };

    if (loading) return <LoadingSpinner fullScreen text="准备卡片中..." />;

    if (cards.length === 0 || isFinished) {
        return (
            <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background.primary }]}>
                <Ionicons name="checkmark-circle" size={80} color={theme.colors.interactive.primary} />
                <Text style={[styles.finishTitle, { color: theme.colors.text.primary }]}>学习完成！</Text>
                <Text style={[styles.finishSub, { color: theme.colors.text.secondary }]}>您已完成本次所有复习任务</Text>
                <Button
                    title="返回"
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
                <View style={[styles.progressBadge, { backgroundColor: theme.colors.background.tertiary }]}>
                    <Text style={{ color: theme.colors.text.secondary, fontSize: 12 }}>
                        {currentIndex + 1} / {cards.length}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => {/* 设置 */ }}>
                    <Ionicons name="settings-outline" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
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
    }
});
