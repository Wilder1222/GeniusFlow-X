/**
 * Tabs Layout - Tab导航布局
 * 
 * 配置底部Tab导航
 */

import { Tabs } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
    const { theme, isDark } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.interactive.primary,
                tabBarInactiveTintColor: theme.colors.text.tertiary,
                tabBarStyle: {
                    backgroundColor: theme.colors.background.primary,
                    borderTopColor: theme.colors.border.primary,
                    borderTopWidth: 1,
                    elevation: 0,
                    shadowOpacity: 0,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: '首页',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="decks"
                options={{
                    title: '卡组',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="albums" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: '统计',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: '我的',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
