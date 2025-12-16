'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './sidebar.module.css';

interface NavItem {
    label: string;
    href: string;
    icon?: string;
}

export interface SidebarProps {
    items?: NavItem[];
}

const defaultItems: NavItem[] = [
    { label: '仪表盘', href: '/', icon: '📊' },
    { label: '学习', href: '/study', icon: '📚' },
    { label: '牌组', href: '/decks', icon: '🗂️' },
    { label: 'AI 助手', href: '/ai', icon: '✨' },
    { label: '统计', href: '/stats', icon: '📈' },
    { label: '个人资料', href: '/profile', icon: '👤' },
    { label: '设置', href: '/settings', icon: '⚙️' },
];

export const Sidebar: React.FC<SidebarProps> = ({
    items = defaultItems,
}) => {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <nav className={styles.nav}>
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            {item.icon && <span className={styles.icon}>{item.icon}</span>}
                            <span className={styles.label}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <button
                className={styles.collapseButton}
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
            >
                {collapsed ? '→' : '←'}
            </button>
        </aside>
    );
};
