'use client';

import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import styles from './latex-renderer.module.css';

interface Props {
    content: string;
    displayMode?: boolean; // true for block, false for inline
}

export default function LatexRenderer({ content, displayMode = false }: Props) {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (containerRef.current && content) {
            try {
                katex.render(content, containerRef.current, {
                    displayMode,
                    throwOnError: false,
                    errorColor: '#cc0000',
                    strict: false,
                    trust: false,
                    macros: {
                        "\\RR": "\\mathbb{R}",
                        "\\NN": "\\mathbb{N}",
                        "\\ZZ": "\\mathbb{Z}",
                        "\\QQ": "\\mathbb{Q}"
                    }
                });
            } catch (error) {
                console.error('LaTeX render error:', error);
                if (containerRef.current) {
                    containerRef.current.textContent = content;
                }
            }
        }
    }, [content, displayMode]);

    return (
        <span
            ref={containerRef}
            className={displayMode ? styles.displayMode : styles.inlineMode}
        />
    );
}

/**
 * Parse text and render LaTeX
 * Supports: $inline$ and $$block$$
 */
export function renderTextWithLatex(text: string): React.ReactNode[] {
    if (!text) return [];

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Match $$...$$  or $...$
    const regex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        // Add LaTeX
        const latex = match[1] || match[2];
        const isBlock = !!match[1];

        parts.push(
            <LatexRenderer
                key={match.index}
                content={latex}
                displayMode={isBlock}
            />
        );

        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
}
