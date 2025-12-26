'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components';
import { AIGeneratorModal } from '@/components/ai/ai-generator-modal';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import EditCardModal from '@/components/cards/edit-card-modal';
import EditDeckModal from '@/components/decks/edit-deck-modal';
import CardMediaDisplay from '@/components/cards/card-media-display';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/contexts/toast-context';
import { formatApiError } from '@/lib/error-handler';
import { apiClient } from '@/lib/api-client';
import { cardsToMarkdown, downloadMarkdown } from '@/lib/markdown-parser';
import { getDeckById } from '@/lib/decks';
import { getCardsByDeckId, createCard } from '@/lib/cards';
import { Deck, Card } from '@/types/decks';
import styles from './page.module.css';

export default function DeckDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const toast = useToast();
    const deckId = params.id as string;

    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);

    // Simple Add Card Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // AI Generator Modal State
    const [showAIModal, setShowAIModal] = useState(false);

    // Batch delete state
    const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Edit card state
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Edit deck state
    const [showEditDeckModal, setShowEditDeckModal] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Status filter state
    const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'learning' | 'review' | 'relearning'>('all');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const isFetchingRef = useRef(false);

    useEffect(() => {
        if (deckId) {
            loadData();
        }
    }, [deckId]);

    const loadData = async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            const [deckData, cardsData] = await Promise.all([
                getDeckById(deckId),
                getCardsByDeckId(deckId)
            ]);

            if (!deckData) {
                router.push('/decks');
                return;
            }

            setDeck(deckData);
            setCards(cardsData);
            setSelectedCards(new Set()); // Clear selection on reload
        } catch (error) {
            console.error('Error loading deck:', error);
        } finally {
            setLoading(false);
            setSelectedCards(new Set()); // Clear selection when data reloads
            setSearchQuery(''); // Clear search when data reloads
            isFetchingRef.current = false;
        }
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFront.trim() || !newBack.trim()) return;

        setSubmitting(true);
        try {
            await createCard({
                deck_id: deckId,
                front: newFront,
                back: newBack
            });
            const updatedCards = await getCardsByDeckId(deckId);
            setCards(updatedCards);
            setNewFront('');
            setNewBack('');
        } catch (error) {
            console.error('Error adding card:', error);
            toast.error('添加失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExportMarkdown = () => {
        if (cards.length === 0) {
            toast.warning('没有卡片可导出');
            return;
        }

        const markdown = cardsToMarkdown(cards.map(card => ({
            front: card.front,
            back: card.back
        })));

        const filename = `${deck?.title || 'deck'}_${new Date().toISOString().split('T')[0]}.md`;
        downloadMarkdown(markdown, filename);

        toast.success(`已导出 ${cards.length} 张卡片到 ${filename}`);
    };

    // Batch selection handlers
    const handleSelectAll = () => {
        if (selectedCards.size === paginatedCards.length) {
            // Deselect all on current page
            const newSelected = new Set(selectedCards);
            paginatedCards.forEach(card => newSelected.delete(card.id));
            setSelectedCards(newSelected);
        } else {
            // Select all on current page
            const newSelected = new Set(selectedCards);
            paginatedCards.forEach(card => newSelected.add(card.id));
            setSelectedCards(newSelected);
        }
    };

    const handleCardSelect = (cardId: string) => {
        const newSelected = new Set(selectedCards);
        if (newSelected.has(cardId)) {
            newSelected.delete(cardId);
        } else {
            if (newSelected.size >= 100) {
                toast.warning('最多只能同时选择 100 张卡片');
                return;
            }
            newSelected.add(cardId);
        }
        setSelectedCards(newSelected);
    };

    const handleDeleteSelected = () => {
        if (selectedCards.size === 0) {
            toast.warning('请先选择要删除的卡片');
            return;
        }
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const data = await apiClient.post('/api/cards/delete', { ids: Array.from(selectedCards) });

            if (!data.success) {
                throw new Error(data.error?.message || '删除失败');
            }

            await loadData();
            setShowDeleteDialog(false);
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(formatApiError(error));
        }
    };

    // Edit card handlers
    const handleEditClick = (card: Card) => {
        setEditingCard(card);
        setShowEditModal(true);
    };

    const handleSaveCard = async (
        cardId: string,
        updates: {
            front: string;
            back: string;
            tags: string[];
            front_media?: string | null;
            back_media?: string | null;
        }
    ) => {
        const data = await apiClient.put(`/api/cards/${cardId}`, updates);

        if (!data.success) {
            throw new Error(data.error?.message || '保存失败');
        }
    };

    // Edit deck handler
    const handleSaveDeck = async (deckId: string, updates: { title: string; description: string }) => {
        const data = await apiClient.put(`/api/decks/${deckId}`, updates);

        if (!data.success) {
            throw new Error(data.error?.message || '保存失败');
        }

        // Update local deck state
        if (deck) {
            setDeck({ ...deck, ...updates });
        }
    };

    // Filter cards based on search query and status
    const filteredCards = cards.filter(card => {
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesSearch = (
                card.front.toLowerCase().includes(query) ||
                card.back.toLowerCase().includes(query)
            );
            if (!matchesSearch) return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (card.state !== statusFilter) return false;
        }

        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredCards.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCards = filteredCards.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    if (loading) return <MainLayout>加载中...</MainLayout>;
    if (!deck) return <MainLayout>卡组不存在</MainLayout>;

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => router.push('/decks')} className={styles.backButton}>
                        ← 返回列表
                    </button>
                    <div className={styles.titleRow}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h1 className={styles.title}>{deck.title}</h1>
                                <button
                                    className={styles.editDeckButton}
                                    onClick={() => setShowEditDeckModal(true)}
                                    title="编辑卡组信息"
                                >
                                    ✏️
                                </button>
                            </div>
                            <p className={styles.description}>{deck.description}</p>
                        </div>
                        <div className={styles.actionButtons}>
                            <button
                                className={styles.exportButton}
                                onClick={handleExportMarkdown}
                                disabled={cards.length === 0}
                            >
                                📄 导出 Markdown
                            </button>
                            <button className={styles.studyButton} onClick={() => router.push(`/study?deck=${deck.id}`)}>
                                开始学习 ({cards.length})
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.addCardSection}>
                        <div className={styles.sectionHeader}>
                            <h2>添加卡片</h2>
                            <div className={styles.headerButtons}>
                                <button
                                    className={`${styles.toggleBtn} ${styles.aiButton}`}
                                    onClick={() => setShowAIModal(true)}
                                >
                                    ✨ AI 生成
                                </button>
                                <button
                                    className={styles.toggleBtn}
                                    onClick={() => setShowAddForm(!showAddForm)}
                                >
                                    {showAddForm ? '收起' : '展开'}
                                </button>
                            </div>
                        </div>

                        {showAddForm && (
                            <form onSubmit={handleAddCard} className={styles.addForm}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>正面</label>
                                        <textarea
                                            value={newFront}
                                            onChange={e => setNewFront(e.target.value)}
                                            placeholder="问题 / 单词..."
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>背面</label>
                                        <textarea
                                            value={newBack}
                                            onChange={e => setNewBack(e.target.value)}
                                            placeholder="答案 / 解释..."
                                            rows={3}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className={styles.formActions}>
                                    <button
                                        type="submit"
                                        className={styles.submitBtn}
                                        disabled={submitting}
                                    >
                                        {submitting ? '保存中...' : '添加卡片'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Card List */}
                    <div className={styles.cardList}>
                        {/* Search Box */}
                        {cards.length > 0 && (
                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="🔍 搜索卡片（正面/背面）..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        className={styles.clearSearch}
                                        onClick={() => setSearchQuery('')}
                                        title="清空搜索"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Status Filter */}
                        {cards.length > 0 && (
                            <div className={styles.statusFilter}>
                                <button
                                    className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    全部
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${statusFilter === 'new' ? styles.active : ''}`}
                                    onClick={() => setStatusFilter('new')}
                                >
                                    新卡片
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${statusFilter === 'learning' ? styles.active : ''}`}
                                    onClick={() => setStatusFilter('learning')}
                                >
                                    学习中
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${statusFilter === 'review' ? styles.active : ''}`}
                                    onClick={() => setStatusFilter('review')}
                                >
                                    复习中
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${statusFilter === 'relearning' ? styles.active : ''}`}
                                    onClick={() => setStatusFilter('relearning')}
                                >
                                    重学中
                                </button>
                            </div>
                        )}

                        <div className={styles.cardListHeader}>
                            <h2>
                                已有卡片 ({filteredCards.length}
                                {searchQuery && ` / ${cards.length}`})
                            </h2>
                            {cards.length > 0 && (
                                <div className={styles.batchActions}>
                                    <button
                                        className={styles.selectAllBtn}
                                        onClick={handleSelectAll}
                                    >
                                        {selectedCards.size > 0 && paginatedCards.every(c => selectedCards.has(c.id))
                                            ? '取消当前页'
                                            : '全选当前页'}
                                    </button>
                                    {selectedCards.size > 0 && (
                                        <>
                                            <span className={styles.selectionCount}>
                                                已选 {selectedCards.size} 张
                                            </span>
                                            <button
                                                className={styles.deleteSelectedBtn}
                                                onClick={handleDeleteSelected}
                                            >
                                                🗑️ 删除选中 ({selectedCards.size})
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        {filteredCards.length === 0 ? (
                            <div className={styles.emptyState}>
                                {searchQuery ? '没有匹配的卡片' : '暂时没有卡片'}
                            </div>
                        ) : (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}></th>
                                            <th style={{ width: '35%' }}>正面</th>
                                            <th style={{ width: '35%' }}>背面</th>
                                            <th style={{ width: '15%' }}>状态</th>
                                            <th style={{ width: '15%' }}>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedCards.map(card => (
                                            <tr
                                                key={card.id}
                                                className={selectedCards.has(card.id) ? styles.selectedRow : ''}
                                            >
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCards.has(card.id)}
                                                        onChange={() => handleCardSelect(card.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={styles.checkbox}
                                                    />
                                                </td>
                                                <td className={styles.cell}>
                                                    {card.front}
                                                    <CardMediaDisplay frontMedia={card.front_media} backMedia={null} compact />
                                                </td>
                                                <td className={styles.cell}>
                                                    {card.back}
                                                    <CardMediaDisplay frontMedia={null} backMedia={card.back_media} compact />
                                                </td>
                                                <td>
                                                    <span className={`${styles.badge} ${styles[card.state]}`}>
                                                        {card.state}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className={styles.editButton}
                                                        onClick={() => handleEditClick(card)}
                                                        title="编辑卡片"
                                                    >
                                                        ✏️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {filteredCards.length > pageSize && (
                            <div className={styles.paginationContainer}>
                                <div className={styles.paginationInfo}>
                                    显示 {startIndex + 1}-{Math.min(endIndex, filteredCards.length)} / 共 {filteredCards.length} 张卡片
                                </div>
                                <div className={styles.paginationControls}>
                                    <button
                                        className={styles.pageButton}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        ← 上一页
                                    </button>
                                    <div className={styles.pageNumbers}>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                // Show first, last, and pages near current
                                                return page === 1 || page === totalPages ||
                                                    Math.abs(page - currentPage) <= 1;
                                            })
                                            .map((page, index, array) => (
                                                <React.Fragment key={page}>
                                                    {index > 0 && array[index - 1] !== page - 1 && (
                                                        <span className={styles.ellipsis}>...</span>
                                                    )}
                                                    <button
                                                        className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                                                        onClick={() => setCurrentPage(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </React.Fragment>
                                            ))
                                        }
                                    </div>
                                    <button
                                        className={styles.pageButton}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        下一页 →
                                    </button>
                                </div>
                                <div className={styles.pageSizeSelector}>
                                    <label>每页显示：</label>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className={styles.pageSizeSelect}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AIGeneratorModal
                isOpen={showAIModal}
                onClose={() => setShowAIModal(false)}
                deckId={deckId}
                onCardsAdded={loadData}
            />

            <EditCardModal
                isOpen={showEditModal}
                card={editingCard}
                userId={user?.id || ''}
                deckId={deckId}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingCard(null);
                    // Use setTimeout to ensure modal closes before reloading
                    setTimeout(() => {
                        loadData();
                    }, 100);
                }}
                onSave={handleSaveCard}
            />

            <EditDeckModal
                isOpen={showEditDeckModal}
                deck={deck}
                onClose={() => setShowEditDeckModal(false)}
                onSave={handleSaveDeck}
            />

            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="批量删除卡片"
                message={`确定要删除选中的 ${selectedCards.size} 张卡片吗？`}
                details="被删除的卡片将永久丢失，此操作不可恢复。"
                variant="danger"
                confirmText="删除"
                cancelText="取消"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteDialog(false)}
            />
        </MainLayout>
    );
}
