'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import styles from './header.module.css';
import { Button } from '../button';
import { useAuth } from '@/lib/auth-context';
import UserSettingsPanel from '../user-settings-panel/user-settings-panel';
import LanguageSwitcher from '../common/language-switcher';

export interface HeaderProps {
    title?: string;
    showAuth?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    title = 'GeniusFlow-X',
    showAuth = true,
}) => {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const t = useTranslations('Header');

    const navItems = [
        { labelKey: 'home', href: '/home', icon: '🏠' },
        { labelKey: 'decks', href: '/decks', icon: '🗂️' },
        { labelKey: 'stats', href: '/stats', icon: '📊' },
    ];

    // Extract locale-less path for comparison
    const pathWithoutLocale = pathname.replace(/^\/(en|zh)/, '') || '/';

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Left: Platform Branding */}
                <div className={styles.branding}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoIcon}>📕</span>
                        <h1 className={styles.title}>{title}</h1>
                    </Link>
                </div>

                {/* Center: Navigation Card */}
                <nav className={styles.navCard}>
                    <div className={styles.navContent}>
                        {navItems.map((item) => {
                            const isActive = pathWithoutLocale === item.href ||
                                (item.href !== '/' && pathWithoutLocale.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                                >
                                    {t(item.labelKey)}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Right: User Settings */}
                {showAuth && !loading && (
                    <div className={styles.actions}>
                        <LanguageSwitcher />
                        {user ? (
                            <UserSettingsPanel />
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">{t('login')}</Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button variant="primary" size="sm">{t('signup')}</Button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};
