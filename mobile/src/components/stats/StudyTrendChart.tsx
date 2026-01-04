/**
 * 学习趋势图表组件
 * 显示7天/30天的学习趋势和评分分布
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemeContext';
import type { StudyTrendData, RatingDistribution } from '../../types/stats';

interface StudyTrendChartProps {
    trendData: StudyTrendData[];
    ratingDistribution: RatingDistribution[];
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;

export function StudyTrendChart({ trendData, ratingDistribution }: StudyTrendChartProps) {
    const { theme } = useTheme();

    // 准备折线图数据
    const lineChartData = useMemo(() => {
        const labels = trendData.map(item =>
            new Date(item.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
        );
        const data = trendData.map(item => item.reviewed);

        return {
            labels,
            datasets: [
                {
                    data,
                    color: (opacity = 1) => theme.colors.interactive.primary,
                    strokeWidth: 3,
                },
            ],
        };
    }, [trendData, theme]);

    // 准备饼图数据
    const pieChartData = useMemo(() => {
        const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
        return ratingDistribution.map((item, index) => ({
            name: item.label,
            population: item.count,
            color: colors[item.rating - 1],
            legendFontColor: theme.colors.text.secondary,
            legendFontSize: 12,
        }));
    }, [ratingDistribution, theme]);

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
            r: '4',
            strokeWidth: '2',
            stroke: theme.colors.interactive.primary,
        },
    };

    if (trendData.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background.secondary }]}>
                <Text style={[styles.emptyText, { color: theme.colors.text.tertiary }]}>
                    暂无学习数据
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 学习趋势折线图 */}
            <View style={[styles.chartCard, { backgroundColor: theme.colors.background.secondary }]}>
                <Text style={[styles.chartTitle, { color: theme.colors.text.primary }]}>
                    学习趋势
                </Text>
                <LineChart
                    data={lineChartData}
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
                />
            </View>

            {/* 评分分布饼图 */}
            {ratingDistribution.length > 0 && (
                <View style={[styles.chartCard, { backgroundColor: theme.colors.background.secondary }]}>
                    <Text style={[styles.chartTitle, { color: theme.colors.text.primary }]}>
                        评分分布
                    </Text>
                    <PieChart
                        data={pieChartData}
                        width={CHART_WIDTH - 32}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        center={[10, 0]}
                        absolute
                    />
                    <View style={styles.legendContainer}>
                        {ratingDistribution.map((item, index) => (
                            <View key={item.rating} style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: pieChartData[index].color }]} />
                                <Text style={[styles.legendText, { color: theme.colors.text.secondary }]}>
                                    {item.label}: {item.percentage.toFixed(1)}%
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    chartCard: {
        borderRadius: 12,
        padding: 16,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
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
