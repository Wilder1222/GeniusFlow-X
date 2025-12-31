/**
 * Button Component - 通用按钮组件
 * 
 * 支持多种变体、尺寸和状态
 * 集成触觉反馈和主题适配
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    GestureResponderEvent,
    StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    // 基础属性
    title?: string;
    onPress: (event: GestureResponderEvent) => void;
    children?: React.ReactNode;

    // 样式属性
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;

    // 状态属性
    disabled?: boolean;
    loading?: boolean;

    // 触觉反馈
    hapticFeedback?: boolean;

    // 自定义样式
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    hapticFeedback = true,
    style,
    textStyle,
}) => {
    const { theme } = useTheme();

    const handlePress = async (event: GestureResponderEvent) => {
        if (disabled || loading) return;

        // 触觉反馈
        if (hapticFeedback) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        onPress(event);
    };

    // 根据变体获取背景色
    const getBackgroundColor = () => {
        if (disabled) return theme.colors.background.tertiary;

        switch (variant) {
            case 'primary':
                return theme.colors.interactive.primary;
            case 'secondary':
                return theme.colors.interactive.secondary;
            case 'outline':
            case 'ghost':
                return 'transparent';
            default:
                return theme.colors.interactive.primary;
        }
    };

    // 根据变体获取文字颜色
    const getTextColor = () => {
        if (disabled) return theme.colors.text.tertiary;

        switch (variant) {
            case 'primary':
            case 'secondary':
                return theme.colors.text.inverse;
            case 'outline':
                return theme.colors.interactive.primary;
            case 'ghost':
                return theme.colors.text.primary;
            default:
                return theme.colors.text.inverse;
        }
    };

    // 根据尺寸获取内边距
    const getPadding = () => {
        switch (size) {
            case 'sm':
                return { paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.md };
            case 'md':
                return { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg };
            case 'lg':
                return { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl };
            default:
                return { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg };
        }
    };

    // 根据尺寸获取字体大小
    const getFontSize = () => {
        switch (size) {
            case 'sm':
                return 14;
            case 'md':
                return 16;
            case 'lg':
                return 18;
            default:
                return 16;
        }
    };

    const buttonStyles: ViewStyle = {
        backgroundColor: getBackgroundColor(),
        borderRadius: theme.radius.md,
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: variant === 'outline' ? theme.colors.border.accent : 'transparent',
        opacity: disabled ? 0.5 : 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: fullWidth ? '100%' : 'auto',
        ...getPadding(),
    };

    const textStyles: TextStyle = {
        color: getTextColor(),
        fontSize: getFontSize(),
        fontWeight: '600',
        textAlign: 'center',
    };

    return (
        <TouchableOpacity
            style={[buttonStyles, style]}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : children ? (
                children
            ) : (
                <Text style={[textStyles, textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};
