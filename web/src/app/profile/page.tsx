'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout, ProfileForm, AvatarUpload, SettingsForm } from '@/components';
import { StatsDisplay } from '@/components/profile';
import { useAuth } from '@/lib/auth-context';
import { getProfile } from '@/lib/profile';
import type { Profile } from '@/types/profile';
import styles from './page.module.css';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

    useEffect(() => {
        if (!authLoading && user) {
            loadProfile();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const loadProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (err) {
            console.error('加载资料失败:', err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <MainLayout>
                <div className={styles.loading}>加载中...</div>
            </MainLayout>
        );
    }

    if (!user) {
        return (
            <MainLayout>
                <div className={styles.notLoggedIn}>
                    <h2>请先登录</h2>
                    <p>您需要登录才能查看和编辑个人资料</p>
                    <a href="/auth/login" className={styles.loginLink}>立即登录</a>
                </div>
            </MainLayout>
        );
    }

    if (!profile) {
        return (
            <MainLayout>
                <div className={styles.error}>
                    <h2>资料加载失败</h2>
                    <p>请刷新页面重试</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>个人中心</h1>
                </header>

                <div className={styles.avatarSection}>
                    <AvatarUpload
                        currentAvatarUrl={profile.avatarUrl}
                        displayName={profile.displayName || profile.username}
                        onUpload={(url) => setProfile(prev => prev ? { ...prev, avatarUrl: url } : null)}
                    />
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        个人资料
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        账户设置
                    </button>
                </div>

                <div className={styles.content}>
                    {activeTab === 'profile' && (
                        <>
                            <ProfileForm
                                profile={profile}
                                onUpdate={(updated) => setProfile(updated)}
                            />
                            <div className={styles.statsSection}>
                                <StatsDisplay />
                            </div>
                        </>
                    )}
                    {activeTab === 'settings' && (
                        <SettingsForm />
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
