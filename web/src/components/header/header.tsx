'use client';

import React from 'react';
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import styles from './header.module.css';
import { Button } from '../button';
import { useAuth } from '@/lib/auth-context';

export interface HeaderProps {
    title?: string;
    showAuth?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    title = 'FlashGenius',
    showAuth = true,
}) => {
    const { user, loading, signOut } = useAuth();
    const pathname = usePathname();

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = '/auth/login';
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const navItems = [
        { label: 'Home', href: '/', icon: '🏠' },
        { label: 'Decks', href: '/decks', icon: '🗂️' },
        { label: 'Stats', href: '/stats', icon: '📊' },
    ];

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.leftSection}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoIcon}>📕</span>
                        <h1 className={styles.title}>{title}</h1>
                    </Link>

                    <nav className={styles.nav}>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                        <Link href="/add" className={styles.navItem}>
                            <span>+</span> Add
                        </Link>
                    </nav>
                </div>

                {showAuth && !loading && (
                    <div className={styles.actions}>
                        {user ? (
                            <>
                                <Link href="/profile" className={styles.userLink}>
                                    <span className={styles.username}>
                                        {user.email?.split('@')[0]}
                                    </span>
                                    <span className={styles.userIcon}>👤</span>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                                    Sign Out
                                </Button>
                            </>
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
