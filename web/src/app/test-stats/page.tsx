'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

export default function StatsTestPage() {
    const [results, setResults] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const testAPI = async (endpoint: string, name: string) => {
        setLoading(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: '' }));

        try {
            const data = await apiClient.get(endpoint);

            if (!data.success) {
                setErrors(prev => ({ ...prev, [name]: `API Error: ${data.error?.message || 'Unknown error'}` }));
            } else {
                setResults(prev => ({ ...prev, [name]: data }));
            }
        } catch (err: any) {
            setErrors(prev => ({ ...prev, [name]: err.message }));
        } finally {
            setLoading(prev => ({ ...prev, [name]: false }));
        }
    };

    const apis = [
        { name: 'Overview', endpoint: '/api/stats/overview' },
        { name: 'Heatmap', endpoint: '/api/stats/heatmap' },
        { name: 'Retention', endpoint: '/api/stats/retention' }
    ];

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px' }}>
            <h1>Stats API Test Suite</h1>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {apis.map(api => (
                    <button
                        key={api.name}
                        onClick={() => testAPI(api.endpoint, api.name)}
                        disabled={loading[api.name]}
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            cursor: loading[api.name] ? 'not-allowed' : 'pointer',
                            background: results[api.name] ? '#4caf50' : errors[api.name] ? '#f44336' : '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        {loading[api.name] ? 'Testing...' : `Test ${api.name}`}
                    </button>
                ))}
            </div>

            {apis.map(api => (
                <div key={api.name} style={{ marginBottom: '30px' }}>
                    <h2>{api.name} API - {api.endpoint}</h2>

                    {errors[api.name] && (
                        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '10px', borderRadius: '4px' }}>
                            <strong>Error:</strong> {errors[api.name]}
                        </div>
                    )}

                    {results[api.name] && (
                        <div style={{ padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
                            <strong>✅ Success!</strong>
                            <pre style={{ marginTop: '10px', overflow: 'auto', maxHeight: '300px', background: 'white', padding: '10px', borderRadius: '4px' }}>
                                {JSON.stringify(results[api.name], null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
