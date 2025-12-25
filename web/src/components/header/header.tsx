'use client';

import React from 'react';
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import styles from './header.module.css';
import { Button } from '../button';
import { useAuth } from '@/lib/auth-context';
import UserSettingsPanel from '../user-settings-panel/user-settings-panel';

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

    const navItems = [
        { label: 'Home', href: '/home', icon: '🏠' },
        { label: 'Decks', href: '/decks', icon: '🗂️' },
        { label: 'Stats', href: '/stats', icon: '📊' },
        // { label: 'Pricing', href: '/pricing', icon: '💎' },
    ];

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
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        {/* <Link href="/add" className={styles.navItem}>
                            Add
                        </Link> */}
                    </div>
                </nav>

                {/* Right: User Settings */}
                {showAuth && !loading && (
                    <div className={styles.actions}>
                        {user ? (
                            <UserSettingsPanel />
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button variant="primary" size="sm">Sign Up</Button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};
