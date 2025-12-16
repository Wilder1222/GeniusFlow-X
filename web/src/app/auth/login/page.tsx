'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components';
import { useAuth } from '@/lib/auth-context';
import { signInWithGoogle, signInWithGitHub } from '@/lib/auth';
import styles from './auth.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn({ email, password });
            if (result?.message || result?.user) {
                setSuccess('登录成功'); // API might return "message", or we default to this
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || '登录失败，请检查邮箱和密码');
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
                <h1 className={styles.title}>登录 GeniusFlow-X</h1>
                <p className={styles.subtitle}>欢迎回来！</p>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
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
                        placeholder="输入密码"
                        required
                        fullWidth
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? '登录中...' : '登录'}
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
                        使用 Google 登录
                    </Button>

                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={handleGitHubSignIn}
                    >
                        <span className={styles.oauthIcon}>⚫</span>
                        使用 GitHub 登录
                    </Button>
                </div>

                <div className={styles.footer}>
                    还没有账号？{' '}
                    <a href="/auth/signup" className={styles.link}>
                        立即注册
                    </a>
                </div>
            </div>
        </div>
    );
}
