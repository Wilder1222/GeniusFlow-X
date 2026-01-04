/**
 * Stats Screen - 统计页面
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useStatsStore } from '../../src/stores/statsStore';
import { statsService } from '../../src/services/stats.service';
import { StudyTrendChart } from '../../src/components/stats/StudyTrendChart';
import { HeatmapCalendar } from '../../src/components/stats/HeatmapCalendar';
import { RetentionChart } from '../../src/components/stats/RetentionChart';
import { SkillRadarChart } from '../../src/components/stats/SkillRadarChart';
import { LoadingSpinner } from '../../src/components/common';
import { showMessage } from 'react-native-flash-message';

export default function StatsScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    const {
        studyStats,
        trendData,
        ratingDistribution,
        heatmapData,
        retentionData,
        skillRadarData,
        timeRange,
        loading,
        error,
        setStudyStats,
        setTrendData,
        setRatingDistribution,
        setHeatmapData,
        setRetentionData,
        setSkillRadarData,
        setTimeRange,
        setLoading,
        setError,
    } = useStatsStore();

    // 加载统计数据
    const loadStats = useCallback(async (isRefresh = false) => {
        if (!user) return;

        if (!isRefresh) setLoading(true);
        setError(null);

        try {
            const { data, error: statsError } = await statsService.getStudyStats(user.id, timeRange);

            if (statsError) {
                setError(statsError);
                showMessage({ message: statsError, type: 'danger' });
            } else if (data) {
                setStudyStats(data.studyStats);
                setTrendData(data.trendData);
                setRatingDistribution(data.ratingDistribution);
            }

            // 加载热力图数据
            const { data: heatmapResult, error: heatmapError } = await statsService.getHeatmapData(user.id);
            if (!heatmapError && heatmapResult) {
                setHeatmapData(heatmapResult);
            }

            // 加载保留率数据
            const { data: retentionResult, error: retentionError } = await statsService.getRetentionData(user.id);
            if (!retentionError && retentionResult) {
                setRetentionData(retentionResult);
            }

            // TODO: 加载能力雷达数据 (需要Web端API支持)
            // const { data: radarResult, error: radarError } = await statsService.getSkillRadarData(user.id);
            // if (!radarError && radarResult) {
            //     setSkillRadarData(radarResult);
            // }
        } catch (err) {
            const message = err instanceof Error ? err.message : '加载统计数据失败';
            setError(message);
            showMessage({ message, type: 'danger' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, timeRange]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadStats(true);
    };

    const handleTimeRangeChange = (range: '7d' | '30d' | '90d') => {
        setTimeRange(range);
    };

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="加载统计中..." />;
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={theme.colors.interactive.primary}
                />
            }
        >
            {/* 顶部统计卡片 */}
            {studyStats && (
                <View style={[styles.statsCard, { backgroundColor: theme.colors.background.secondary }]}>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.interactive.primary }]}>
                                {studyStats.totalCards}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>
                                总卡片数
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.interactive.primary }]}>
                                {studyStats.reviewedToday}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>
                                今日复习
                            </Text>
                        </View>
                    </View>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.interactive.primary }]}>
                                {studyStats.streak}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>
                                连续天数
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.interactive.primary }]}>
                                {studyStats.accuracy.toFixed(1)}%
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>
                                准确率
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* 时间范围选择器 */}
            <View style={styles.timeRangeContainer}>
                {(['7d', '30d', '90d'] as const).map((range) => (
                    <TouchableOpacity
                        key={range}
                        style={[
                            styles.timeRangeButton,
                            {
                                backgroundColor: timeRange === range
                                    ? theme.colors.interactive.primary
                                    : theme.colors.background.secondary,
                            },
                        ]}
                        onPress={() => handleTimeRangeChange(range)}
                    >
                        <Text
                            style={[
                                styles.timeRangeText,
                                {
                                    color: timeRange === range
                                        ? '#FFFFFF'
                                        : theme.colors.text.secondary,
                                },
                            ]}
                        >
                            {range === '7d' ? '7天' : range === '30d' ? '30天' : '90天'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 学习趋势图表 */}
            <StudyTrendChart
                trendData={trendData}
                ratingDistribution={ratingDistribution}
            />

            {/* 学习热力图 */}
            <HeatmapCalendar
                data={heatmapData}
                onDatePress={(date) => {
                    showMessage({
                        message: `${date} 的学习记录`,
                        type: 'info',
                    });
                }}
            />

            {/* 保留率图表 */}
            <RetentionChart data={retentionData} />

            {/* 能力雷达图 */}
            {skillRadarData.length > 0 && (
                <SkillRadarChart data={skillRadarData} />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        gap: 16,
    },
    statsCard: {
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    timeRangeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    timeRangeButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    timeRangeText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

