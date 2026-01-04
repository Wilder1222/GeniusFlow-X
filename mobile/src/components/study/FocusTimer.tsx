import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface FocusTimerProps {
    onTick?: (seconds: number) => void;
    isActive?: boolean;
}

export function FocusTimer({ onTick, isActive = true }: FocusTimerProps) {
    const { theme } = useTheme();
    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => {
                    const next = prev + 1;
                    if (onTick) onTick(next);
                    return next;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, onTick]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.tertiary }]}>
            <Ionicons name="timer-outline" size={16} color={theme.colors.text.secondary} style={styles.icon} />
            <Text style={[styles.timeText, { color: theme.colors.text.secondary }]}>
                {formatTime(seconds)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    icon: {
        marginRight: 4,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'monospace',
    },
});
