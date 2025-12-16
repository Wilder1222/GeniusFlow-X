'use client';

import React, { useState } from 'react';
import styles from './card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    front: React.ReactNode;
    back: React.ReactNode;
    isFlipped?: boolean;
    onFlip?: () => void;
    variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
    front,
    back,
    isFlipped = false,
    onFlip,
    variant = 'default',
    className = '',
    ...props
}) => {
    const [flipped, setFlipped] = useState(isFlipped);

    const handleClick = () => {
        setFlipped(!flipped);
        onFlip?.();
    };

    return (
        <div
            className={`${styles.cardContainer} ${className}`}
            onClick={handleClick}
            {...props}
        >
            <div className={`${styles.card} ${styles[variant]} ${flipped ? styles.flipped : ''}`}>
                <div className={styles.cardFace} data-side="front">
                    {front}
                </div>
                <div className={styles.cardFace} data-side="back">
                    {back}
                </div>
            </div>
        </div>
    );
};
