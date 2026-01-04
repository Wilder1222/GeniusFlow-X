import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { AchievementCard, LevelProgressBar, Card } from '../src/components/common';
import { achievementService, AchievementProgress } from '../src/services/achievement.service';
import { gamificationService, UserLevel } from '../src/services/gamification.service';

export default function AchievementsScreen() {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [progress, setProgress] = useState<AchievementProgress[]>([]);
    const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked'>('all');

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const [progData, levelData] = await Promise.all([
                achievementService.getAllAchievementsWithProgress(),
                gamificationService.getUserLevel()
            ]);
            setProgress(progData);
            setUserLevel(levelData);
        } catch (error) {
            console.error('Failed to fetch achievements data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredProgress = progress.filter(p => {
        if (activeTab === 'unlocked') return p.is_unlocked;
        if (activeTab === 'locked') return !p.is_unlocked;
        return true;
    });

    const unlockedCount = progress.filter(p => p.is_unlocked).length;

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border.primary }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
                    成就与等级
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor={theme.colors.interactive.primary} />
                }
            >
                {/* Level Summary */}
                {userLevel && (
                    <Card style={styles.levelCard}>
                        <LevelProgressBar userLevel={userLevel} />
                    </Card>
                )}

                {/* Stats Summary */}
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <Text style={[styles.statValue, { color: theme.colors.interactive.primary }]}>
                            {unlockedCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>已解锁</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                            {progress.length}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>总成就</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Text style={[styles.statValue, { color: theme.colors.status.warning }]}>
                            {userLevel?.totalXP || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>总 XP</Text>
                    </Card>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    {(['all', 'unlocked', 'locked'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && { borderBottomColor: theme.colors.interactive.primary }
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: activeTab === tab ? theme.colors.interactive.primary : theme.colors.text.tertiary }
                            ]}>
                                {tab === 'all' ? '全部' : tab === 'unlocked' ? '已解锁' : '未解锁'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Achievement List */}
                <View style={styles.list}>
                    {filteredProgress.length > 0 ? (
                        filteredProgress.map((p) => (
                            <AchievementCard
                                key={p.achievement.id}
                                achievement={p.achievement}
                                isUnlocked={p.is_unlocked}
                                progress={p.progress_percentage}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={{ color: theme.colors.text.tertiary }}>
                                {activeTab === 'unlocked' ? '还没有解锁任何成就' : '暂无成就'}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    levelCard: {
        marginBottom: 16,
        padding: 0,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 0.31,
        alignItems: 'center',
        padding: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        paddingBottom: 32,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
});
