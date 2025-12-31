/**
 * StudyCard Component - 学习卡片（支持 3D 翻转）
 * 
 * 使用 Reanimated 实现高性能的 3D 翻转动画
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate
} from 'react-native-reanimated';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../types/decks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface StudyCardProps {
    card: Card;
    isFlipped: boolean;
    onFlip: () => void;
}

export const StudyCard: React.FC<StudyCardProps> = ({
    card,
    isFlipped,
    onFlip,
}) => {
    const { theme, isDark } = useTheme();

    // 旋转角度 (0 - 180)
    const rotateY = useSharedValue(0);

    React.useEffect(() => {
        rotateY.value = withSpring(isFlipped ? 180 : 0, {
            damping: 15,
            stiffness: 90,
        });
    }, [isFlipped]);

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotateY.value, [0, 180], [0, 180]);
        return {
            transform: [
                { rotateY: `${rotateValue}deg` },
            ],
            // 旋转到 90 度以上时隐藏正面
            backfaceVisibility: 'hidden',
            zIndex: isFlipped ? 0 : 1,
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotateY.value, [0, 180], [180, 0]);
        return {
            transform: [
                { rotateY: `${rotateValue}deg` },
            ],
            backfaceVisibility: 'hidden',
            zIndex: isFlipped ? 1 : 0,
        };
    });

    return (
        <View style={styles.container}>
            {/* 正面 */}
            <Animated.View
                style={[
                    styles.card,
                    styles.front,
                    frontAnimatedStyle,
                    { backgroundColor: theme.colors.background.secondary }
                ]}
            >
                <View style={styles.content}>
                    <Text style={[styles.label, { color: theme.colors.text.tertiary }]}>正面 (问)</Text>
                    <Text style={[styles.mainText, { color: theme.colors.text.primary }]}>
                        {card.front}
                    </Text>
                </View>
                <Text style={[styles.hint, { color: theme.colors.text.tertiary }]}>点击卡片查看答案</Text>
            </Animated.View>

            {/* 反面 */}
            <Animated.View
                style={[
                    styles.card,
                    styles.back,
                    backAnimatedStyle,
                    { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }
                ]}
            >
                <View style={styles.content}>
                    <Text style={[styles.label, { color: theme.colors.interactive.primary }]}>反面 (答)</Text>
                    <Text style={[styles.mainText, { color: theme.colors.text.primary }]}>
                        {card.back}
                    </Text>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 24,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backfaceVisibility: 'hidden',
        // 阴影
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    front: {
        // zIndex 会由 animatedStyle 控制
    },
    back: {
        // zIndex 会由 animatedStyle 控制
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 20,
        position: 'absolute',
        top: 0,
    },
    mainText: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 34,
    },
    hint: {
        fontSize: 14,
        position: 'absolute',
        bottom: 24,
    }
});
