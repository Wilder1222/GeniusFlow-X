'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@/components';
import type { UserSettings, UpdateSettingsData } from '@/types/profile';
import { getSettings, updateSettings } from '@/lib/settings';
import { getFriendlyErrorMessage } from '@/lib/errors';
import styles from './settings-form.module.css';

export interface SettingsFormProps {
    initialSettings?: UserSettings | null;
    onUpdate?: (settings: UserSettings) => void;
}

export function SettingsForm({ initialSettings, onUpdate }: SettingsFormProps) {
    const [settings, setSettings] = useState<UserSettings | null>(initialSettings || null);
    const [formData, setFormData] = useState({
        theme: 'system' as 'light' | 'dark' | 'system',
        language: 'zh-CN',
        emailNotifications: true,
        dailyGoal: 20,
        ttsEnabled: true,
        ttsAutoPlay: false,
    });
    const [loading, setLoading] = useState(!initialSettings);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!initialSettings) {
            loadSettings();
        } else if (initialSettings) {
            setFormData({
                theme: initialSettings.theme,
                language: initialSettings.language,
                emailNotifications: initialSettings.emailNotifications,
                dailyGoal: initialSettings.dailyGoal,
                ttsEnabled: (initialSettings as any).ttsEnabled ?? true,
                ttsAutoPlay: (initialSettings as any).ttsAutoPlay ?? false,
            });
        }
    }, [initialSettings]);

    const loadSettings = async () => {
        try {
            const data = await getSettings();
            if (data) {
                setSettings(data);
                setFormData({
                    theme: data.theme,
                    language: data.language,
                    emailNotifications: data.emailNotifications,
                    dailyGoal: data.dailyGoal,
                    ttsEnabled: data.ttsEnabled,
                    ttsAutoPlay: data.ttsAutoPlay,
                });
            }
        } catch (err) {
            console.error('加载设置失败:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const updateData: UpdateSettingsData = {};

            if (settings) {
                if (formData.theme !== settings.theme) updateData.theme = formData.theme;
                if (formData.language !== settings.language) updateData.language = formData.language;
                if (formData.emailNotifications !== settings.emailNotifications) {
                    updateData.emailNotifications = formData.emailNotifications;
                }
                if (formData.dailyGoal !== settings.dailyGoal) {
                    updateData.dailyGoal = formData.dailyGoal;
                }
                if (formData.ttsEnabled !== settings.ttsEnabled) {
                    updateData.ttsEnabled = formData.ttsEnabled;
                }
                if (formData.ttsAutoPlay !== settings.ttsAutoPlay) {
                    updateData.ttsAutoPlay = formData.ttsAutoPlay;
                }
            } else {
                updateData.theme = formData.theme;
                updateData.language = formData.language;
                updateData.emailNotifications = formData.emailNotifications;
                updateData.dailyGoal = formData.dailyGoal;
                updateData.ttsEnabled = formData.ttsEnabled;
                updateData.ttsAutoPlay = formData.ttsAutoPlay;
            }

            if (Object.keys(updateData).length === 0) {
                setSuccess('没有需要保存的更改');
                setSaving(false);
                return;
            }

            const updatedSettings = await updateSettings(updateData);
            if (updatedSettings) {
                setSettings(updatedSettings);
                setSuccess('设置已保存');
                onUpdate?.(updatedSettings);
            }
        } catch (err: unknown) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>加载中...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>外观设置</h3>

                <div className={styles.optionGroup}>
                    <label className={styles.optionLabel}>主题</label>
                    <div className={styles.radioGroup}>
                        {(['light', 'dark', 'system'] as const).map((theme) => (
                            <label key={theme} className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="theme"
                                    value={theme}
                                    checked={formData.theme === theme}
                                    onChange={() => setFormData(prev => ({ ...prev, theme }))}
                                    className={styles.radio}
                                />
                                <span className={styles.radioText}>
                                    {theme === 'light' && '☀️ 浅色'}
                                    {theme === 'dark' && '🌙 深色'}
                                    {theme === 'system' && '💻 跟随系统'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.optionGroup}>
                    <label className={styles.optionLabel}>语言</label>
                    <select
                        value={formData.language}
                        onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                        className={styles.select}
                    >
                        <option value="zh-CN">简体中文</option>
                        <option value="en-US">English</option>
                    </select>
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>学习设置</h3>

                <div className={styles.optionGroup}>
                    <label className={styles.optionLabel}>每日学习目标</label>
                    <div className={styles.goalInput}>
                        <input
                            type="number"
                            min="1"
                            max="500"
                            value={formData.dailyGoal}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                dailyGoal: Math.max(1, Math.min(500, Number(e.target.value)))
                            }))}
                            className={styles.numberInput}
                        />
                        <span className={styles.goalUnit}>张卡片/天</span>
                    </div>
                </div>

                <div className={styles.optionGroup}>
                    <label className={styles.optionLabel}>语音朗读 (TTS)</label>

                    <label className={styles.toggleLabel} style={{ marginBottom: '12px' }}>
                        <input
                            type="checkbox"
                            checked={formData.ttsEnabled}
                            onChange={(e) => setFormData(prev => ({ ...prev, ttsEnabled: e.target.checked }))}
                            className={styles.toggle}
                        />
                        <span>启用语音朗读</span>
                    </label>

                    <label className={styles.toggleLabel}>
                        <input
                            type="checkbox"
                            checked={formData.ttsAutoPlay}
                            disabled={!formData.ttsEnabled}
                            onChange={(e) => setFormData(prev => ({ ...prev, ttsAutoPlay: e.target.checked }))}
                            className={styles.toggle}
                        />
                        <span>自动朗读</span>
                        <span className={styles.toggleHint}>
                            翻卡时自动播放
                        </span>
                    </label>
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>通知设置</h3>

                <label className={styles.toggleLabel}>
                    <input
                        type="checkbox"
                        checked={formData.emailNotifications}
                        onChange={(e) => setFormData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className={styles.toggle}
                    />
                    <span>邮件通知</span>
                    <span className={styles.toggleHint}>
                        接收学习提醒和系统通知
                    </span>
                </label>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <Button type="submit" variant="primary" fullWidth disabled={saving}>
                {saving ? '保存中...' : '保存设置'}
            </Button>
        </form>
    );
}
