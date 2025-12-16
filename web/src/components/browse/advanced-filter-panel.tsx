'use client';

import React, { useState } from 'react';
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
        { value: 'new', label: '新卡片', color: '#2196f3' },
        { value: 'learning', label: '学习中', color: '#ff9800' },
        { value: 'review', label: '复习中', color: '#4caf50' },
        { value: 'relearning', label: '重学中', color: '#f44336' }
    ];

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
                    <span className={styles.title}>高级筛选</span>
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
                        <label className={styles.sectionLabel}>搜索关键词</label>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="搜索正面或背面内容..."
                            value={currentFilters.searchText}
                            onChange={(e) => onFilterChange({ ...currentFilters, searchText: e.target.value })}
                        />
                    </div>

                    {/* 状态筛选 */}
                    <div className={styles.section}>
                        <label className={styles.sectionLabel}>卡片状态</label>
                        <div className={styles.chipGroup}>
                            {states.map(state => (
                                <button
                                    key={state.value}
                                    className={`${styles.chip} ${currentFilters.states.includes(state.value) ? styles.chipActive : ''}`}
                                    style={{
                                        borderColor: currentFilters.states.includes(state.value) ? state.color : '#e0e0e0',
                                        color: currentFilters.states.includes(state.value) ? state.color : '#666'
                                    }}
                                    onClick={() => handleStateToggle(state.value)}
                                >
                                    {state.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 卡组筛选 */}
                    {availableDecks.length > 0 && (
                        <div className={styles.section}>
                            <label className={styles.sectionLabel}>卡组</label>
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
                            <label className={styles.sectionLabel}>标签</label>
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
                            重置所有筛选
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
