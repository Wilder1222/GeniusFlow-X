/**
 * Login Screen - 登录页面
 * 
 * Email + Password 登录
 * OAuth 登录支持
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import { Button, Input, LoadingSpinner } from '../../src/components/common';
import { authService } from '../../src/services/auth.service';
import { useTheme } from '../../src/contexts/ThemeContext';
import { REGEX, VALIDATION, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../src/config/constants';

export default function LoginScreen() {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    // 表单验证
    const validate = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = '请输入邮箱地址';
        } else if (!REGEX.EMAIL.test(email)) {
            newErrors.email = '邮箱格式不正确';
        }

        if (!password) {
            newErrors.password = '请输入密码';
        } else if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
            newErrors.password = `密码至少需要${VALIDATION.PASSWORD_MIN_LENGTH}位`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 登录处理
    const handleLogin = async () => {
        if (!validate()) return;

        setLoading(true);
        const { error } = await authService.signIn({ email, password });

        if (error) {
            showMessage({
                message: error,
                type: 'danger',
            });
            setLoading(false);
        } else {
            showMessage({
                message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
                type: 'success',
            });
            // 路由导航通常会在 AuthContext 监听到 session 时自动处理，
            // 但这里保持显式导航以确保即时响应
            router.replace('/(tabs)/home');
            setLoading(false);
        }
    };

    // 跳转到注册
    const navigateToSignup = () => {
        router.push('/auth/signup');
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="登录中..." />;
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { backgroundColor: theme.colors.background.primary },
                ]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo 区域 */}
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.logo,
                            {
                                color: theme.colors.interactive.primary,
                            },
                        ]}
                    >
                        🧠 GeniusFlow-X
                    </Text>
                    <Text
                        style={[
                            styles.subtitle,
                            {
                                color: theme.colors.text.secondary,
                            },
                        ]}
                    >
                        AI驱动的智能学习平台
                    </Text>
                </View>

                {/* 登录表单 */}
                <View style={styles.form}>
                    <Input
                        label="邮箱"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="输入您的邮箱"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                    />

                    <Input
                        label="密码"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="输入密码"
                        secureTextEntry
                        autoCapitalize="none"
                        error={errors.password}
                    />

                    <Button
                        title="登录"
                        onPress={handleLogin}
                        fullWidth
                        size="lg"
                        style={{ marginTop: theme.spacing.md }}
                    />

                    {/* 注册链接 */}
                    <View style={styles.signupContainer}>
                        <Text
                            style={[
                                styles.signupText,
                                {
                                    color: theme.colors.text.secondary,
                                },
                            ]}
                        >
                            还没有账号？
                        </Text>
                        <Button
                            title="立即注册"
                            onPress={navigateToSignup}
                            variant="ghost"
                            size="sm"
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    form: {
        width: '100%',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    signupText: {
        fontSize: 14,
    },
});
