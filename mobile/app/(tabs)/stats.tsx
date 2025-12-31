/**
 * Stats Screen - 统计页面
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function StatsScreen() {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <Text style={[styles.text, { color: theme.colors.text.primary }]}>
                学习统计 (开发中)
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
    },
});
