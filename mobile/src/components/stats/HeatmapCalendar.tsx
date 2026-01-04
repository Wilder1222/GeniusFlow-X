/**
 * 学习热力图组件
 * 类似GitHub的贡献热力图
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import type { HeatmapData } from '../../types/stats';

interface HeatmapCalendarProps {
    data: HeatmapData[];
    onDatePress?: (date: string) => void;
}

export function HeatmapCalendar({ data, onDatePress }: HeatmapCalendarProps) {
    const { theme } = useTheme();

    // 获取颜色
    const getColor = (level: number) => {
        const colors = [
            theme.colors.background.tertiary,
            '#9BE9A8',
            '#40C463',
            '#30A14E',
            '#216E39',
        ];
        return colors[level] || colors[0];
    };

    // 按周分组数据
    const weeks = useMemo(() => {
        const result: HeatmapData[][] = [];
        let currentWeek: HeatmapData[] = [];

        data.forEach((item, index) => {
            currentWeek.push(item);
            if (currentWeek.length === 7 || index === data.length - 1) {
                result.push([...currentWeek]);
                currentWeek = [];
            }
        });

        return result;
    }, [data]);

    if (data.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background.secondary }]}>
                <Text style={[styles.emptyText, { color: theme.colors.text.tertiary }]}>
                    暂无热力图数据
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                学习热力图
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.heatmapContainer}>
                    {weeks.map((week, weekIndex) => (
                        <View key={weekIndex} style={styles.week}>
                            {week.map((day) => (
                                <TouchableOpacity
                                    key={day.date}
                                    style={[
                                        styles.day,
                                        { backgroundColor: getColor(day.level) },
                                    ]}
                                    onPress={() => onDatePress?.(day.date)}
                                    activeOpacity={0.7}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
            <View style={styles.legend}>
                <Text style={[styles.legendText, { color: theme.colors.text.tertiary }]}>少</Text>
                {[0, 1, 2, 3, 4].map((level) => (
                    <View
                        key={level}
                        style={[styles.legendBox, { backgroundColor: getColor(level) }]}
                    />
                ))}
                <Text style={[styles.legendText, { color: theme.colors.text.tertiary }]}>多</Text>
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
        marginBottom: 12,
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
    heatmapContainer: {
        flexDirection: 'row',
        gap: 3,
    },
    week: {
        gap: 3,
    },
    day: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        marginTop: 12,
    },
    legendBox: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 12,
    },
});
