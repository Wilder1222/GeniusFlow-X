/**
 * Signup Screen - 注册页面
 * 
 * 用户注册流程
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

export default function SignupScreen() {
    const { theme } = useTheme();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        username?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    // 表单验证
    const validate = (): boolean => {
        const newErrors: any = {};

        if (!username) {
            newErrors.username = '请输入用户名';
        } else if (!REGEX.USERNAME.test(username)) {
            newErrors.username = '用户名只能包含字母、数字和下划线，3-20位';
        }

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

        if (!confirmPassword) {
            newErrors.confirmPassword = '请确认密码';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = '两次输入的密码不一致';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 注册处理
    const handleSignup = async () => {
        if (!validate()) return;

        setLoading(true);
        const { error } = await authService.signUp({ email, password, username });

        if (error) {
            showMessage({
                message: error,
                type: 'danger',
            });
            setLoading(false);
        } else {
            showMessage({
                message: '注册成功！请登录',
                type: 'success',
            });
            // 返回登录页
            router.back();
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="注册中..." />;
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
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: theme.colors.text.primary,
                            },
                        ]}
                    >
                        创建账号
                    </Text>
                    <Text
                        style={[
                            styles.subtitle,
                            {
                                color: theme.colors.text.secondary,
                            },
                        ]}
                    >
                        加入GeniusFlow-X，开始智能学习之旅
                    </Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="用户名"
                        value={username}
                        onChangeText={setUsername}
                        placeholder="3-20位字母、数字或下划线"
                        autoCapitalize="none"
                        error={errors.username}
                    />

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
                        placeholder="至少8位"
                        secureTextEntry
                        autoCapitalize="none"
                        error={errors.password}
                    />

                    <Input
                        label="确认密码"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="再次输入密码"
                        secureTextEntry
                        autoCapitalize="none"
                        error={errors.confirmPassword}
                    />

                    <Button
                        title="注册"
                        onPress={handleSignup}
                        fullWidth
                        size="lg"
                        style={{ marginTop: theme.spacing.md }}
                    />

                    <View style={styles.loginContainer}>
                        <Text
                            style={[
                                styles.loginText,
                                {
                                    color: theme.colors.text.secondary,
                                },
                            ]}
                        >
                            已有账号？
                        </Text>
                        <Button
                            title="返回登录"
                            onPress={() => router.back()}
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
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    loginText: {
        fontSize: 14,
    },
});
