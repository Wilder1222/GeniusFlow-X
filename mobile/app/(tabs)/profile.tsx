/**
 * Profile Screen - 个人中心页面
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Card, Button } from '../../src/components/common';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ProfileScreen() {
    const { theme, themeMode, setThemeMode } = useTheme();
    const { profile, user, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        router.replace('/auth/login');
    };

    const cycleTheme = async () => {
        const themes = ['light', 'dark', 'classic-dark', 'system'] as const;
        const currentIndex = themes.indexOf(themeMode);
        const nextIndex = (currentIndex + 1) % themes.length;
        await setThemeMode(themes[nextIndex]);
    };

    const getThemeLabel = () => {
        switch (themeMode) {
            case 'light':
                return '浅色';
            case 'dark':
                return '深色';
            case 'classic-dark':
                return '经典深色';
            case 'system':
                return '跟随系统';
            default:
                return '未知';
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
            contentContainerStyle={styles.content}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                    个人中心
                </Text>
                <Button
                    title=""
                    onPress={() => router.push('/settings')}
                    variant="ghost"
                    style={styles.settingsButton}
                >
                    <Ionicons name="settings-outline" size={24} color={theme.colors.text.primary} />
                </Button>
            </View>

            {/* 用户基本信息 */}
            <Card style={{ marginVertical: theme.spacing.md }}>
                <View style={styles.profileHeader}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.interactive.primary }]}>
                        <Text style={styles.avatarText}>
                            {(profile?.username || user?.email || '?')[0].toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.username, { color: theme.colors.text.primary }]}>
                            {profile?.username || '未设置用户名'}
                        </Text>
                        <Text style={[styles.email, { color: theme.colors.text.tertiary }]}>
                            {user?.email}
                        </Text>
                    </View>
                </View>
                {profile?.bio && (
                    <Text style={[styles.bio, { color: theme.colors.text.secondary }]}>
                        {profile.bio}
                    </Text>
                )}
            </Card>

            {/* 会员与AI额度 */}
            <Card style={{ marginVertical: theme.spacing.md }}>
                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
                        会员类型
                    </Text>
                    <Text style={[styles.value, { color: theme.colors.interactive.primary, fontWeight: 'bold' }]}>
                        {profile?.membership_type === 'pro' ? '💎 Pro' : '🆓 Free'}
                    </Text>
                </View>
                <View style={styles.usageContainer}>
                    <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
                        今日AI生成额度
                    </Text>
                    <Text style={[styles.value, { color: theme.colors.text.primary }]}>
                        {profile?.ai_generation_count ?? 0} / {profile?.membership_type === 'pro' ? '∞' : '10'}
                    </Text>
                </View>
            </Card>

            <Card style={{ marginVertical: theme.spacing.md }}>
                <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
                    外观设置
                </Text>
                <Button
                    title={`主题: ${getThemeLabel()}`}
                    onPress={cycleTheme}
                    variant="outline"
                    style={{ marginTop: theme.spacing.sm }}
                />
            </Card>

            <Card style={{ marginVertical: theme.spacing.md }}>
                <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
                    账号管理
                </Text>
                <Button
                    title="退出登录"
                    onPress={handleLogout}
                    variant="outline"
                    style={{ marginTop: theme.spacing.sm }}
                />
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    settingsButton: {
        width: 40,
        height: 40,
        padding: 0,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileInfo: {
        marginLeft: 16,
        flex: 1,
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
    },
    bio: {
        fontSize: 15,
        lineHeight: 20,
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    usageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    value: {
        fontSize: 16,
    },
});
