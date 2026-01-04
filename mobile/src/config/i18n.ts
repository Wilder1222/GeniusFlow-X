import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import zh from '../locales/zh.json';

const LANGUAGE_KEY = 'user-language';

const resources = {
    en: { translation: en },
    zh: { translation: zh },
};

const initI18n = async () => {
    let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    if (!savedLanguage) {
        // Detect system language with safe fallback
        const locales = Localization.getLocales();
        const systemLanguage = locales?.[0]?.languageCode || 'en';
        savedLanguage = systemLanguage === 'zh' ? 'zh' : 'en';
    }

    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: savedLanguage,
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
        });
};

initI18n();

export default i18n;
