'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import styles from './sidebar.module.css';

interface NavItem {
    labelKey: string;
    href: string;
    icon?: string;
}

export interface SidebarProps {
    items?: NavItem[];
}

const defaultItems: NavItem[] = [
    { labelKey: 'dashboard', href: '/', icon: '📊' },
    { labelKey: 'study', href: '/study', icon: '📚' },
    { labelKey: 'decks', href: '/decks', icon: '🗂️' },
    { labelKey: 'aiAssistant', href: '/ai', icon: '✨' },
    { labelKey: 'stats', href: '/stats', icon: '📈' },
    { labelKey: 'profile', href: '/profile', icon: '👤' },
    { labelKey: 'settings', href: '/settings', icon: '⚙️' },
];

export const Sidebar: React.FC<SidebarProps> = ({
    items = defaultItems,
}) => {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const t = useTranslations('Sidebar');

    // Extract locale-less path for comparison
    const pathWithoutLocale = pathname.replace(/^\/(en|zh)/, '') || '/';

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <nav className={styles.nav}>
                {items.map((item) => {
                    const isActive = pathWithoutLocale === item.href ||
                        (item.href !== '/' && pathWithoutLocale.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            {item.icon && <span className={styles.icon}>{item.icon}</span>}
                            <span className={styles.label}>{t(item.labelKey)}</span>
                        </Link>
                    );
                })}
            </nav>

            <button
                className={styles.collapseButton}
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? t('expand') : t('collapse')}
            >
                {collapsed ? '→' : '←'}
            </button>
        </aside>
    );
};
