'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/components';
import type { Profile, UpdateProfileData } from '@/types/profile';
import { updateProfile, checkUsernameAvailable } from '@/lib/profile';
import { getFriendlyErrorMessage } from '@/lib/errors';
import styles from './profile-form.module.css';

export interface ProfileFormProps {
    profile: Profile;
    onUpdate?: (profile: Profile) => void;
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
    const [formData, setFormData] = useState({
        username: profile.username,
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        isPublic: profile.isPublic,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    const handleUsernameChange = async (value: string) => {
        setFormData(prev => ({ ...prev, username: value }));
        setUsernameStatus('idle');

        if (value === profile.username) {
            setUsernameStatus('available');
            return;
        }

        if (value.length < 3 || value.length > 20) {
            return;
        }

        setUsernameStatus('checking');
        const isAvailable = await checkUsernameAvailable(value);
        setUsernameStatus(isAvailable ? 'available' : 'taken');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (usernameStatus === 'taken') {
            setError('用户名已被使用');
            return;
        }

        setLoading(true);

        try {
            const updateData: UpdateProfileData = {};

            if (formData.username !== profile.username) {
                updateData.username = formData.username;
            }
            if (formData.displayName !== (profile.displayName || '')) {
                updateData.displayName = formData.displayName;
            }
            if (formData.bio !== (profile.bio || '')) {
                updateData.bio = formData.bio;
            }
            if (formData.isPublic !== profile.isPublic) {
                updateData.isPublic = formData.isPublic;
            }

            if (Object.keys(updateData).length === 0) {
                setSuccess('没有需要保存的更改');
                setLoading(false);
                return;
            }

            const updatedProfile = await updateProfile(updateData);
            if (updatedProfile) {
                setSuccess('资料已更新');
                onUpdate?.(updatedProfile);
            }
        } catch (err: unknown) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>基本信息</h3>

                <div className={styles.userIdDisplay}>
                    <span className={styles.label}>用户 ID</span>
                    <span className={styles.value}>{profile.userId}</span>
                </div>

                <div className={styles.fieldGroup}>
                    <Input
                        label="用户名"
                        value={formData.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="3-20 个字符"
                        maxLength={50}
                        fullWidth
                    />
                    {usernameStatus === 'checking' && (
                        <span className={styles.statusChecking}>检查中...</span>
                    )}
                    {usernameStatus === 'available' && formData.username !== profile.username && (
                        <span className={styles.statusAvailable}>✓ 可用</span>
                    )}
                    {usernameStatus === 'taken' && (
                        <span className={styles.statusTaken}>✗ 已被使用</span>
                    )}
                </div>

                <Input
                    label="显示名称"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="你的显示名称"
                    maxLength={50}
                    fullWidth
                />

                <div className={styles.textareaGroup}>
                    <label className={styles.textareaLabel}>个人简介</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="介绍一下自己..."
                        maxLength={300}
                        rows={3}
                    />
                    <span className={styles.charCount}>{formData.bio.length}/300</span>
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>隐私设置</h3>

                <label className={styles.toggleLabel}>
                    <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className={styles.toggle}
                    />
                    <span>公开我的资料</span>
                    <span className={styles.toggleHint}>
                        {formData.isPublic ? '其他用户可以查看你的资料' : '仅自己可见'}
                    </span>
                </label>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? '保存中...' : '保存更改'}
            </Button>
        </form>
    );
}
