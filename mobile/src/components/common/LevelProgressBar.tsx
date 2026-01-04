import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { UserLevel } from '../../services/gamification.service';

interface LevelProgressBarProps {
    userLevel: UserLevel;
    showLevelUp?: boolean;
}

export function LevelProgressBar({ userLevel, showLevelUp = false }: LevelProgressBarProps) {
    const { theme } = useTheme();
    const [displayLevel, setDisplayLevel] = useState(userLevel.currentLevel);

    // 动画值
    const scale = useSharedValue(1);
    const progressWidth = useSharedValue(0);

    useEffect(() => {
        // 进度条动画
        progressWidth.value = withSpring(userLevel.xpProgress, {
            damping: 15,
            stiffness: 100
        });

        // 升级动画
        if (showLevelUp) {
            scale.value = withSequence(
                withSpring(1.2, { damping: 10 }),
                withSpring(1, { damping: 10 })
            );
            setTimeout(() => setDisplayLevel(userLevel.currentLevel), 300);
        } else {
            setDisplayLevel(userLevel.currentLevel);
        }
    }, [userLevel, showLevelUp]);

    const animatedLevelStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const animatedProgressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`
    }));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Animated.View style={[styles.levelBadge, { backgroundColor: theme.colors.interactive.primary }, animatedLevelStyle]}>
                    <Ionicons name="trophy" size={16} color="#FFF" />
                    <Text style={styles.levelText}>Lv.{displayLevel}</Text>
                </Animated.View>
                <Text style={[styles.xpText, { color: theme.colors.text.secondary }]}>
                    {userLevel.currentXP} / {userLevel.xpForNextLevel} XP
                </Text>
            </View>

            <View style={[styles.progressBar, { backgroundColor: theme.colors.background.tertiary }]}>
                <Animated.View
                    style={[
                        styles.progressFill,
                        { backgroundColor: theme.colors.interactive.primary },
                        animatedProgressStyle
                    ]}
                />
            </View>

            <Text style={[styles.progressText, { color: theme.colors.text.tertiary }]}>
                {Math.round(userLevel.xpProgress)}% 到下一级
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    levelText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    xpText: {
        fontSize: 14,
        fontWeight: '600',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        textAlign: 'center',
    },
});
