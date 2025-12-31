/**
 * Decks Screen - 卡组页面
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    TextInput
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { deckService } from '../../src/services/deck.service';
import { Deck, CreateDeckData } from '../../src/types/decks';
import { DeckCard } from '../../src/components/deck/DeckCard';
import { CreateDeckModal } from '../../src/components/deck/CreateDeckModal';
import { LoadingSpinner } from '../../src/components/common';
import { Ionicons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';
import { SUCCESS_MESSAGES } from '../../src/config/constants';

export default function DecksScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const fetchDecks = useCallback(async (isRefresh = false) => {
        if (!user) return;

        if (!isRefresh) setLoading(true);
        const { data, error } = await deckService.getUserDecks(user.id);

        if (error) {
            showMessage({ message: error, type: 'danger' });
        } else {
            const results = data || [];
            setDecks(results);
            filterDecks(searchQuery, results);
        }

        setLoading(false);
        setRefreshing(false);
    }, [user, searchQuery]);

    useEffect(() => {
        fetchDecks();
    }, [fetchDecks]);

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
        const { error } = await deckService.createDeck(user.id, data);
        if (error) {
            throw new Error(error);
        } else {
            showMessage({ message: SUCCESS_MESSAGES.DECK_CREATED, type: 'success' });
            fetchDecks(true);
        }
    };

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="加速加载中..." />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* 顶栏搜索 */}
            <View style={styles.header}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.background.secondary }]}>
                    <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text.primary }]}
                        placeholder="搜索我的卡组..."
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
            </View>

            <FlatList
                data={filteredDecks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <DeckCard
                        deck={item}
                        onPress={() => router.push(`/decks/${item.id}`)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchDecks(true);
                        }}
                        tintColor={theme.colors.interactive.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="documents-outline" size={64} color={theme.colors.text.tertiary} />
                        <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                            {searchQuery ? '未找到相关卡组' : '还没有卡组，点击右下角创建'}
                        </Text>
                    </View>
                }
            />

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
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
