import { supabase } from './supabase';
import { API_BASE_URL } from '../services/ai.service'; // Keep it there for now or move to constants

async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

async function request<T>(
    method: string,
    endpoint: string,
    body?: any,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const token = await getAuthToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return {
                success: false,
                error: data.error?.message || `HTTP ${response.status}`
            };
        }

        return data; // Assume backend returns { success: true, data: ... }
    } catch (error: any) {
        console.error(`API ${method} ${endpoint} error:`, error);
        return {
            success: false,
            error: error.message || 'Unknown network error'
        };
    }
}

export const apiClient = {
    get: <T>(endpoint: string, options?: RequestInit) => request<T>('GET', endpoint, undefined, options),
    post: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>('POST', endpoint, body, options),
    put: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>('PUT', endpoint, body, options),
    delete: <T>(endpoint: string, options?: RequestInit) => request<T>('DELETE', endpoint, undefined, options),
};
