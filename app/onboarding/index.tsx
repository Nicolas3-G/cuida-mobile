import React from 'react';
import { View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text } from '../../components/Text';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation, type Language } from '../../contexts/LanguageContext';

// Portuguese and Somali are planned but not yet translated — see IDEAS.md
const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { t, setLanguage } = useTranslation();

    const handleLanguageSelect = (code: Language) => {
        // Navigate first: setLanguage triggers a root re-render, and doing it before
        // the push would drop the pending navigation (requiring a second tap).
        router.push('/onboarding/location');
        setLanguage(code).catch((error) =>
            console.error('Error saving language selection:', error)
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#fff6e8]">
            <View className="flex-1 px-6 pb-8 pt-12">

                {/* Header content */}
                <View className="mb-10 items-center">
                    <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-[#FBE9E7]">
                        <MaterialCommunityIcons name="earth" size={40} color="#BF360C" />
                    </View>
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
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                activeOpacity={0.7}
                                onPress={() => handleLanguageSelect(lang.code)}
                                className="mb-4 flex-row items-center rounded-2xl border border-[#D7CCC8] bg-[#fff6e8] p-5 shadow-md"
                            >
                                <View className="mr-4 h-6 w-6 items-center justify-center rounded-full border-2 border-[#BCAAA4]" />
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
