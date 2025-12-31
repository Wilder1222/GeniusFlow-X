/**
 * Modal Component - 通用模态框
 * 
 * 底部弹出动画
 * 手势下滑关闭
 * 背景模糊效果
 */

import React, { useEffect } from 'react';
import {
    Modal as RNModal,
    View,
    Text as RNText,
    StyleSheet,
    TouchableWithoutFeedback,
    Dimensions,
    ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 100;

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;

    // 样式属性
    maxHeight?: number;

    // 自定义样式
    containerStyle?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
    visible,
    onClose,
    children,
    title,
    maxHeight = SCREEN_HEIGHT * 0.8,
    containerStyle,
}) => {
    const { theme, isDark } = useTheme();

    // 动画值
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const backdropOpacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // 打开动画
            translateY.value = withSpring(0, { damping: 20 });
            backdropOpacity.value = withTiming(1, { duration: 300 });
        } else {
            // 关闭动画
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
            backdropOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [visible]);

    // 下滑手势
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > DISMISS_THRESHOLD) {
                // 关闭模态框
                translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
                backdropOpacity.value = withTiming(0, { duration: 300 });
                runOnJS(onClose)();
            } else {
                // 恢复位置
                translateY.value = withSpring(0, { damping: 20 });
            }
        });

    const modalAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const backdropAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: backdropOpacity.value,
        };
    });

    const modalContentStyles: ViewStyle = {
        backgroundColor: theme.colors.background.primary,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        maxHeight,
        padding: theme.spacing.lg,
    };

    return (
        <RNModal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* 背景模糊 */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
                        <BlurView
                            intensity={isDark ? 30 : 20}
                            tint={isDark ? 'dark' : 'light'}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                </TouchableWithoutFeedback>

                {/* 模态框内容 */}
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[modalContentStyles, containerStyle, modalAnimatedStyle]}>
                        {/* 顶部拖动指示器 */}
                        <View style={styles.dragIndicatorContainer}>
                            <View
                                style={[
                                    styles.dragIndicator,
                                    { backgroundColor: theme.colors.border.secondary },
                                ]}
                            />
                        </View>

                        {title && (
                            <RNText style={[styles.title, { color: theme.colors.text.primary }]}>
                                {title}
                            </RNText>
                        )}

                        {children}
                    </Animated.View>
                </GestureDetector>
            </View>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dragIndicatorContainer: {
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 8,
    },
    dragIndicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
});
