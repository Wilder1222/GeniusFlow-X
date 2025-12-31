/**
 * Index Screen - 应用入口
 * 
 * 检查认证状态并导航到相应页面
 */

import { useEffect } from 'react';
import { router } from 'expo-router';
import { LoadingSpinner } from '../src/components/common';
import { useAuth } from '../src/contexts/AuthContext';

export default function IndexScreen() {
    const { session, isInitialLoading } = useAuth();

    useEffect(() => {
        if (!isInitialLoading) {
            if (session) {
                router.replace('/(tabs)/home');
            } else {
                router.replace('/auth/login');
            }
        }
    }, [session, isInitialLoading]);

    return <LoadingSpinner fullScreen text="加载中..." />;
}
