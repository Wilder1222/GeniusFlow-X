/**
 * Card Component - 通用卡片容器
 * 
 * 实现Glassmorphism（玻璃态）效果
 * 主题适配悬浮阴影和进场动画
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
    children: React.ReactNode;

    // 样式属性
    variant?: 'solid' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';

    // 动画
    animated?: boolean;
    animationDelay?: number;

    // 自定义样式
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'solid',
    padding = 'md',
    animated = false,
    animationDelay = 0,
    style,
}) => {
    const { theme, isDark } = useTheme();

    // 动画值
    const opacity = useSharedValue(animated ? 0 : 1);
    const translateY = useSharedValue(animated ? 20 : 0);

    useEffect(() => {
        if (animated) {
            // 延迟执行动画
            const timer = setTimeout(() => {
                opacity.value = withTiming(1, { duration: 500 });
                translateY.value = withSpring(0, { damping: 15 });
            }, animationDelay);

            return () => clearTimeout(timer);
        }
    }, [animated, animationDelay]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    // 根据padding获取内边距
    const getPadding = () => {
        switch (padding) {
            case 'none':
                return 0;
            case 'sm':
                return theme.spacing.sm;
            case 'md':
                return theme.spacing.md;
            case 'lg':
                return theme.spacing.lg;
            default:
                return theme.spacing.md;
        }
    };

    const cardStyles: ViewStyle = {
        borderRadius: theme.radius.lg,
        padding: getPadding(),
        overflow: 'hidden',
    };

    // 玻璃态效果
    if (variant === 'glass') {
        return (
            <Animated.View style={[styles.glassContainer, cardStyles, style, animatedStyle]}>
                <BlurView
                    intensity={isDark ? 40 : 20}
                    tint={isDark ? 'dark' : 'light'}
                    style={styles.blurView}
                >
                    <View
                        style={[
                            styles.glassContent,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(255, 255, 255, 0.7)',
                                borderColor: isDark
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(255, 255, 255, 0.3)',
                            },
                        ]}
                    >
                        {children}
                    </View>
                </BlurView>
            </Animated.View>
        );
    }

    // 实心卡片
    return (
        <Animated.View
            style={[
                cardStyles,
                {
                    backgroundColor: theme.colors.background.secondary,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                },
                style,
                animatedStyle,
            ]}
        >
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    glassContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    blurView: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    glassContent: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
    },
});
