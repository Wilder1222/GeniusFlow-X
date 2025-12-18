'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { getProfile, updateProfile, uploadAvatar } from '@/lib/profile';
import { getSettings, updateSettings } from '@/lib/settings';
import { updatePassword } from '@/lib/auth';
import {
    LuUser,
    LuSettings,
    LuEye,
    LuMoon,
    LuSun,
    LuMonitor,
    LuLock,
    LuTrash2,
    LuCamera,
    LuCheck,
    LuLoader,
    LuBookOpen,
    LuBell,
    LuLanguages,
    LuVolume2
} from 'react-icons/lu';
import styles from './settings.module.css';

type SettingsTab = 'profile' | 'account' | 'learning' | 'appearance';

export default function SettingsPage() {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile State
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Learning & Notification State
    const [dailyGoal, setDailyGoal] = useState(20);
    const [language, setLanguage] = useState('zh-CN');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [ttsAutoPlay, setTtsAutoPlay] = useState(false);

    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [profileData, settingsData] = await Promise.all([
                getProfile(),
                getSettings()
            ]);

            if (profileData) {
                setDisplayName(profileData.displayName || '');
                setUsername(profileData.username || '');
                setBio(profileData.bio || '');
                setAvatarUrl(profileData.avatarUrl || '');
            }

            if (settingsData) {
                setDailyGoal(settingsData.dailyGoal);
                setLanguage(settingsData.language);
                setEmailNotifications(settingsData.emailNotifications);
                setTtsEnabled(settingsData.ttsEnabled);
                setTtsAutoPlay(settingsData.ttsAutoPlay);
            }
        } catch (error) {
            console.error('Failed to load settings data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile({
                displayName,
                username,
                bio
            });
            alert('个人资料已更新');
        } catch (error: any) {
            console.error('Update profile error:', error);
            alert('更新失败: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const url = await uploadAvatar(file);
            setAvatarUrl(url);
            alert('头像已更新');
        } catch (error: any) {
            console.error('Upload avatar error:', error);
            alert('上传失败: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateLearning = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSettings({
                dailyGoal,
                language,
                emailNotifications,
                ttsEnabled,
                ttsAutoPlay
            });
            alert('学习设置已保存');
        } catch (error: any) {
            console.error('Update settings error:', error);
            alert('保存失败: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }

        setSaving(true);
        try {
            await updatePassword(newPassword);
            alert('密码已更新');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Change password error:', error);
            alert('更新失败: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <LuLoader className="animate-spin" size={40} color="var(--color-brand-primary)" />
                </div>
            </MainLayout>
        );
    }

    const renderProfileSettings = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>个人资料</h3>
                <p className={styles.sectionDesc}>更新你的显示名称、头像和个人简介。</p>
            </div>

            <div className={styles.avatarSection}>
                <div className={styles.avatarPreview}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className={styles.avatarImage} />
                    ) : (
                        <LuUser size={40} color="#cbd5e1" />
                    )}
                </div>
                <div>
                    <label className={styles.uploadLabel}>
                        <LuCamera size={14} style={{ marginRight: '8px' }} />
                        更换头像
                        <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                    </label>
                    <p className={styles.helperText}>支持 JPG, PNG. 最大 2MB.</p>
                </div>
            </div>

            <form onSubmit={handleUpdateProfile} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>显示名称</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="你的名字"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>用户名</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                    />
                    <p className={styles.helperText}>用于你的个人主页 URL: GeniusFlow-X.com/user/{username || 'username'}</p>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>个人简介</label>
                    <textarea
                        className={styles.textarea}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="介绍一下你自己..."
                    />
                </div>
                <div className={styles.actions}>
                    <button type="submit" className={styles.saveBtn} disabled={saving}>
                        {saving ? '保存中...' : '保存修改'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderAccountSettings = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>账号安全</h3>
                <p className={styles.sectionDesc}>管理你的密码和账号关联信息。</p>
            </div>

            <form onSubmit={handleChangePassword} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>邮箱地址</label>
                    <input type="text" className={styles.input} value={user?.email || ''} disabled />
                    <p className={styles.helperText}>邮箱目前不可更改。</p>
                </div>

                <div style={{ margin: '16px 0', borderTop: '1px solid var(--color-border-light)' }}></div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>新密码</label>
                    <input
                        type="password"
                        className={styles.input}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="至少 6 个字符"
                        minLength={6}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>确认新密码</label>
                    <input
                        type="password"
                        className={styles.input}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="再次输入密码"
                        minLength={6}
                    />
                </div>
                <div className={styles.actions}>
                    <button type="submit" className={styles.saveBtn} disabled={saving || !newPassword}>
                        {saving ? '更新中...' : '修改密码'}
                    </button>
                </div>
            </form>

            <div style={{ marginTop: '48px', padding: '24px', borderRadius: '16px', border: '1px solid #fee2e2', backgroundColor: '#fef2f2' }}>
                <h4 style={{ color: '#991b1b', margin: '0 0 8px 0', fontWeight: 700 }}>危险区域</h4>
                <p style={{ color: '#b91c1c', fontSize: '14px', margin: '0 0 16px 0' }}>一旦你删除账号，所有数据都将无法恢复。</p>
                <button style={{ color: 'white', backgroundColor: '#dc2626', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
                    删除账号
                </button>
            </div>
        </div>
    );

    const renderLearningSettings = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>学习偏好</h3>
                <p className={styles.sectionDesc}>根据你的节奏调整学习目标和辅助功能。</p>
            </div>

            <form onSubmit={handleUpdateLearning} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>每日学习目标</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                            type="number"
                            className={styles.input}
                            style={{ width: '100px' }}
                            value={dailyGoal}
                            onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                            min={1}
                            max={500}
                        />
                        <span className={styles.label}>张卡片 / 天</span>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>界面语言</label>
                    <select
                        className={styles.input}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="zh-CN">简体中文</option>
                        <option value="en-US">English</option>
                    </select>
                </div>

                <div style={{ margin: '16px 0', borderTop: '1px solid var(--color-border-light)' }}></div>

                <div className={styles.formGroup}>
                    <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LuVolume2 size={16} /> 语音朗读 (TTS)
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={ttsEnabled}
                                onChange={(e) => setTtsEnabled(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>启用语音朗读</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', opacity: ttsEnabled ? 1 : 0.5 }}>
                            <input
                                type="checkbox"
                                checked={ttsAutoPlay}
                                disabled={!ttsEnabled}
                                onChange={(e) => setTtsAutoPlay(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>自动朗读 (翻面时)</span>
                        </label>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LuBell size={16} /> 通知
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '8px' }}>
                        <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>接收学习提醒邮件</span>
                    </label>
                </div>

                <div className={styles.actions}>
                    <button type="submit" className={styles.saveBtn} disabled={saving}>
                        {saving ? '保存中...' : '确认修改'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderAppearanceSettings = () => {
        const themes = [
            { value: 'light', label: '浅色模式', icon: LuSun, desc: '经典白昼，清晰明亮' },
            { value: 'dark', label: '深色模式', icon: LuMoon, desc: '舒适夜晚，专注高效' },
            { value: 'classic-dark', label: '经典夜间', icon: LuMonitor, desc: '极致深邃，极致省电' },
            { value: 'system', label: '跟随系统', icon: LuMonitor, desc: '自动切换，随心而动' },
        ];

        return (
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>外观设置</h3>
                    <p className={styles.sectionDesc}>选择你最喜欢的配色方案。</p>
                </div>

                <div className={styles.themeGrid}>
                    {themes.map((t) => (
                        <div
                            key={t.value}
                            className={`${styles.themeCard} ${theme === t.value ? styles.themeCardActive : ''}`}
                            onClick={() => setTheme(t.value as any)}
                        >
                            <t.icon className={styles.themeIcon} />
                            <div className={styles.themeLabel}>{t.label}</div>
                            {theme === t.value && <LuCheck style={{ color: 'var(--color-brand-primary)' }} />}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>账号设置</h1>
                    <p className={styles.subtitle}>管理你的账号、个人偏好及安全设置。</p>
                </header>

                <div className={styles.mainLayout}>
                    <aside className={styles.sidebar}>
                        <button
                            className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <LuUser size={18} /> 个人资料
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'account' ? styles.navItemActive : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <LuLock size={18} /> 账号安全
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'learning' ? styles.navItemActive : ''}`}
                            onClick={() => setActiveTab('learning')}
                        >
                            <LuBookOpen size={18} /> 学习设置
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'appearance' ? styles.navItemActive : ''}`}
                            onClick={() => setActiveTab('appearance')}
                        >
                            <LuMonitor size={18} /> 外观设置
                        </button>
                    </aside>

                    <main className={styles.contentArea}>
                        {activeTab === 'profile' && renderProfileSettings()}
                        {activeTab === 'account' && renderAccountSettings()}
                        {activeTab === 'learning' && renderLearningSettings()}
                        {activeTab === 'appearance' && renderAppearanceSettings()}
                    </main>
                </div>
            </div>
        </MainLayout>
    );
}
