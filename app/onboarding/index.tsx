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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff6e8' }}>
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 }}>

                {/* Header content */}
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <View style={{ width: 80, height: 80, backgroundColor: '#FBE9E7', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                        <MaterialCommunityIcons name="earth" size={40} color="#BF360C" />
                    </View>
                    <Text style={{ fontSize: 32, fontWeight: '800', color: '#4E342E', textAlign: 'center', marginBottom: 12 }}>
                        Welcome to Cuida
                    </Text>
                    <Text style={{ fontSize: 16, color: '#6D4C41', textAlign: 'center', paddingHorizontal: 16 }}>
                        To get started, please select your preferred language.
                    </Text>
                </View>

                {/* Language Selection List */}
                <View style={{ flex: 1 }}>
                    {LANGUAGES.map((lang) => {
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                activeOpacity={0.7}
                                onPress={() => handleLanguageSelect(lang.code)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 20,
                                    marginBottom: 16,
                                    borderRadius: 16,
                                    backgroundColor: '#fff6e8',
                                    borderWidth: 1,
                                    borderColor: '#D7CCC8',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 8,
                                    elevation: 2
                                }}
                            >
                                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, marginRight: 16, alignItems: 'center', justifyContent: 'center', borderColor: '#BCAAA4' }} />
                                <Text style={{ fontSize: 18, fontWeight: '600', color: '#4E342E' }}>
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
