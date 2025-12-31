/**
 * Input Component - 通用输入组件
 * 
 * 支持单行/多行文本输入
 * 集成错误状态显示和主题适配
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TextInputProps,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends TextInputProps {
    // 标签
    label?: string;

    // 错误信息
    error?: string;

    // 多行文本
    multiline?: boolean;
    numberOfLines?: number;

    // 自定义样式
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    multiline = false,
    numberOfLines = 1,
    containerStyle,
    inputStyle,
    ...textInputProps
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const containerStyles: ViewStyle = {
        marginBottom: theme.spacing.md,
    };

    const labelStyles: TextStyle = {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    };

    const inputContainerStyles: ViewStyle = {
        borderWidth: 1,
        borderColor: error
            ? theme.colors.status.error
            : isFocused
                ? theme.colors.border.accent
                : theme.colors.border.primary,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.background.secondary,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: multiline ? theme.spacing.md : theme.spacing.sm,
    };

    const inputTextStyles: TextStyle = {
        fontSize: 16,
        color: theme.colors.text.primary,
        minHeight: multiline ? numberOfLines * 20 : undefined,
    };

    const errorStyles: TextStyle = {
        fontSize: 12,
        color: theme.colors.status.error,
        marginTop: theme.spacing.xs,
    };

    return (
        <View style={[containerStyles, containerStyle]}>
            {label && <Text style={labelStyles}>{label}</Text>}

            <View style={inputContainerStyles}>
                <TextInput
                    style={[inputTextStyles, inputStyle]}
                    placeholderTextColor={theme.colors.text.tertiary}
                    multiline={multiline}
                    numberOfLines={multiline ? numberOfLines : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...textInputProps}
                />
            </View>

            {error && <Text style={errorStyles}>{error}</Text>}
        </View>
    );
};
