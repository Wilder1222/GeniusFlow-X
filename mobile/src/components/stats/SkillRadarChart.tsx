/**
 * 能力雷达图组件
 * 使用react-native-svg自定义实现
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import type { SkillRadarData } from '../../types/stats';

interface SkillRadarChartProps {
    data: SkillRadarData[];
}

const { width } = Dimensions.get('window');
const CHART_SIZE = Math.min(width - 64, 300);
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = CENTER - 40;

export function SkillRadarChart({ data }: SkillRadarChartProps) {
    const { theme } = useTheme();

    // 计算雷达图的点坐标
    const radarPoints = useMemo(() => {
        if (data.length === 0) return { points: '', labels: [] };

        const angleStep = (2 * Math.PI) / data.length;
        const points: string[] = [];
        const labels: Array<{ x: number; y: number; text: string }> = [];

        data.forEach((item, index) => {
            const angle = angleStep * index - Math.PI / 2; // 从顶部开始
            const ratio = item.value / item.maxValue;
            const radius = MAX_RADIUS * ratio;

            const x = CENTER + radius * Math.cos(angle);
            const y = CENTER + radius * Math.sin(angle);
            points.push(`${x},${y}`);

            // 标签位置(在最外圈外面)
            const labelRadius = MAX_RADIUS + 25;
            const labelX = CENTER + labelRadius * Math.cos(angle);
            const labelY = CENTER + labelRadius * Math.sin(angle);
            labels.push({ x: labelX, y: labelY, text: item.skill });
        });

        return {
            points: points.join(' '),
            labels,
        };
    }, [data]);

    // 生成背景网格线
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const angleStep = (2 * Math.PI) / (data.length || 5);

    if (data.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background.secondary }]}>
                <Text style={[styles.emptyText, { color: theme.colors.text.tertiary }]}>
                    暂无能力数据
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                能力雷达图
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.tertiary }]}>
                多维度学习能力评估
            </Text>

            <View style={styles.chartContainer}>
                <Svg width={CHART_SIZE} height={CHART_SIZE}>
                    {/* 背景网格 */}
                    <G>
                        {gridLevels.map((level, index) => {
                            const points: string[] = [];
                            for (let i = 0; i < data.length; i++) {
                                const angle = angleStep * i - Math.PI / 2;
                                const radius = MAX_RADIUS * level;
                                const x = CENTER + radius * Math.cos(angle);
                                const y = CENTER + radius * Math.sin(angle);
                                points.push(`${x},${y}`);
                            }
                            return (
                                <Polygon
                                    key={`grid-${index}`}
                                    points={points.join(' ')}
                                    fill="none"
                                    stroke={theme.colors.border.secondary}
                                    strokeWidth="1"
                                    opacity={0.3}
                                />
                            );
                        })}

                        {/* 从中心到各个顶点的线 */}
                        {data.map((_, index) => {
                            const angle = angleStep * index - Math.PI / 2;
                            const x = CENTER + MAX_RADIUS * Math.cos(angle);
                            const y = CENTER + MAX_RADIUS * Math.sin(angle);
                            return (
                                <Line
                                    key={`axis-${index}`}
                                    x1={CENTER}
                                    y1={CENTER}
                                    x2={x}
                                    y2={y}
                                    stroke={theme.colors.border.secondary}
                                    strokeWidth="1"
                                    opacity={0.3}
                                />
                            );
                        })}
                    </G>

                    {/* 数据多边形 */}
                    <Polygon
                        points={radarPoints.points}
                        fill={theme.colors.interactive.primary}
                        fillOpacity={0.3}
                        stroke={theme.colors.interactive.primary}
                        strokeWidth="2"
                    />

                    {/* 数据点 */}
                    {radarPoints.points.split(' ').map((point, index) => {
                        const [x, y] = point.split(',').map(Number);
                        return (
                            <Circle
                                key={`point-${index}`}
                                cx={x}
                                cy={y}
                                r="4"
                                fill={theme.colors.interactive.primary}
                            />
                        );
                    })}

                    {/* 标签 */}
                    {radarPoints.labels.map((label, index) => (
                        <SvgText
                            key={`label-${index}`}
                            x={label.x}
                            y={label.y}
                            fill={theme.colors.text.secondary}
                            fontSize="12"
                            fontWeight="500"
                            textAnchor="middle"
                        >
                            {label.text}
                        </SvgText>
                    ))}
                </Svg>
            </View>

            {/* 数值说明 */}
            <View style={styles.valuesContainer}>
                {data.map((item, index) => (
                    <View key={index} style={styles.valueItem}>
                        <Text style={[styles.valueLabel, { color: theme.colors.text.secondary }]}>
                            {item.skill}:
                        </Text>
                        <Text style={[styles.valueText, { color: theme.colors.text.primary }]}>
                            {item.value}/{item.maxValue}
                        </Text>
                    </View>
                ))}
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
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
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
    valuesContainer: {
        marginTop: 16,
        gap: 8,
    },
    valueItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueLabel: {
        fontSize: 14,
    },
    valueText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
