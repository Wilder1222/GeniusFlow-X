import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';

export const SyncStatusIndicator = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
        });
        return () => unsubscribe();
    }, []);

    if (!isOffline) return null;

    return (
        <View style={[styles.container, { backgroundColor: '#FF5252' }]}>
            <Ionicons name="cloud-offline-outline" size={14} color="#FFFFFF" />
            <Text style={styles.text}>{t('common.offline_mode') || 'Offline Mode'}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
});
