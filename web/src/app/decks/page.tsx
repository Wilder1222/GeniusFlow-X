'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MainLayout } from '@/components';
import { useAuth } from '@/lib/auth-context';
import { DeckList } from '@/components/decks/deck-list';
import { CreateDeckModal } from '@/components/decks/create-deck-modal';
import dynamic from 'next/dynamic';
import { getUserDecks, createDeck } from '@/lib/decks';
import { Deck } from '@/types/decks';
import styles from './decks.module.css';

// Dynamically import ApkgImportModal with SSR disabled
const ApkgImportModal = dynamic(
    () => import('@/components/import/apkg-import-modal').then(mod => ({ default: mod.ApkgImportModal })),
    { ssr: false }
);

export default function DecksPage() {
    const { user } = useAuth();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [newDeckTitle, setNewDeckTitle] = useState('');
    const [newDeckDescription, setNewDeckDescription] = useState('');
    const isFetchingRef = useRef(false);

    useEffect(() => {
        if (user) {
            loadDecks();
        }
    }, [user]);

    const loadDecks = async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            if (!user) return;
            const data = await getUserDecks(user.id);
            setDecks(data);
        } catch (error) {
            console.error('Failed to load decks:', error);
        } finally {
            setLoading(false);
            // Non-Strict Mode reset. In strict mode, the second call returns early.
            // For periodic refresh, we can either keep this or add a manual refresh func.
            isFetchingRef.current = false;
        }
    };

    const handleCreateDeck = async (data: { title: string; description: string; is_public: boolean }) => {
        if (!user) return;
        await createDeck(user.id, data);
        await loadDecks(); // Reload list
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>我的卡组</h1>
                    <div className={styles.headerButtons}>
                        <button onClick={() => setShowImportModal(true)} className={styles.importButton}>
                            📥 导入 .apkg
                        </button>
                        <button onClick={() => setShowCreateModal(true)} className={styles.createButton}>
                            + 新建卡组
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.loadingSpinner}></div>
                        <div>加载中...</div>
                    </div>
                ) : (
                    <DeckList
                        decks={decks}
                        onDeckDeleted={loadDecks}
                    />
                )}

                <CreateDeckModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateDeck}
                />

                <ApkgImportModal
                    isOpen={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    onImportComplete={(deckName, cards) => {
                        loadDecks(); // Reload decks list
                    }}
                />
            </div>
        </MainLayout>
    );
}
