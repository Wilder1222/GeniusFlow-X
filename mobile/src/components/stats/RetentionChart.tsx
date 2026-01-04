/**
 * 保留率图表组件
 * 显示卡片记忆保留率和遗忘曲线
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemeContext';
import type { RetentionData } from '../../types/stats';

interface RetentionChartProps {
    data: RetentionData[];
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;

export function RetentionChart({ data }: RetentionChartProps) {
    const { theme } = useTheme();

    // 按评分分组数据
    const chartData = useMemo(() => {
        if (data.length === 0) return null;

        // 获取所有唯一的时间间隔作为标签
        const intervals = [...new Set(data.map(item => item.interval))];

        // 按评分分组
        const ratingGroups = {
            1: data.filter(item => item.rating === 1),
            2: data.filter(item => item.rating === 2),
            3: data.filter(item => item.rating === 3),
            4: data.filter(item => item.rating === 4),
        };

        const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
        const labels = ['重学', '困难', '良好', '简单'];

        // 创建数据集
        const datasets = Object.entries(ratingGroups)
            .filter(([_, items]) => items.length > 0)
            .map(([rating, items], index) => ({
                data: intervals.map(interval => {
                    const item = items.find(i => i.interval === interval);
                    return item ? item.retention : 0;
                }),
                color: (opacity = 1) => colors[parseInt(rating) - 1],
                strokeWidth: 2,
            }));

        return {
            labels: intervals.map(interval => {
                // 简化标签显示
                if (interval.includes('天')) {
                    return interval.replace('天', 'd');
                }
                return interval;
            }),
            datasets,
            legend: labels.filter((_, index) => ratingGroups[(index + 1) as 1 | 2 | 3 | 4].length > 0),
        };
    }, [data]);

    const chartConfig = {
        backgroundColor: theme.colors.background.secondary,
        backgroundGradientFrom: theme.colors.background.secondary,
        backgroundGradientTo: theme.colors.background.secondary,
        decimalPlaces: 0,
        color: (opacity = 1) => theme.colors.text.primary,
        labelColor: (opacity = 1) => theme.colors.text.tertiary,
        style: {
            borderRadius: 12,
        },
        propsForDots: {
            r: '3',
            strokeWidth: '1',
        },
    };

    if (!chartData || data.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background.secondary }]}>
                <Text style={[styles.emptyText, { color: theme.colors.text.tertiary }]}>
                    暂无保留率数据
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                记忆保留率
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.tertiary }]}>
                不同评分的卡片保留率对比
            </Text>

            <LineChart
                data={chartData}
                width={CHART_WIDTH - 32}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines
                withOuterLines
                withVerticalLabels
                withHorizontalLabels
                withDots
                withShadow={false}
                yAxisSuffix="%"
            />

            {/* 图例 */}
            <View style={styles.legendContainer}>
                {chartData.legend.map((label, index) => {
                    const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
                    const activeColors = chartData.datasets.map((_, i) => colors[i]);

                    return (
                        <View key={label} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: activeColors[index] }]} />
                            <Text style={[styles.legendText, { color: theme.colors.text.secondary }]}>
                                {label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 12,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 12,
    },
    emptyContainer: {
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
    },
});
