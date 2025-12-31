/**
 * DeckDetail Screen - 卡组详情页面
 * 
 * 展示卡组信息和包含的卡片列表
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { deckService } from '../../src/services/deck.service';
import { cardService } from '../../src/services/card.service';
import { Deck, Card } from '../../src/types/decks';
import { Button, LoadingSpinner, Card as UI_Card } from '../../src/components/common';
import { Ionicons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';

export default function DeckDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (!id) return;

        if (!isRefresh) setLoading(true);
        try {
            const [deckRes, cardsRes] = await Promise.all([
                deckService.getDeckById(id),
                cardService.getCardsByDeckId(id)
            ]);

            if (deckRes.error) throw new Error(deckRes.error);
            if (cardsRes.error) throw new Error(cardsRes.error);

            setDeck(deckRes.data);
            setCards(cardsRes.data || []);
        } catch (error: any) {
            showMessage({ message: error.message, type: 'danger' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStudy = () => {
        if (!deck) return;
        router.push({
            pathname: '/study/[deckId]',
            params: { deckId: deck.id }
        });
    };

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="正在加载卡组..." />;
    }

    if (!deck) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background.primary }]}>
                <Text style={{ color: theme.colors.text.secondary }}>未找到该卡组</Text>
                <Button
                    title="返回列表"
                    onPress={() => router.back()}
                    variant="ghost"
                    style={{ marginTop: 16 }}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* 顶栏 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => {/* 编辑卡组 */ }}>
                        <Ionicons name="create-outline" size={24} color={theme.colors.text.primary} style={{ marginRight: 16 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {/* 更多设置 */ }}>
                        <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* 卡组概览 */}
                <UI_Card style={styles.deckOverview}>
                    <Text style={[styles.deckTitle, { color: theme.colors.text.primary }]}>{deck.title}</Text>
                    {deck.description && (
                        <Text style={[styles.deckDesc, { color: theme.colors.text.secondary }]}>{deck.description}</Text>
                    )}

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{deck.card_count || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>卡片总数</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: theme.colors.interactive.primary }]}>0</Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>待复习</Text>
                        </View>
                    </View>

                    <Button
                        title="开始学习"
                        onPress={handleStudy}
                        fullWidth
                        size="lg"
                        style={{ marginTop: 24 }}
                    />
                </UI_Card>

                {/* 卡片列表 */}
                <View style={styles.cardsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        卡片列表 ({deck.card_count || 0})
                    </Text>

                    {cards.length === 0 ? (
                        <View style={styles.emptyCards}>
                            <Ionicons name="albums-outline" size={48} color={theme.colors.text.tertiary} />
                            <Text style={{ color: theme.colors.text.tertiary, marginTop: 12 }}>暂无卡片</Text>
                            <Button
                                title="添加第一张卡片"
                                onPress={() => {/* 添加卡片 */ }}
                                variant="outline"
                                style={{ marginTop: 16 }}
                            />
                        </View>
                    ) : (
                        cards.map((card) => (
                            <UI_Card key={card.id} style={styles.cardItem}>
                                <View style={styles.cardInfo}>
                                    <Text style={[styles.cardFront, { color: theme.colors.text.primary }]} numberOfLines={1}>
                                        {card.front}
                                    </Text>
                                    <View style={[
                                        styles.stateBadge,
                                        { backgroundColor: getStateColor(card.state, theme) + '20' }
                                    ]}>
                                        <Text style={[styles.stateText, { color: getStateColor(card.state, theme) }]}>
                                            {card.state.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            </UI_Card>
                        ))
                    )}
                </View>
            </ScrollView>
        </View >
    );
}

// 辅助函数
const getStateColor = (state: string, theme: any) => {
    switch (state) {
        case 'new': return theme.colors.interactive.primary;
        case 'learning': return '#FFB300';
        case 'review': return '#4CAF50';
        case 'relearning': return '#FF5252';
        default: return theme.colors.text.tertiary;
    }
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
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
    },
    deckOverview: {
        padding: 20,
        marginBottom: 24,
    },
    deckTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    deckDesc: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    cardsSection: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    emptyCards: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    cardItem: {
        padding: 16,
        marginBottom: 12,
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardFront: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginRight: 12,
    },
    stateBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    stateText: {
        fontSize: 10,
        fontWeight: 'bold',
    }
});
