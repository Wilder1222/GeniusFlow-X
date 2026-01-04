'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
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
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // Style code blocks
                    code: ({ className, children, ...props }: any) => {
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
                    // Style headings
                    h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
                    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
                    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
                    // Style tables
                    table: ({ children }) => (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>{children}</table>
                        </div>
                    ),
                    th: ({ children }) => <th className={styles.th}>{children}</th>,
                    td: ({ children }) => <td className={styles.td}>{children}</td>,
                    // Style blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className={styles.blockquote}>{children}</blockquote>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
