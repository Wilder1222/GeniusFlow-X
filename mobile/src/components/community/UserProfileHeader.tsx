import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { PublicProfile } from '../../services/community.service';

interface UserProfileHeaderProps {
    profile: PublicProfile;
}

export function UserProfileHeader({ profile }: UserProfileHeaderProps) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.interactive.primary }]}>
                <Text style={styles.avatarText}>
                    {profile.username[0].toUpperCase()}
                </Text>
            </View>

            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={[styles.username, { color: theme.colors.text.primary }]}>
                        {profile.username}
                    </Text>
                    <View style={[styles.levelBadge, { backgroundColor: theme.colors.interactive.primary }]}>
                        <Text style={styles.levelText}>Lv.{profile.level}</Text>
                    </View>
                </View>

                {profile.bio && (
                    <Text style={[styles.bio, { color: theme.colors.text.secondary }]}>
                        {profile.bio}
                    </Text>
                )}

                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                            {profile.membership_tier === 'pro' ? 'Pro' : 'Free'}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>
                            {t('profile.membership')}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                            {profile.xp}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>
                            {t('achievements.xp')}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    info: {
        alignItems: 'center',
        width: '100%',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 8,
    },
    levelBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    levelText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    bio: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
});
