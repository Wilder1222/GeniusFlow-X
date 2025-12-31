'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/lib/contexts/toast-context';
import { formatApiError } from '@/lib/error-handler';
import styles from './browse.module.css';

interface Card {
    id: string;
    front: string;
    back: string;
    state: string;
    tags: string[];
    deck_id: string;
    created_at: string;
    updated_at: string;
    decks: { title: string };
}

interface BrowseResponse {
    cards: Card[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export default function BrowsePage() {
    const router = useRouter();
    const toast = useToast();
    const [cards, setCards] = useState<Card[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Batch selection
    const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
    const [showBatchActions, setShowBatchActions] = useState(false);

    useEffect(() => {
        loadCards();
    }, [page, search, stateFilter, sortBy, sortOrder]);

    const loadCards = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: '50',
                sortBy,
                sortOrder
            });

            if (search) params.append('search', search);
            if (stateFilter) params.append('state', stateFilter);

            const data = await apiClient.get(`/api/cards/browse?${params}`);

            if (data.success) {
                const result = data.data as BrowseResponse;
                setCards(result.cards);
                setTotal(result.total);
                setTotalPages(result.totalPages);
            }
        } catch (error) {
            console.error('Failed to load cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const toggleCardSelection = (cardId: string) => {
        const newSelection = new Set(selectedCards);
        if (newSelection.has(cardId)) {
            newSelection.delete(cardId);
        } else {
            newSelection.add(cardId);
        }
        setSelectedCards(newSelection);
        setShowBatchActions(newSelection.size > 0);
    };

    const selectAll = () => {
        const allIds = new Set(cards.map(c => c.id));
        setSelectedCards(allIds);
        setShowBatchActions(true);
    };

    const deselectAll = () => {
        setSelectedCards(new Set());
        setShowBatchActions(false);
    };

    const handleBatchDelete = async () => {
        if (selectedCards.size === 0) return;

        if (!confirm(`确定要删除 ${selectedCards.size} 张卡片吗？此操作无法撤销。`)) {
            return;
        }

        try {
            const data = await apiClient.post('/api/cards/batch', {
                action: 'delete',
                cardIds: Array.from(selectedCards)
            });

            if (data.success) {
                toast.success(`成功删除 ${data.data.deleted} 张卡片`);
                deselectAll();
                loadCards();
            } else {
                toast.error(formatApiError(data));
            }
        } catch (error) {
            console.error('Batch delete error:', error);
            toast.error(formatApiError(error));
        }
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1 className={styles.title}>卡片浏览器</h1>
                        <span className={styles.count}>{total} 张卡片</span>
                    </div>
                    <button
                        onClick={() => router.push('/decks')}
                        className={styles.backButton}
                    >
                        返回卡组
                    </button>
                </div>

                {/* Selection Bar */}
                {showBatchActions && (
                    <div className={styles.batchBar}>
                        <div className={styles.batchInfo}>
                            <span className={styles.selectedCount}>
                                已选择 {selectedCards.size} 张卡片
                            </span>
                            <button onClick={deselectAll} className={styles.clearButton}>
                                清除选择
                            </button>
                        </div>
                        <div className={styles.batchActions}>
                            <button
                                onClick={handleBatchDelete}
                                className={`${styles.batchButton} ${styles.deleteButton}`}
                            >
                                🗑️ 删除
                            </button>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className={styles.filters}>
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="搜索卡片内容..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                        <span className={styles.searchIcon}>🔍</span>
                    </div>

                    <div className={styles.filterGroup}>
                        {selectedCards.size === 0 && (
                            <button onClick={selectAll} className={styles.selectAllButton}>
                                全选
                            </button>
                        )}

                        <select
                            value={stateFilter}
                            onChange={(e) => setStateFilter(e.target.value)}
                            className={styles.select}
                        >
                            <option value="">所有状态</option>
                            <option value="new">新卡片</option>
                            <option value="learning">学习中</option>
                            <option value="review">复习中</option>
                            <option value="relearning">重学中</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={styles.select}
                        >
                            <option value="created_at">创建时间</option>
                            <option value="updated_at">更新时间</option>
                            <option value="front">卡片内容</option>
                        </select>

                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className={styles.sortButton}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>

                {/* Card List */}
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>加载中...</p>
                    </div>
                ) : cards.length === 0 ? (
                    <div className={styles.empty}>
                        <p>没有找到卡片</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.cardList}>
                            {cards.map((card) => (
                                <div
                                    key={card.id}
                                    className={`${styles.cardItem} ${selectedCards.has(card.id) ? styles.selected : ''}`}
                                    onClick={() => toggleCardSelection(card.id)}
                                >
                                    <div className={styles.checkbox}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCards.has(card.id)}
                                            onChange={() => { }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className={styles.cardContent}>
                                        <div className={styles.cardFront}>
                                            <span className={styles.label}>正面：</span>
                                            {card.front}
                                        </div>
                                        <div className={styles.cardBack}>
                                            <span className={styles.label}>背面：</span>
                                            {card.back}
                                        </div>
                                    </div>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.deckName}>
                                            📚 {card.decks.title}
                                        </span>
                                        <span className={`${styles.badge} ${styles[card.state]}`}>
                                            {card.state}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className={styles.pageButton}
                                >
                                    上一页
                                </button>
                                <span className={styles.pageInfo}>
                                    第 {page} / {totalPages} 页
                                </span>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className={styles.pageButton}
                                >
                                    下一页
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}
