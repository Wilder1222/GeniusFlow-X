import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { useTheme } from '../../contexts/ThemeContext';
import { Achievement, UserAchievement } from '../../services/achievement.service';

interface AchievementCardProps {
    achievement: Achievement;
    userAchievement?: UserAchievement;
    progress?: number; // 0-100
    isUnlocked?: boolean;
}

export function AchievementCard({ achievement, userAchievement, progress = 0, isUnlocked = false }: AchievementCardProps) {
    const { theme } = useTheme();
    const unlocked = isUnlocked || !!userAchievement;

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'study': return '#3b82f6';
            case 'streak': return '#f97316';
            case 'cards': return '#22c55e';
            case 'social': return '#a855f7';
            default: return theme.colors.interactive.primary;
        }
    };

    const categoryColor = getCategoryColor(achievement.category);

    return (
        <Card style={[styles.container, !unlocked && styles.locked] as any}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: unlocked ? categoryColor : theme.colors.background.tertiary }]}>
                    <Text style={styles.icon}>{achievement.icon}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.name, { color: unlocked ? theme.colors.text.primary : theme.colors.text.tertiary }]}>
                        {achievement.name}
                    </Text>
                    <Text style={[styles.description, { color: theme.colors.text.tertiary }]}>
                        {achievement.description}
                    </Text>
                </View>
                {unlocked && (
                    <Ionicons name="checkmark-circle" size={24} color={categoryColor} />
                )}
            </View>

            {!unlocked && progress > 0 && (
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: theme.colors.background.tertiary }]}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${progress}%`, backgroundColor: categoryColor }
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressText, { color: theme.colors.text.tertiary }]}>
                        {Math.round(progress)}%
                    </Text>
                </View>
            )}

            <View style={styles.footer}>
                <View style={styles.reward}>
                    <Ionicons name="star" size={14} color={theme.colors.status.warning} />
                    <Text style={[styles.xp, { color: theme.colors.text.secondary }]}>
                        +{achievement.xp_reward} XP
                    </Text>
                </View>
                {unlocked && userAchievement && (
                    <Text style={[styles.unlockedDate, { color: theme.colors.text.tertiary }]}>
                        {new Date(userAchievement.unlocked_at).toLocaleDateString('zh-CN')}
                    </Text>
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 12,
    },
    locked: {
        opacity: 0.6,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 24,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    description: {
        fontSize: 13,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginRight: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        width: 40,
        textAlign: 'right',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reward: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    xp: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 4,
    },
    unlockedDate: {
        fontSize: 12,
    },
});
