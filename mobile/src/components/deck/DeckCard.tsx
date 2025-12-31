/**
 * DeckCard Component - 卡组卡片组件
 * 
 * 显示卡组概览信息，支持点击进入详情
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Deck } from '../../types/decks';
import { Card } from '../common';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

interface DeckCardProps {
    deck: Deck;
    onPress: () => void;
    onLongPress?: () => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({
    deck,
    onPress,
    onLongPress,
}) => {
    const { theme, isDark } = useTheme();

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <Card style={styles.cardContainer}>
                <LinearGradient
                    colors={isDark
                        ? ['rgba(255,255,255,0.05)', 'transparent']
                        : ['rgba(0,0,0,0.02)', 'transparent']
                    }
                    style={styles.gradient}
                >
                    <View style={styles.header}>
                        <Text
                            style={[styles.title, { color: theme.colors.text.primary }]}
                            numberOfLines={1}
                        >
                            {deck.title}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: theme.colors.background.tertiary }]}>
                            <Ionicons
                                name={deck.is_public ? 'globe-outline' : 'lock-closed-outline'}
                                size={12}
                                color={theme.colors.text.tertiary}
                            />
                        </View>
                    </View>

                    {deck.description ? (
                        <Text
                            style={[styles.description, { color: theme.colors.text.secondary }]}
                            numberOfLines={2}
                        >
                            {deck.description}
                        </Text>
                    ) : null}

                    <View style={styles.footer}>
                        <View style={styles.stats}>
                            <View style={styles.statItem}>
                                <Ionicons name="copy-outline" size={14} color={theme.colors.interactive.primary} />
                                <Text style={[styles.statText, { color: theme.colors.text.primary }]}>
                                    {deck.card_count || 0}
                                </Text>
                            </View>

                            {deck.tags && deck.tags.length > 0 && (
                                <View style={styles.tagList}>
                                    {deck.tags.slice(0, 1).map((tag, index) => (
                                        <View
                                            key={index}
                                            style={[styles.tag, { borderColor: theme.colors.border.secondary }]}
                                        >
                                            <Text style={[styles.tagText, { color: theme.colors.text.tertiary }]}>
                                                {tag}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={[styles.goButton, { backgroundColor: theme.colors.interactive.primary }]}>
                            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                        </View>
                    </View>
                </LinearGradient>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: 16,
    },
    gradient: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 12,
    },
    badge: {
        padding: 6,
        borderRadius: 8,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 20,
        opacity: 0.8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: 'rgba(0,0,0,0.03)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    tagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        marginRight: 8,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '500',
    },
    goButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOpacity: 0.2,
        elevation: 2,
    },
});
