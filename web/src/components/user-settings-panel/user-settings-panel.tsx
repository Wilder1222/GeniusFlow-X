'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LuUser, LuSettings, LuEye, LuMoon, LuSun, LuMonitor, LuLogOut, LuChevronRight } from 'react-icons/lu';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import Link from 'next/link';
import styles from './user-settings-panel.module.css';

export default function UserSettingsPanel() {
    const { user, profile, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const avatarUrl = profile?.avatar_url;
    const displayName = profile?.display_name || profile?.username;

    if (!user) return null;

    const handleLogout = async () => {
        await signOut();
        setIsOpen(false);
    };

    // Handle click outside and ESC key
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            // Close if click is outside both panel and trigger
            if (
                panelRef.current &&
                triggerRef.current &&
                !panelRef.current.contains(target) &&
                !triggerRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        // Add event listeners
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen]);

    const themes = [
        { value: 'dark' as const, label: 'Dark', icon: LuMoon },
        { value: 'light' as const, label: 'Light', icon: LuSun },
        { value: 'classic-dark' as const, label: 'Classic Dark', icon: LuMoon },
        { value: 'system' as const, label: 'System', icon: LuMonitor },
    ];

    return (
        <div className={styles.container}>
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User settings"
            >
                <div className={styles.avatar}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className={styles.avatarImg} />
                    ) : (
                        <LuUser size={20} />
                    )}
                </div>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className={styles.overlay} />
            )}

            {/* Settings Panel */}
            <div ref={panelRef} className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
                {/* User Info */}
                <div className={styles.userInfo}>
                    <div className={styles.avatarLarge}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className={styles.avatarImg} />
                        ) : (
                            <LuUser size={16} />
                        )}
                    </div>
                    <div className={styles.userDetails}>
                        <div className={styles.userName}>{displayName || user.email?.split('@')[0] || 'User'}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className={styles.menuSection}>
                    <Link href="/settings" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                        <LuSettings size={12} />
                        <span>Account preferences</span>
                        <LuChevronRight size={12} className={styles.chevron} />
                    </Link>
                    <button className={styles.menuItem}>
                        <LuEye size={12} />
                        <span>Feature previews</span>
                        <LuChevronRight size={12} className={styles.chevron} />
                    </button>
                </div>

                {/* Theme Selection */}
                <div className={styles.themeSection}>
                    <div className={styles.sectionLabel}>Theme</div>
                    {themes.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            className={`${styles.themeOption} ${theme === value ? styles.themeOptionActive : ''}`}
                            onClick={() => setTheme(value)}
                        >
                            <div className={styles.radioOuter}>
                                {theme === value && <div className={styles.radioInner} />}
                            </div>
                            <Icon size={12} className={styles.themeIcon} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Logout */}
                <div className={styles.logoutSection}>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <LuLogOut size={12} />
                        <span>Log out</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
