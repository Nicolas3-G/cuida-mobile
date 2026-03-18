import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' },
    { code: 'so', label: 'Soomaali' },
];

export default function OnboardingScreen() {
    const router = useRouter();

    const handleLanguageSelect = async (code: string) => {
        try {
            await AsyncStorage.setItem('userLanguage', code);
            // Navigate to the next onboarding step
            router.push('/onboarding/location');
        } catch (error) {
            console.error('Error saving language selection:', error);
        }
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
                        Welcome to Cuida
                    </Text>
                    <Text className="px-4 text-center text-base text-[#6D4C41]">
                        To get started, please select your preferred language.
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
