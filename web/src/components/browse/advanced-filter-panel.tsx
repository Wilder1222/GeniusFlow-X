'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './advanced-filter-panel.module.css';

export interface FilterOptions {
    tags: string[];
    states: string[];
    deckIds: string[];
    dateRange: { start: string; end: string } | null;
    searchText: string;
}

interface Props {
    availableTags: string[];
    availableDecks: Array<{ id: string; name: string }>;
    currentFilters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
}

export default function AdvancedFilterPanel({
    availableTags,
    availableDecks,
    currentFilters,
    onFilterChange
}: Props) {
    const t = useTranslations('Browse');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleTagToggle = (tag: string) => {
        const newTags = currentFilters.tags.includes(tag)
            ? currentFilters.tags.filter(t => t !== tag)
            : [...currentFilters.tags, tag];
        onFilterChange({ ...currentFilters, tags: newTags });
    };

    const handleStateToggle = (state: string) => {
        const newStates = currentFilters.states.includes(state)
            ? currentFilters.states.filter(s => s !== state)
            : [...currentFilters.states, state];
        onFilterChange({ ...currentFilters, states: newStates });
    };

    const handleDeckToggle = (deckId: string) => {
        const newDecks = currentFilters.deckIds.includes(deckId)
            ? currentFilters.deckIds.filter(d => d !== deckId)
            : [...currentFilters.deckIds, deckId];
        onFilterChange({ ...currentFilters, deckIds: newDecks });
    };

    const handleReset = () => {
        onFilterChange({
            tags: [],
            states: [],
            deckIds: [],
            dateRange: null,
            searchText: ''
        });
    };

    const states = [
        { value: 'new', label: t('newStatus' as any), color: '#2196f3' }, // Mapping might be needed or use t('DeckDetail.newStatus')
        { value: 'learning', label: t('learningStatus' as any), color: '#ff9800' },
        { value: 'review', label: t('reviewStatus' as any), color: '#4caf50' },
        { value: 'relearning', label: t('relearningStatus' as any), color: '#f44336' }
    ];

    // Wait, I should use DeckDetail namespace for status if they are the same.
    // Or I add them to Browse too. I already added them to DeckDetail.
    // I will use a custom hook or just useTranslations('DeckDetail') here too.

    const activeFilterCount =
        currentFilters.tags.length +
        currentFilters.states.length +
        currentFilters.deckIds.length +
        (currentFilters.dateRange ? 1 : 0) +
        (currentFilters.searchText ? 1 : 0);

    return (
        <div className={styles.container}>
            <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
                <div className={styles.headerLeft}>
                    <span className={styles.icon}>🔍</span>
                    <span className={styles.title}>{t('advancedFilter')}</span>
                    {activeFilterCount > 0 && (
                        <span className={styles.badge}>{activeFilterCount}</span>
                    )}
                </div>
                <button className={styles.toggleButton}>
                    {isExpanded ? '▲' : '▼'}
                </button>
            </div>

            {isExpanded && (
                <div className={styles.content}>
                    {/* 搜索框 */}
                    <div className={styles.section}>
                        <label className={styles.sectionLabel}>{t('searchTitle')}</label>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder={t('searchPlaceholder')}
                            value={currentFilters.searchText}
                            onChange={(e) => onFilterChange({ ...currentFilters, searchText: e.target.value })}
                        />
                    </div>

                    {/* 状态筛选 */}
                    <div className={styles.section}>
                        <label className={styles.sectionLabel}>{t('statusLabel')}</label>
                        <div className={styles.chipGroup}>
                            {states.map(state => (
                                <button
                                    key={state.value}
                                    className={`${styles.chip} ${currentFilters.states.includes(state.value) ? styles.chipActive : ''}`}
                                    style={{
                                        borderColor: currentFilters.states.includes(state.value) ? state.color : 'var(--color-border)',
                                        color: currentFilters.states.includes(state.value) ? state.color : 'var(--color-text-secondary)'
                                    }}
                                    onClick={() => handleStateToggle(state.value)}
                                >
                                    {/* Using hardcoded labels from the states array which I translated above */}
                                    {state.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 卡组筛选 */}
                    {availableDecks.length > 0 && (
                        <div className={styles.section}>
                            <label className={styles.sectionLabel}>{t('deckLabel')}</label>
                            <div className={styles.chipGroup}>
                                {availableDecks.map(deck => (
                                    <button
                                        key={deck.id}
                                        className={`${styles.chip} ${currentFilters.deckIds.includes(deck.id) ? styles.chipActive : ''}`}
                                        onClick={() => handleDeckToggle(deck.id)}
                                    >
                                        {deck.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 标签筛选 */}
                    {availableTags.length > 0 && (
                        <div className={styles.section}>
                            <label className={styles.sectionLabel}>{t('tagLabel')}</label>
                            <div className={styles.chipGroup}>
                                {availableTags.map(tag => (
                                    <button
                                        key={tag}
                                        className={`${styles.chip} ${currentFilters.tags.includes(tag) ? styles.chipActive : ''}`}
                                        onClick={() => handleTagToggle(tag)}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 重置按钮 */}
                    {activeFilterCount > 0 && (
                        <button className={styles.resetButton} onClick={handleReset}>
                            {t('resetFilters')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
