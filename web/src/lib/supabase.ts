import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 开发模式：如果没有配置 Supabase，使用占位符
const isDevelopment = process.env.NODE_ENV === 'development';
const hasCredentials = !!(supabaseUrl && supabaseAnonKey);

if (!hasCredentials && isDevelopment) {
    console.warn('⚠️  Supabase 未配置！请查看 SUPABASE_SETUP.md 了解配置步骤。');
    console.warn('   当前使用开发模式，认证功能将不可用。');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
        auth: {
            autoRefreshToken: hasCredentials,
            persistSession: hasCredentials,
            detectSessionInUrl: hasCredentials,
            // Session过期时间设置为48小时（172800秒）
            storageKey: 'geniusflow-x-auth',
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
        global: {
            headers: {
                'x-session-timeout': '172800', // 48 hours in seconds
            },
        },
    }
);

export const isSupabaseConfigured = hasCredentials;
