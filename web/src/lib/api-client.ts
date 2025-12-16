/**
 * Global API Client with 401 Interceptor
 * Automatically redirects to login page when receiving 401 Unauthorized
 */

// Global flag to prevent multiple redirects
let isRedirecting = false;

/**
 * Wrapper around fetch that handles 401 responses globally
 */
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(url, options);

    // Handle 401 Unauthorized
    if (response.status === 401 && !isRedirecting) {
        isRedirecting = true;
        console.log('[API Client] 401 Unauthorized detected, redirecting to login...');

        // Use window.location for immediate redirect (works in both client and browser)
        setTimeout(() => {
            window.location.href = '/auth/login';
        }, 100);
    }

    return response;
}

/**
 * JSON wrapper for API fetch
 */
export async function apiJson<T = any>(url: string, options?: RequestInit): Promise<T> {
    const response = await apiFetch(url, options);

    // Don't try to parse JSON if we're being redirected
    if (response.status === 401) {
        throw new Error('Unauthorized');
    }

    return response.json();
}

/**
 * Convenience methods
 */
export const apiClient = {
    get: async <T = any>(url: string, options?: RequestInit): Promise<T> => {
        return apiJson<T>(url, { ...options, method: 'GET' });
    },

    post: async <T = any>(url: string, body?: any, options?: RequestInit): Promise<T> => {
        return apiJson<T>(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    },

    put: async <T = any>(url: string, body?: any, options?: RequestInit): Promise<T> => {
        return apiJson<T>(url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    },

    delete: async <T = any>(url: string, options?: RequestInit): Promise<T> => {
        return apiJson<T>(url, { ...options, method: 'DELETE' });
    },
};
