/**
 * Root Layout - 根布局
 * 
 * 配置全局提供者和初始化
 */

import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <StatusBar style="auto" />
                        <Slot />
                        <FlashMessage position="top" />
                    </AuthProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
