'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches rendering errors and displays a fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '100px auto'
                }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>😵 出错了</h1>
                    <p style={{ color: '#666', marginBottom: '24px' }}>
                        抱歉，页面遇到了一些问题。
                    </p>
                    {this.state.error && (
                        <details style={{
                            background: '#f5f5f5',
                            padding: '16px',
                            borderRadius: '8px',
                            textAlign: 'left',
                            marginBottom: '24px'
                        }}>
                            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                                错误详情
                            </summary>
                            <pre style={{
                                fontSize: '12px',
                                overflow: 'auto',
                                color: '#c62828'
                            }}>
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        刷新页面
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
