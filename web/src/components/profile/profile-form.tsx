'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
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
    const t = useTranslations('Profile');
    const ts = useTranslations('Settings');
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
            setError(t('usernameTaken'));
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
                setSuccess(ts('noChanges'));
                setLoading(false);
                return;
            }

            const updatedProfile = await updateProfile(updateData);
            if (updatedProfile) {
                setSuccess(t('profileUpdated'));
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
                <h3 className={styles.sectionTitle}>{t('basicInfo')}</h3>

                <div className={styles.userIdDisplay}>
                    <span className={styles.label}>{t('userId')}</span>
                    <span className={styles.value}>{profile.userId}</span>
                </div>

                <div className={styles.fieldGroup}>
                    <Input
                        label={t('username')}
                        value={formData.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder={t('usernameHint')}
                        maxLength={50}
                        fullWidth
                    />
                    {usernameStatus === 'checking' && (
                        <span className={styles.statusChecking}>{t('checking')}</span>
                    )}
                    {usernameStatus === 'available' && formData.username !== profile.username && (
                        <span className={styles.statusAvailable}>✓ {t('available')}</span>
                    )}
                    {usernameStatus === 'taken' && (
                        <span className={styles.statusTaken}>✗ {t('inUse')}</span>
                    )}
                </div>

                <Input
                    label={t('displayName')}
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder={t('displayName')}
                    maxLength={50}
                    fullWidth
                />

                <div className={styles.textareaGroup}>
                    <label className={styles.textareaLabel}>{t('bio')}</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder={t('bioPlaceholder')}
                        maxLength={300}
                        rows={3}
                    />
                    <span className={styles.charCount}>{formData.bio.length}/300</span>
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('privacySettings')}</h3>

                <label className={styles.toggleLabel}>
                    <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className={styles.toggle}
                    />
                    <span>{t('showProfile')}</span>
                    <span className={styles.toggleHint}>
                        {formData.isPublic ? t('publicHint') : t('privateHint')}
                    </span>
                </label>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? ts('loading') : t('saveChanges')}
            </Button>
        </form>
    );
}
