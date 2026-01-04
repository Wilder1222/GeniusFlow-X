import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { communityService, PublicProfile } from '../../src/services/community.service';
import { UserProfileHeader } from '../../src/components/community/UserProfileHeader';
import { PublicDeckCard } from '../../src/components/community/PublicDeckCard';
import { showMessage } from 'react-native-flash-message';

export default function UserProfileScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [decks, setDecks] = useState<any[]>([]);
    const [importingDeckId, setImportingDeckId] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            loadAll();
        }
    }, [userId]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [profileData, decksData] = await Promise.all([
                communityService.getUserProfile(userId),
                communityService.getUserPublicDecks(userId)
            ]);
            setProfile(profileData);
            setDecks(decksData);
        } catch (error) {
            console.error('Failed to load profile:', error);
            showMessage({
                message: t('common.error'),
                description: t('community.load_error') || 'Failed to load user profile',
                type: 'danger',
            });
            router.back();
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background.primary }]}>
                <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <Stack.Screen
                options={{
                    title: profile?.username || t('community.user_profile'),
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: theme.colors.background.primary },
                }}
            />

            <FlatList
                data={decks}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={profile ? <UserProfileHeader profile={profile} /> : null}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <PublicDeckCard
                            deck={item}
                            onPress={() => { }}
                            onAuthorPress={() => { }} // Already on author's profile
                            onImport={() => handleImport(item.id)}
                            importing={importingDeckId === item.id}
                        />
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                ListHeaderComponentStyle={styles.headerSpacer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 24,
    },
    cardWrapper: {
        paddingHorizontal: 16,
    },
    headerSpacer: {
        marginBottom: 16,
    },
});
