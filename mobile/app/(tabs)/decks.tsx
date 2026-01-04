/**
 * Decks Screen - 卡组页面
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    TextInput
} from 'react-native';
import { FlashList } from '@shopify/flash-list';

const AnyFlashList = FlashList as any;
import { router } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { deckService } from '../../src/services/deck.service';
import { Deck, CreateDeckData } from '../../src/types/decks';
import { DeckCard } from '../../src/components/deck/DeckCard';
import { CreateDeckModal } from '../../src/components/deck/CreateDeckModal';
import { ImportModal } from '../../src/components/deck/ImportModal';
import { LoadingSpinner } from '../../src/components/common';
import { useDeckStore } from '../../src/stores/deckStore';
import { Ionicons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';
import { SUCCESS_MESSAGES } from '../../src/config/constants';
import { useTranslation } from 'react-i18next';

export default function DecksScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { decks, fetchDecks, loading, error: storeError } = useDeckStore();
    const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);

    const loadDecks = useCallback(async (force = false) => {
        if (!user) return;
        if (force) setRefreshing(true);
        await fetchDecks(user.id, force);
        setRefreshing(false);
    }, [user, fetchDecks]);

    useEffect(() => {
        loadDecks();
    }, [loadDecks]);

    useEffect(() => {
        filterDecks(searchQuery, decks);
    }, [decks, searchQuery]);

    useEffect(() => {
        if (storeError) {
            showMessage({ message: storeError, type: 'danger' });
        }
    }, [storeError]);

    const filterDecks = (query: string, allDecks: Deck[] = decks) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredDecks(allDecks);
            return;
        }

        const filtered = allDecks.filter(deck =>
            deck.title.toLowerCase().includes(query.toLowerCase()) ||
            deck.description?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredDecks(filtered);
    };

    const handleCreateDeck = async (data: CreateDeckData) => {
        if (!user) return;
        const { data: newDeck, error } = await deckService.createDeck(user.id, data);
        if (error) {
            throw new Error(error);
        } else {
            showMessage({ message: SUCCESS_MESSAGES.DECK_CREATED, type: 'success' });
            if (newDeck) useDeckStore.getState().addDeck(newDeck);
        }
    };

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text={t('common.loading')} />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* 顶栏搜索 */}
            <View style={styles.header}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.background.secondary }]}>
                    <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text.primary }]}
                        placeholder={t('decks.search_placeholder')}
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={searchQuery}
                        onChangeText={filterDecks}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => filterDecks('')}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.importIconBtn, { backgroundColor: theme.colors.background.secondary }]}
                    onPress={() => router.push('/discover')}
                >
                    <Ionicons name="planet-outline" size={22} color={theme.colors.interactive.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.importIconBtn, { backgroundColor: theme.colors.background.secondary }]}
                    onPress={() => setImportModalVisible(true)}
                >
                    <Ionicons name="cloud-download-outline" size={22} color={theme.colors.interactive.primary} />
                </TouchableOpacity>
            </View>

            {AnyFlashList && (
                <AnyFlashList
                    data={filteredDecks}
                    keyExtractor={(item: Deck) => item.id}
                    estimatedItemSize={100}
                    renderItem={({ item }: { item: Deck }) => (
                        <DeckCard
                            deck={item}
                            onPress={() => router.push(`/decks/${item.id}`)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadDecks(true)}
                            tintColor={theme.colors.interactive.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="documents-outline" size={64} color={theme.colors.text.tertiary} />
                            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                                {searchQuery ? t('decks.not_found') : t('decks.empty')}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* 悬浮创建按钮 */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.interactive.primary }]}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <CreateDeckModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleCreateDeck}
            />

            <ImportModal
                visible={importModalVisible}
                onClose={() => setImportModalVisible(false)}
                onSuccess={() => loadDecks(true)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    importIconBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
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
    },
    listContent: {
        padding: 16,
        paddingBottom: 100, // 为FAB留出空间
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
});
