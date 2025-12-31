import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { Card, LoadingSpinner } from '../../src/components/common';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { deckService } from '../../src/services/deck.service';
import { Deck } from '../../src/types/decks';
import { DeckCard } from '../../src/components/deck/DeckCard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function HomeScreen() {
    const { theme, isDark } = useTheme();
    const { profile, user } = useAuth();
    const [recentDecks, setRecentDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!user) return;
        setRefreshing(true);
        const { data } = await deckService.getUserDecks(user.id);
        if (data) {
            setRecentDecks(data.slice(0, 3));
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor={theme.colors.interactive.primary} />
            }
        >
            {/* 顶部欢迎 Banner */}
            <LinearGradient
                colors={isDark ? ['#6366f1', '#a855f7'] : ['#4f46e5', '#9333ea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
            >
                <View>
                    <Text style={styles.welcomeText}>欢迎回来,</Text>
                    <Text style={styles.userName}>{profile?.username || '学习者'} 👋</Text>
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Ionicons name="notifications-outline" size={24} color="#FFF" />
                </TouchableOpacity>
            </LinearGradient>

            {/* 今日目标概览 */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>今日概览</Text>
                    <TouchableOpacity>
                        <Text style={{ color: theme.colors.interactive.primary }}>查看详情</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsGrid}>
                    <Card style={styles.statCard}>
                        <Ionicons name="flame" size={24} color="#f97316" />
                        <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                            {profile?.current_streak || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>连续学习</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                        <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>0</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>今日复习</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Ionicons name="time" size={24} color="#3b82f6" />
                        <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>0</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>专注分钟</Text>
                    </Card>
                </View>
            </View>

            {/* AI 生成卡片快捷入口 */}
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/decks')}>
                <LinearGradient
                    colors={['#ef4444', '#f97316']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.aiEntry}
                >
                    <View style={styles.aiContent}>
                        <View style={styles.aiTextContainer}>
                            <Text style={styles.aiTitle}>AI 智能生成卡片</Text>
                            <Text style={styles.aiDesc}>上传文件或输入文本，快速生成记忆卡片</Text>
                        </View>
                        <View style={styles.aiIconContainer}>
                            <Ionicons name="sparkles" size={32} color="#FFF" />
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            {/* 最近使用卡组 */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>最近使用</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/decks')}>
                        <Text style={{ color: theme.colors.interactive.primary }}>查看全部</Text>
                    </TouchableOpacity>
                </View>

                {recentDecks.length > 0 ? (
                    recentDecks.map(deck => (
                        <DeckCard
                            key={deck.id}
                            deck={deck}
                            onPress={() => router.push(`/decks/${deck.id}`)}
                        />
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <Text style={{ color: theme.colors.text.tertiary }}>暂无使用的卡组</Text>
                    </Card>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 32,
    },
    banner: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    welcomeText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
    },
    userName: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 4,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 0.31,
        padding: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    aiEntry: {
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 20,
        padding: 20,
        shadowColor: 'orange',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    aiContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    aiTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    aiTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    aiDesc: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 4,
    },
    aiIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCard: {
        padding: 40,
        alignItems: 'center',
    },
});
