import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from '../locales/en';
import { es } from '../locales/es';

export type Language = 'en' | 'es';

const translations: Record<Language, typeof en> = { en, es };

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
    language: 'en',
    setLanguage: async () => {},
    t: (key) => key,
});

function resolveKey(tree: object, key: string): unknown {
    return key.split('.').reduce<unknown>((acc, part) => {
        if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
        return undefined;
    }, tree);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        AsyncStorage.getItem('userLanguage')
            .then((stored) => {
                if (stored === 'en' || stored === 'es') setLanguageState(stored);
            })
            .catch((error) => console.error('Error loading language:', error));
    }, []);

    const setLanguage = useCallback(async (lang: Language) => {
        setLanguageState(lang);
        await AsyncStorage.setItem('userLanguage', lang);
    }, []);

    const t = useCallback(
        (key: string, params?: Record<string, string | number>): string => {
            const value = resolveKey(translations[language], key) ?? resolveKey(translations.en, key);
            if (typeof value !== 'string') return key;
            if (!params) return value;
            return value.replace(/\{(\w+)\}/g, (match, name) =>
                params[name] !== undefined ? String(params[name]) : match
            );
        },
        [language]
    );

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useTranslation = () => useContext(LanguageContext);
