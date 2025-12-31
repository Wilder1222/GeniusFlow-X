/**
 * LoadingSpinner Component - 加载指示器
 * 
 * 品牌化加载动画
 * 支持不同尺寸和颜色
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type LoadingSize = 'small' | 'large';

interface LoadingSpinnerProps {
    // 尺寸
    size?: LoadingSize;

    // 文本
    text?: string;

    // 颜色（覆盖主题色）
    color?: string;

    // 全屏显示
    fullScreen?: boolean;

    // 自定义样式
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'large',
    text,
    color,
    fullScreen = false,
    containerStyle,
    textStyle,
}) => {
    const { theme } = useTheme();

    const spinnerColor = color || theme.colors.interactive.primary;

    const containerStyles: ViewStyle = fullScreen
        ? {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: theme.colors.background.primary,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
        }
        : {
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.lg,
        };

    const textStyles: TextStyle = {
        marginTop: theme.spacing.md,
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    };

    return (
        <View style={[containerStyles, containerStyle]}>
            <ActivityIndicator size={size} color={spinnerColor} />
            {text && <Text style={[textStyles, textStyle]}>{text}</Text>}
        </View>
    );
};
