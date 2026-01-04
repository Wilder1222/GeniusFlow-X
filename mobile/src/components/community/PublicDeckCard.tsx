import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../common';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Deck } from '../../types/decks';

interface PublicDeckCardProps {
    deck: Deck & {
        profiles: {
            username: string;
            avatar_url: string | null;
        };
        cards: [{ count: number }];
    };
    onPress: () => void;
    onImport: () => void;
    onAuthorPress: () => void;
    importing?: boolean;
}

export function PublicDeckCard({ deck, onPress, onImport, onAuthorPress, importing }: PublicDeckCardProps) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const cardCount = deck.cards?.[0]?.count || 0;

    return (
        <Card style={styles.container}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text.primary }]} numberOfLines={1}>
                        {deck.title}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: theme.colors.background.tertiary }]}>
                        <Text style={[styles.badgeText, { color: theme.colors.text.secondary }]}>
                            {cardCount} {t('common.cards') || 'Cards'}
                        </Text>
                    </View>
                </View>

                {deck.description && (
                    <Text style={[styles.description, { color: theme.colors.text.secondary }]} numberOfLines={2}>
                        {deck.description}
                    </Text>
                )}

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.authorSection} onPress={onAuthorPress}>
                        <View style={[styles.avatar, { backgroundColor: theme.colors.interactive.primary }]}>
                            <Text style={styles.avatarText}>
                                {deck.profiles?.username?.[0]?.toUpperCase() || '?'}
                            </Text>
                        </View>
                        <Text style={[styles.authorName, { color: theme.colors.interactive.primary }]}>
                            {deck.profiles?.username || 'Unknown'}
                        </Text>
                    </TouchableOpacity>

                    <Button
                        title={t('community.import_to_my')}
                        onPress={onImport}
                        loading={importing}
                        size="sm"
                        variant="outline"
                        style={styles.importBtn}
                    />
                </View>
            </TouchableOpacity>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    authorSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    authorName: {
        fontSize: 14,
        fontWeight: '500',
    },
    importBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
});
