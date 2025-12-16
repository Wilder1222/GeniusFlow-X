'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components';
import { useAuth } from '@/lib/auth-context';
import { signInWithGoogle, signInWithGitHub } from '@/lib/auth';
import styles from '../login/auth.module.css';

export default function SignUpPage() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        if (password.length < 6) {
            setError('密码长度至少6位');
            return;
        }

        setLoading(true);

        try {
            const result = await signUp({ email, password, username });
            if (result?.message) {
                setSuccess(result.message);
                // 延迟跳转，让用户看到成功提示
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || '注册失败');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Google 登录失败');
        }
    };

    const handleGitHubSignIn = async () => {
        try {
            await signInWithGitHub();
        } catch (err: any) {
            setError(err.message || 'GitHub 登录失败');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>注册 GeniusFlow-X</h1>
                <p className={styles.subtitle}>开始你的学习之旅</p>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="用户名"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="设置用户名"
                        fullWidth
                    />

                    <Input
                        label="邮箱"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        fullWidth
                    />

                    <Input
                        label="密码"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="至少6位字符"
                        required
                        fullWidth
                    />

                    <Input
                        label="确认密码"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="再次输入密码"
                        required
                        fullWidth
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? '注册中...' : '注册'}
                    </Button>
                </form>

                <div className={styles.divider}>
                    <span>或</span>
                </div>

                <div className={styles.oauthButtons}>
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={handleGoogleSignIn}
                    >
                        <span className={styles.oauthIcon}>🔍</span>
                        使用 Google 注册
                    </Button>

                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={handleGitHubSignIn}
                    >
                        <span className={styles.oauthIcon}>⚫</span>
                        使用 GitHub 注册
                    </Button>
                </div>

                <div className={styles.footer}>
                    已有账号？{' '}
                    <a href="/auth/login" className={styles.link}>
                        立即登录
                    </a>
                </div>
            </div>
        </div>
    );
}
