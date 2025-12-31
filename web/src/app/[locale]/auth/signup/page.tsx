'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { Button, Input } from '@/components';
import { LoadingModal } from '@/components/ui/loading-modal';
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
    const [loadingMessage, setLoadingMessage] = useState('');
    const t = useTranslations('Auth.signup');
    const tCommon = useTranslations('Common');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('passwordMismatch'));
            return;
        }

        if (password.length < 6) {
            setError(t('passwordTooShort'));
            return;
        }

        setLoading(true);
        setLoadingMessage(t('loading'));

        try {
            const result = await signUp({ email, password, username });
            if (result?.message) {
                setSuccess(result.message);
                router.push('/home');
            } else {
                router.push('/home');
            }
        } catch (err: any) {
            setError(err.message || t('failed'));
            setLoading(false);
        } finally {
            // Success handler above handles redirect, so we only need to stop loading on error or here if not redirecting immediately
            if (!success) setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setLoadingMessage(t('redirectingGoogle'));
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || t('failed'));
            setLoading(false);
        }
    };

    const handleGitHubSignIn = async () => {
        try {
            setLoading(true);
            setLoadingMessage(t('redirectingGitHub'));
            await signInWithGitHub();
        } catch (err: any) {
            setError(err.message || t('failed'));
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <LoadingModal isOpen={loading} message={loadingMessage} />
            <div className={styles.card}>
                <h1 className={styles.title}>
                    {t.rich('title', {
                        brand: (chunks) => (
                            <Link href="/" className={styles.brandTitleLink}>
                                {chunks}
                            </Link>
                        )
                    })}
                </h1>
                <p className={styles.subtitle}>{t('subtitle')}</p>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label={t('username')}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t('usernamePlaceholder')}
                        fullWidth
                    />

                    <Input
                        label={t('email')}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        required
                        fullWidth
                    />

                    <Input
                        label={t('password')}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('passwordPlaceholder')}
                        required
                        fullWidth
                    />

                    <Input
                        label={t('confirmPassword')}
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('confirmPasswordPlaceholder')}
                        required
                        fullWidth
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        disabled={loading}
                    >
                        {t('submit')}
                    </Button>
                </form>

                <div className={styles.divider}>
                    <span>{tCommon('or')}</span>
                </div>

                <div className={styles.oauthButtons}>
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={handleGitHubSignIn}
                        disabled={loading}
                    >
                        <svg className={styles.oauthIcon} viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        {t('useGitHub')}
                    </Button>
                </div>

                <div className={styles.footer}>
                    {t('hasAccount')}{' '}
                    <a href="/auth/login" className={styles.link}>
                        {t('loginLink')}
                    </a>
                </div>
            </div>
        </div>
    );
}
