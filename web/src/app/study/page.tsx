'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components';
import { StudyInterface } from '@/components/study/study-interface';
import { getDueCards, gradeCard, Rating } from '@/lib/study';
import { Card } from '@/types/decks';

function StudyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const deckId = searchParams.get('deck');

    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch due cards
        loadCards();
    }, [deckId]);

    const loadCards = async () => {
        setLoading(true);
        try {
            const data = await getDueCards(deckId || undefined);
            setCards(data);
        } catch (error) {
            console.error('Failed to load due cards:', error);
            alert('加载失败');
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async (cardId: string, rating: Rating) => {
        try {
            await gradeCard(cardId, rating);
            // Optionally logs or stats updates here
        } catch (error) {
            console.error('Grading failed:', error);
            alert('评分提交失败，请重试');
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                    ×
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>正在获取卡片...</div>
            ) : (
                <StudyInterface cards={cards} onGrade={handleGrade} />
            )}
        </div>
    );
}

export default function StudyPage() {
    return (
        <MainLayout showHeader={false}>
            <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>}>
                <StudyContent />
            </Suspense>
        </MainLayout>
    );
}
