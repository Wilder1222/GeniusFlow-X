import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { useAuth } from '../src/contexts/AuthContext';
import { AIGeneratorModal } from '../src/components/common';
import { GeneratedCard } from '../src/services/ai.service';
import { cardService } from '../src/services/card.service';
import { deckService } from '../src/services/deck.service';
import { Deck } from '../src/types/decks';

export default function AIGenerateScreen() {
    const { theme, isDark } = useTheme();
    const { user } = useAuth();
    const params = useLocalSearchParams();
    const deckId = params.deckId as string | undefined;

    const [modalVisible, setModalVisible] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
    const [userDecks, setUserDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        loadUserDecks();
    }, [user]);

    const loadUserDecks = async () => {
        if (!user) return;
        const { data } = await deckService.getUserDecks(user.id);
        if (data) {
            setUserDecks(data);
            // 如果有预选的deck，设置为选中
            if (deckId) {
                const deck = data.find(d => d.id === deckId);
                if (deck) setSelectedDeck(deck);
            }
        }
    };

    const handleSaveCards = async (cards: GeneratedCard[]) => {
        if (!selectedDeck) {
            Alert.alert('提示', '请先选择要保存到的卡组');
            return;
        }

        setLoading(true);
        try {
            // 批量创建卡片
            const promises = cards.map(card =>
                cardService.createCard({
                    deck_id: selectedDeck.id,
                    front: card.front,
                    back: card.back,
                    state: 'new'
                })
            );

            const results = await Promise.all(promises);
            const successCount = results.filter(r => r.data).length;

            Alert.alert(
                '成功',
                `已保存 ${successCount} 张卡片到「${selectedDeck.title}」`,
                [
                    {
                        text: '查看卡组',
                        onPress: () => router.push(`/decks/${selectedDeck.id}`)
                    },
                    {
                        text: '继续生成',
                        onPress: () => setModalVisible(true)
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert('错误', error.message || '保存失败');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border.primary }]}>
                <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
                    AI 生成卡片
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Deck Selection */}
            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        选择目标卡组
                    </Text>
                    <Text style={[styles.sectionHint, { color: theme.colors.text.tertiary }]}>
                        生成的卡片将保存到选中的卡组
                    </Text>

                    <View style={styles.deckList}>
                        {userDecks.map(deck => (
                            <TouchableOpacity
                                key={deck.id}
                                style={[
                                    styles.deckItem,
                                    selectedDeck?.id === deck.id && styles.deckItemSelected,
                                    {
                                        backgroundColor: theme.colors.background.secondary,
                                        borderColor: selectedDeck?.id === deck.id
                                            ? theme.colors.interactive.primary
                                            : theme.colors.border.primary
                                    }
                                ]}
                                onPress={() => setSelectedDeck(deck)}
                            >
                                <View style={styles.deckInfo}>
                                    <Text style={[styles.deckName, { color: theme.colors.text.primary }]}>
                                        {deck.title}
                                    </Text>
                                    <Text style={[styles.deckCount, { color: theme.colors.text.tertiary }]}>
                                        {deck.card_count || 0} 张卡片
                                    </Text>
                                </View>
                                {selectedDeck?.id === deck.id && (
                                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.interactive.primary} />
                                )}
                            </TouchableOpacity>
                        ))}

                        {userDecks.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="folder-open-outline" size={48} color={theme.colors.text.tertiary} />
                                <Text style={[styles.emptyText, { color: theme.colors.text.tertiary }]}>
                                    暂无卡组，请先创建卡组
                                </Text>
                                <TouchableOpacity
                                    style={[styles.createButton, { backgroundColor: theme.colors.interactive.primary }]}
                                    onPress={() => router.push('/(tabs)/decks')}
                                >
                                    <Text style={styles.createButtonText}>创建卡组</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Start Generation Button */}
                {selectedDeck && (
                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: theme.colors.interactive.primary }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="sparkles" size={24} color="#FFF" />
                        <Text style={styles.startButtonText}>开始生成</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* AI Generator Modal */}
            <AIGeneratorModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveCards}
                deckId={selectedDeck?.id}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sectionHint: {
        fontSize: 13,
        marginBottom: 16,
    },
    deckList: {
        gap: 12,
    },
    deckItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    deckItemSelected: {
        borderWidth: 2,
    },
    deckInfo: {
        flex: 1,
    },
    deckName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    deckCount: {
        fontSize: 13,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 14,
        marginTop: 16,
        marginBottom: 20,
    },
    createButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    startButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
