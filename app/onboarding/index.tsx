import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Text } from '../../components/Text';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation, type Language } from '../../contexts/LanguageContext';

// Portuguese and Somali are planned but not yet translated — see IDEAS.md
const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { t, setLanguage } = useTranslation();
    // Starts empty on purpose — nothing is pre-selected, so the screen reads as
    // "make a choice" rather than showing a default that was never picked.
    const [selected, setSelected] = useState<Language | null>(null);
    const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Don't leave a pending navigation behind if the screen goes away first.
    useEffect(
        () => () => {
            if (navTimer.current) clearTimeout(navTimer.current);
        },
        []
    );

    // Pushing to the next screen leaves this one mounted, so coming back would
    // still have a language selected — and the in-flight guard below would then
    // swallow every tap. Clear it whenever the screen regains focus.
    useFocusEffect(
        useCallback(() => {
            setSelected(null);
        }, [])
    );

    const handleLanguageSelect = (code: Language) => {
        if (selected) return; // a choice is already in flight; ignore extra taps
        setSelected(code);
        setLanguage(code).catch((error) =>
            console.error('Error saving language selection:', error)
        );
        // Brief pause so the filled radio registers before the screen changes.
        // Navigating after the language state settles also avoids the race that
        // used to drop the push and require a second tap.
        navTimer.current = setTimeout(() => router.push('/onboarding/location'), 220);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#fff6e8]">
            <View className="flex-1 px-6 pb-8 pt-12">

                {/* Header content */}
                <View className="mb-10 items-center">
                    <Image
                        source={require('../../assets/images/cuida-logo-transparent.png')}
                        style={{ width: 156, height: 156, marginBottom: 24 }}
                        resizeMode="contain"
                    />
                    <Text className="mb-3 text-center text-[32px] font-extrabold text-[#4E342E]">
                        {t('onboarding.welcomeTitle')}
                    </Text>
                    <Text className="px-4 text-center text-base text-[#6D4C41]">
                        {t('onboarding.welcomeSubtitle')}
                    </Text>
                </View>

                {/* Language Selection List */}
                <View className="flex-1">
                    {LANGUAGES.map((lang) => {
                        const isSelected = selected === lang.code;
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                activeOpacity={0.7}
                                onPress={() => handleLanguageSelect(lang.code)}
                                className={`mb-4 flex-row items-center rounded-2xl border p-5 shadow-md ${
                                    isSelected
                                        ? 'border-[#E2725B] bg-[#FBE9E7]'
                                        : 'border-[#D7CCC8] bg-[#fff6e8]'
                                }`}
                            >
                                <View
                                    className={`mr-4 h-6 w-6 items-center justify-center rounded-full border-2 ${
                                        isSelected ? 'border-[#E2725B]' : 'border-[#BCAAA4]'
                                    }`}
                                >
                                    {isSelected && (
                                        <View className="h-3 w-3 rounded-full bg-[#E2725B]" />
                                    )}
                                </View>
                                <Text className="text-[18px] font-semibold text-[#4E342E]">
                                    {lang.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

            </View>
        </SafeAreaView>
    );
}
