'use client';

import React from 'react';
import { Header } from '../header';
import styles from './layout.module.css';

export interface MainLayoutProps {
    children: React.ReactNode;
    showHeader?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    showHeader = true,
}) => {
    return (
        <div className={styles.layout}>
            {showHeader && <Header />}

            <div className={styles.container}>
                <main className={styles.main}>
                    {children}
                </main>
            </div>
        </div>
    );
};
