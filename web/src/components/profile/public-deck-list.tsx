'use client';

import React from 'react';
import Link from 'next/link';
import { Deck } from '@/types/decks';
import styles from './public-deck-list.module.css';

interface PublicDeckListProps {
    decks: Deck[];
}

export function PublicDeckList({ decks }: PublicDeckListProps) {
    if (!decks || decks.length === 0) {
        return (
            <div className={styles.empty}>
                <p>该用户暂时没有公开的卡组。</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {decks.map(deck => (
                <Link href={`/decks/${deck.id}`} key={deck.id} className={styles.card}>
                    <div className={styles.content}>
                        <h3 className={styles.title}>{deck.title}</h3>
                        <p className={styles.description}>
                            {deck.description || '无描述'}
                        </p>
                        <div className={styles.footer}>
                            <span className={styles.tag}>
                                {deck.tags && deck.tags.length > 0 ? deck.tags[0] : '常规'}
                            </span>
                            <span className={styles.date}>
                                {new Date(deck.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
