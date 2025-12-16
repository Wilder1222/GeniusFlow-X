import React from 'react';
import styles from './skeleton.module.css';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    width?: string | number;
    height?: string | number;
    circle?: boolean;
}

export function Skeleton({
    width,
    height,
    circle,
    className,
    style,
    ...props
}: SkeletonProps) {
    return (
        <div
            className={`${styles.skeleton} ${circle ? styles.circle : ''} ${className || ''}`}
            style={{
                width,
                height,
                ...style,
            }}
            {...props}
        />
    );
}
