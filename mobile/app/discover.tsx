import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { communityService } from '../src/services/community.service';
import { PublicDeckCard } from '../src/components/community/PublicDeckCard';
import { Ionicons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';

export default function DiscoverScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [decks, setDecks] = useState<any[]>([]);
    const [importingDeckId, setImportingDeckId] = useState<string | null>(null);

    const loadDecks = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const result = await communityService.getPublicDecks({
                search: search || undefined,
                pageSize: 20
            });
            setDecks(result.decks);
        } catch (error) {
            console.error('Failed to load public decks:', error);
            showMessage({
                message: t('common.error'),
                description: t('community.load_error') || 'Failed to load community content',
                type: 'danger',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadDecks();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadDecks(true);
    };

    const handleImport = async (deckId: string) => {
        setImportingDeckId(deckId);
        try {
            await communityService.forkDeck(deckId);
            showMessage({
                message: t('community.fork_success'),
                type: 'success',
            });
        } catch (error) {
            console.error('Import deck error:', error);
            showMessage({
                message: t('community.fork_error'),
                type: 'danger',
            });
        } finally {
            setImportingDeckId(null);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <Stack.Screen
                options={{
                    title: t('community.title'),
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: theme.colors.background.primary },
                }}
            />

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.background.tertiary }]}>
                    <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text.primary }]}
                        placeholder={t('community.search')}
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <Ionicons
                            name="close-circle"
                            size={20}
                            color={theme.colors.text.tertiary}
                            onPress={() => setSearch('')}
                        />
                    )}
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
                </View>
            ) : (
                <FlatList
                    data={decks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PublicDeckCard
                            deck={item}
                            onPress={() => { }}
                            onAuthorPress={() => router.push(`/user/${item.user_id}`)}
                            onImport={() => handleImport(item.id)}
                            importing={importingDeckId === item.id}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="planet-outline" size={64} color={theme.colors.text.tertiary} />
                            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                                {t('decks.empty')}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        padding: 0,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
});
