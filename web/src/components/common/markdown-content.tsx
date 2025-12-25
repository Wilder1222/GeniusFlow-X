'use client';

import ReactMarkdown from 'react-markdown';
import styles from './markdown-content.module.css';

interface MarkdownContentProps {
    content: string;
    className?: string;
}

/**
 * MarkdownContent - Renders markdown text with proper styling
 * Used for flashcard answers that contain formatted text, code, lists etc.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
    return (
        <div className={`${styles.markdown} ${className || ''}`}>
            <ReactMarkdown
                components={{
                    // Style code blocks
                    code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        return isInline ? (
                            <code className={styles.inlineCode} {...props}>{children}</code>
                        ) : (
                            <code className={styles.codeBlock} {...props}>{children}</code>
                        );
                    },
                    // Style pre blocks
                    pre: ({ children }) => (
                        <pre className={styles.pre}>{children}</pre>
                    ),
                    // Style lists
                    ul: ({ children }) => (
                        <ul className={styles.list}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className={styles.list}>{children}</ol>
                    ),
                    // Style paragraphs
                    p: ({ children }) => (
                        <p className={styles.paragraph}>{children}</p>
                    ),
                    // Style strong/bold
                    strong: ({ children }) => (
                        <strong className={styles.strong}>{children}</strong>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
