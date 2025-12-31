/**
 * Settings Screen - 设置页面
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { Card, Button } from '../src/components/common';
import { useTheme } from '../src/contexts/ThemeContext';
import { useAuth } from '../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const { theme, themeMode, setThemeMode } = useTheme();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        router.replace('/auth/login');
    };

    const themes = [
        { id: 'light', label: '浅色模式', icon: 'sunny-outline' },
        { id: 'dark', label: '深色模式', icon: 'moon-outline' },
        { id: 'classic-dark', label: '经典深色', icon: 'contrast-outline' },
        { id: 'system', label: '跟随系统', icon: 'settings-outline' },
    ] as const;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
            contentContainerStyle={styles.content}
        >
            <View style={styles.header}>
                <Button
                    title=""
                    onPress={() => router.back()}
                    variant="ghost"
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
                </Button>
                <Text style={[styles.title, { color: theme.colors.text.primary }]}>设置</Text>
            </View>

            {/* 主题设置 */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary }]}>外观</Text>
            <Card style={styles.card}>
                {themes.map((t, index) => (
                    <Button
                        key={t.id}
                        title={t.label}
                        onPress={() => setThemeMode(t.id)}
                        variant="ghost"
                        style={[
                            styles.itemButton,
                            index < themes.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border.primary }
                        ]}
                    >
                        <View style={styles.itemContent}>
                            <View style={styles.itemLeft}>
                                <Ionicons name={t.icon as any} size={20} color={theme.colors.text.secondary} />
                                <Text style={[styles.itemLabel, { color: theme.colors.text.primary }]}>{t.label}</Text>
                            </View>
                            {themeMode === t.id && (
                                <Ionicons name="checkmark" size={20} color={theme.colors.interactive.primary} />
                            )}
                        </View>
                    </Button>
                ))}
            </Card>

            {/* 学习设置 */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary }]}>学习</Text>
            <Card style={styles.card}>
                <View style={styles.itemContent}>
                    <View style={styles.itemLeft}>
                        <Ionicons name="notifications-outline" size={20} color={theme.colors.text.secondary} />
                        <Text style={[styles.itemLabel, { color: theme.colors.text.primary }]}>每日复习提醒</Text>
                    </View>
                    <Switch
                        trackColor={{ false: theme.colors.border.primary, true: theme.colors.interactive.primary }}
                        thumbColor="#f4f3f4"
                        value={true}
                    />
                </View>
                <View style={[styles.itemContent, { marginTop: 16 }]}>
                    <View style={styles.itemLeft}>
                        <Ionicons name="volume-medium-outline" size={20} color={theme.colors.text.secondary} />
                        <Text style={[styles.itemLabel, { color: theme.colors.text.primary }]}>自动播放TTS</Text>
                    </View>
                    <Switch
                        trackColor={{ false: theme.colors.border.primary, true: theme.colors.interactive.primary }}
                        thumbColor="#f4f3f4"
                        value={false}
                    />
                </View>
            </Card>

            {/* 关于 */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary }]}>关于</Text>
            <Card style={styles.card}>
                <View style={styles.itemContent}>
                    <View style={styles.itemLeft}>
                        <Ionicons name="information-circle-outline" size={20} color={theme.colors.text.secondary} />
                        <Text style={[styles.itemLabel, { color: theme.colors.text.primary }]}>版本号</Text>
                    </View>
                    <Text style={{ color: theme.colors.text.tertiary }}>1.0.0</Text>
                </View>
            </Card>

            <Button
                title="退出登录"
                onPress={handleLogout}
                variant="outline"
                style={{ marginTop: 32, marginBottom: 40 }}
            />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        padding: 0,
        marginRight: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
        marginTop: 16,
    },
    card: {
        padding: 0,
        overflow: 'hidden',
    },
    itemButton: {
        borderRadius: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        width: '100%',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 16,
        marginLeft: 12,
    },
});
