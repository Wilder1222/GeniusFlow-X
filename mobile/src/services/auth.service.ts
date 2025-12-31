/**
 * Auth Service - 认证服务
 * 
 * 处理用户注册、登录、退出、资料更新等逻辑
 */

import { supabase } from '../lib/supabase';
import { REGEX, ERROR_MESSAGES } from '../config/constants';
import {
    AuthResponse,
    SignInCredentials,
    SignUpCredentials,
    UpdateProfileData
} from '../types/auth'; // 稍后创建这个类型文件

export const authService = {
    /**
     * 邮箱密码登录
     */
    async signIn({ email, password }: SignInCredentials): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error: any) {
            console.error('SignIn Error:', error.message);
            return { data: null, error: error.message || ERROR_MESSAGES.AUTH_ERROR };
        }
    },

    /**
     * 邮箱密码注册
     */
    async signUp({ email, password, username }: SignUpCredentials): Promise<AuthResponse> {
        try {
            // 1. 创建用户认证
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        full_name: username,
                    },
                },
            });

            if (error) throw error;

            // Supabase 的 signUp 在某些配置下即使成功也可能 data.user 为 null (比如需要邮箱验证且未验证)
            // 但在我们的简单配置中，通常会直接创建 profile

            return { data, error: null };
        } catch (error: any) {
            console.error('SignUp Error:', error.message);
            return { data: null, error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    },

    /**
     * 退出登录
     */
    async signOut(): Promise<{ error: string | null }> {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error('SignOut Error:', error.message);
            return { error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    },

    /**
     * 获取当前会话/用户
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return { user, error: null };
        } catch (error: any) {
            return { user: null, error: error.message };
        }
    },

    /**
     * 获取当前会话
     */
    async getSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            return { session, error: null };
        } catch (error: any) {
            return { session: null, error: error.message };
        }
    },

    /**
     * 更新用户个人资料
     */
    async updateProfile(userId: string, data: UpdateProfileData) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: data.username,
                    full_name: data.full_name,
                    avatar_url: data.avatar_url,
                    bio: data.bio,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error('UpdateProfile Error:', error.message);
            return { error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
        }
    },

    /**
     * 获取用户 Profiles 详情
     */
    async getProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    study_stats(
                        current_streak,
                        longest_streak,
                        total_cards_reviewed,
                        total_study_time_minutes
                    )
                `)
                .eq('id', userId)
                .single();

            if (error) throw error;

            // 平坦化统计数据
            const stats = (data as any).study_stats?.[0] || {};
            const profile = {
                ...data,
                current_streak: stats.current_streak || 0,
                longest_streak: stats.longest_streak || 0,
                total_cards_reviewed: stats.total_cards_reviewed || 0,
                total_study_time_minutes: stats.total_study_time_minutes || 0,
            };

            return { data: profile as any, error: null };
        } catch (error: any) {
            console.error('GetProfile Error:', error.message);
            return { data: null, error: error.message };
        }
    }
};
