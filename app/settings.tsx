import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert, Linking } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { STATE_CITIES } from '../constants/stateCities';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' },
    { code: 'so', label: 'Soomaali' },
];

const US_STATES = [
    { name: 'Alabama', code: 'AL' }, { name: 'Alaska', code: 'AK' }, { name: 'Arizona', code: 'AZ' },
    { name: 'Arkansas', code: 'AR' }, { name: 'California', code: 'CA' }, { name: 'Colorado', code: 'CO' },
    { name: 'Connecticut', code: 'CT' }, { name: 'Delaware', code: 'DE' }, { name: 'Florida', code: 'FL' },
    { name: 'Georgia', code: 'GA' }, { name: 'Hawaii', code: 'HI' }, { name: 'Idaho', code: 'ID' },
    { name: 'Illinois', code: 'IL' }, { name: 'Indiana', code: 'IN' }, { name: 'Iowa', code: 'IA' },
    { name: 'Kansas', code: 'KS' }, { name: 'Kentucky', code: 'KY' }, { name: 'Louisiana', code: 'LA' },
    { name: 'Maine', code: 'ME' }, { name: 'Maryland', code: 'MD' }, { name: 'Massachusetts', code: 'MA' },
    { name: 'Michigan', code: 'MI' }, { name: 'Minnesota', code: 'MN' }, { name: 'Mississippi', code: 'MS' },
    { name: 'Missouri', code: 'MO' }, { name: 'Montana', code: 'MT' }, { name: 'Nebraska', code: 'NE' },
    { name: 'Nevada', code: 'NV' }, { name: 'New Hampshire', code: 'NH' }, { name: 'New Jersey', code: 'NJ' },
    { name: 'New Mexico', code: 'NM' }, { name: 'New York', code: 'NY' }, { name: 'North Carolina', code: 'NC' },
    { name: 'North Dakota', code: 'ND' }, { name: 'Ohio', code: 'OH' }, { name: 'Oklahoma', code: 'OK' },
    { name: 'Oregon', code: 'OR' }, { name: 'Pennsylvania', code: 'PA' }, { name: 'Rhode Island', code: 'RI' },
    { name: 'South Carolina', code: 'SC' }, { name: 'South Dakota', code: 'SD' }, { name: 'Tennessee', code: 'TN' },
    { name: 'Texas', code: 'TX' }, { name: 'Utah', code: 'UT' }, { name: 'Vermont', code: 'VT' },
    { name: 'Virginia', code: 'VA' }, { name: 'Washington', code: 'WA' }, { name: 'West Virginia', code: 'WV' },
    { name: 'Wisconsin', code: 'WI' }, { name: 'Wyoming', code: 'WY' }
];

export default function SettingsScreen() {
    const router = useRouter();
    const [language, setLanguage] = useState<string | null>(null);
    const [location, setLocation] = useState<string | null>(null);
    const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(true);

    // Inline editing state
    const [expandedItem, setExpandedItem] = useState<'language' | 'location' | null>(null);
    const [locationStateInput, setLocationStateInput] = useState('');
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [stateLevelOnly, setStateLevelOnly] = useState(false);
    const [filteredStates, setFilteredStates] = useState<{ name: string; code: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [showCityInfo, setShowCityInfo] = useState(false);

    const languageMap: Record<string, string> = {
        en: 'English',
        es: 'Español',
        pt: 'Português',
        so: 'Soomaali',
    };

    useEffect(() => {
        async function loadSettings() {
            try {
                const lang = await AsyncStorage.getItem('userLanguage');
                const loc = await AsyncStorage.getItem('userLocation');
                const stateCode = await AsyncStorage.getItem('userStateCode');
                const vib = await AsyncStorage.getItem('userVibrationEnabled');

                setLanguage(lang);
                setLocation(loc);
                if (stateCode) {
                    const matchedState = US_STATES.find(s => s.code === stateCode);
                    if (matchedState) {
                        setSelectedStateCode(stateCode);
                        setLocationStateInput(matchedState.name);
                        const stateCities = STATE_CITIES[stateCode as keyof typeof STATE_CITIES] || [];
                        if (loc && stateCities.includes(loc)) {
                            setSelectedCity(loc);
                            setStateLevelOnly(false);
                        } else {
                            setSelectedCity('');
                            setStateLevelOnly(true);
                        }
                    }
                } else if (loc) {
                    setLocationStateInput(loc);
                }
                if (vib !== null) setVibrationEnabled(vib === 'true');
            } catch (error) {
                console.error('Error loading settings:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, []);

    const handleSaveLanguage = async (code: string) => {
        try {
            await AsyncStorage.setItem('userLanguage', code);
            setLanguage(code);
            setExpandedItem(null);
        } catch (error) {
            console.error('Error saving language:', error);
        }
    };

    const resolvedStateCode =
        selectedStateCode ||
        US_STATES.find(s => s.name.toLowerCase() === locationStateInput.trim().toLowerCase())?.code ||
        '';

    useEffect(() => {
        if (!resolvedStateCode) {
            setSelectedCity('');
            setStateLevelOnly(false);
            return;
        }
        const stateCities = STATE_CITIES[resolvedStateCode as keyof typeof STATE_CITIES] || [];
        if (stateCities.length === 0) {
            setSelectedCity('');
            setStateLevelOnly(false);
            return;
        }
        if (!selectedCity || !stateCities.includes(selectedCity)) {
            setSelectedCity(stateCities[0]);
            setStateLevelOnly(false);
        }
    }, [resolvedStateCode]);

    const handleLocationInputChange = (text: string) => {
        setLocationStateInput(text);
        if (text.trim().length > 0) {
            const filtered = US_STATES.filter(state =>
                state.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredStates(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setFilteredStates([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectState = (state: { name: string; code: string }) => {
        setLocationStateInput(state.name);
        setSelectedStateCode(state.code);
        const stateCities = STATE_CITIES[state.code as keyof typeof STATE_CITIES];
        if (stateCities && stateCities.length > 0) {
            setSelectedCity(stateCities[0]);
            setStateLevelOnly(false);
        } else {
            setSelectedCity('');
            setStateLevelOnly(false);
        }
        setShowSuggestions(false);
    };

    const handleUseMyLocation = async () => {
        try {
            setIsLocating(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Location permission required',
                    'Please enable location access to use this feature.'
                );
                setIsLocating(false);
                return;
            }

            const currentPosition = await Location.getCurrentPositionAsync({});
            const results = await Location.reverseGeocodeAsync({
                latitude: currentPosition.coords.latitude,
                longitude: currentPosition.coords.longitude,
            });

            if (!results.length) {
                Alert.alert('Unable to detect location', 'Please try again or enter your state manually.');
                setIsLocating(false);
                return;
            }

            const place = results[0];
            const rawRegion = (place.region || '').trim();
            const rawSubregion = (place.subregion || '').trim();
            const rawCity = (place.city || '').trim();

            const possibleStateValues = [rawRegion, rawSubregion].filter(Boolean);

            let matchedState =
                US_STATES.find(s =>
                    possibleStateValues.some(v => v.toLowerCase() === s.name.toLowerCase())
                ) ||
                US_STATES.find(s =>
                    possibleStateValues.some(v => v.toUpperCase() === s.code)
                );

            if (!matchedState && possibleStateValues.length) {
                matchedState = US_STATES.find(s =>
                    possibleStateValues.some(v =>
                        v.toLowerCase().includes(s.name.toLowerCase())
                    )
                );
            }

            if (!matchedState) {
                Alert.alert(
                    'Unable to detect state',
                    'We could not match your state. Please enter it manually.'
                );
                setIsLocating(false);
                return;
            }

            setLocationStateInput(matchedState.name);
            setSelectedStateCode(matchedState.code);
            setShowSuggestions(false);

            const stateCities = STATE_CITIES[matchedState.code as keyof typeof STATE_CITIES] || [];
            const detectedCityName = rawCity || rawSubregion;
            if (detectedCityName && stateCities.includes(detectedCityName)) {
                setSelectedCity(detectedCityName);
                setStateLevelOnly(false);
            } else {
                setSelectedCity('');
                setStateLevelOnly(true);
            }
        } catch (error) {
            console.error('Error using current location:', error);
            Alert.alert('Error', 'Something went wrong while detecting your location.');
        } finally {
            setIsLocating(false);
        }
    };

    const handleSaveLocation = async () => {
        try {
            const trimmedState = locationStateInput.trim();
            if (!trimmedState) return;

            if (resolvedStateCode) {
                if (stateLevelOnly) {
                    const stateName =
                        US_STATES.find(s => s.code === resolvedStateCode)?.name || trimmedState;
                    await AsyncStorage.setItem('userLocation', stateName);
                    await AsyncStorage.setItem('userStateCode', resolvedStateCode);
                    setLocation(stateName);
                } else {
                    const stateCities = STATE_CITIES[resolvedStateCode as keyof typeof STATE_CITIES] || [];
                    const cityToSave = selectedCity || stateCities[0] || trimmedState;
                    await AsyncStorage.setItem('userLocation', cityToSave);
                    await AsyncStorage.setItem('userStateCode', resolvedStateCode);
                    setLocation(cityToSave);
                }
            } else {
                await AsyncStorage.setItem('userLocation', trimmedState);
                await AsyncStorage.removeItem('userStateCode');
                setLocation(trimmedState);
            }

            setExpandedItem(null);
        } catch (error) {
            console.error('Error saving location:', error);
        }
    };

    const handleToggleVibration = async () => {
        try {
            const newValue = !vibrationEnabled;
            await AsyncStorage.setItem('userVibrationEnabled', String(newValue));
            setVibrationEnabled(newValue);
        } catch (error) {
            console.error('Error saving vibration setting:', error);
        }
    };

    const handleRefreshData = () => {
        router.replace('/');
    };

    const handleResetOnboarding = async () => {
        try {
            await AsyncStorage.removeItem('hasSeenOnboarding');
            await AsyncStorage.removeItem('userLanguage');
            await AsyncStorage.removeItem('userLocation');
            await AsyncStorage.removeItem('userStateCode');
            router.replace('/onboarding');
        } catch (error) {
            console.error('Error resetting onboarding:', error);
        }
    };

    const handleSupportProject = async () => {
        try {
            const url = 'https://ko-fi.com/cuida';
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Unable to open link', 'Please try again later.');
            }
        } catch (error) {
            console.error('Error opening support link:', error);
            Alert.alert('Unable to open link', 'Please try again later.');
        }
    };

    const handleSendFeedback = () => {
        router.push('/feedback');
    };

    const toggleExpand = (item: 'language' | 'location') => {
        if (expandedItem === item) {
            setExpandedItem(null);
        } else {
            setExpandedItem(item);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-[#fff6e8]">
                <ActivityIndicator size="large" color="#C2185B" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#fff6e8]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 px-4 pt-6">
                    <View className="mb-4">
                        <View className="relative items-center justify-center">
                            <Text className="text-2xl font-extrabold text-slate-800 text-center">
                                Settings
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                activeOpacity={0.8}
                                className="absolute right-0 w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
                            >
                                <Ionicons name="close" size={18} color="#1e293b" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-2">
                        Preferences
                    </Text>

                    <View className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">

                        {/* ------------- Language Segment ------------- */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => toggleExpand('language')}
                            className="flex-row items-center justify-between p-4 border-b border-slate-100"
                        >
                            <View className="flex-row items-center">
                                <View className="mr-3">
                                    <MaterialCommunityIcons name="earth" size={20} color="#6D4C41" />
                                </View>
                                <Text className="text-base font-semibold text-slate-700">Language</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Text className="text-base text-slate-500 mr-2">
                                    {language ? languageMap[language] : 'Not Set'}
                                </Text>
                                <Text className="text-slate-400 text-lg">
                                    {expandedItem === 'language' ? '▲' : '▼'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Language Dropdown Content */}
                        {expandedItem === 'language' && (
                            <View className="bg-slate-50 border-b border-slate-100 px-4 py-2">
                                {LANGUAGES.map((lang) => (
                                    <TouchableOpacity
                                        key={lang.code}
                                        activeOpacity={0.7}
                                        onPress={() => handleSaveLanguage(lang.code)}
                                        className={`flex-row items-center justify-between p-3 my-1 rounded-xl ${language === lang.code ? 'bg-orange-100' : 'bg-transparent'
                                            }`}
                                    >
                                        <Text className={`text-base ${language === lang.code ? 'font-bold text-orange-900' : 'text-slate-700'}`}>
                                            {lang.label}
                                        </Text>
                                        {language === lang.code && (
                                            <Text className="text-orange-600 text-lg font-bold">✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* ------------- Location Segment ------------- */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => toggleExpand('location')}
                            className="flex-row items-center justify-between p-4 border-b border-slate-100"
                        >
                            <View className="flex-row items-center">
                                <View className="mr-3">
                                    <MaterialCommunityIcons name="map-marker-outline" size={20} color="#6D4C41" />
                                </View>
                                <Text className="text-base font-semibold text-slate-700">Location</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Text className="text-base text-slate-500 mr-2">
                                    {location || 'Not Set'}
                                </Text>
                                <Text className="text-slate-400 text-lg">
                                    {expandedItem === 'location' ? '▲' : '▼'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* ------------- Vibration Segment ------------- */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleToggleVibration}
                            className="flex-row items-center justify-between p-4 border-b border-slate-100"
                        >
                            <View className="flex-row items-center">
                                <View className="mr-3">
                                    <MaterialCommunityIcons
                                        name={vibrationEnabled ? "vibrate" : "vibrate-off"}
                                        size={20}
                                        color="#6D4C41"
                                    />
                                </View>
                                <Text className="text-base font-semibold text-slate-700">Vibrations</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Text className={`text-base font-bold ${vibrationEnabled ? 'text-orange-600' : 'text-slate-400'}`}>
                                    {vibrationEnabled ? 'ON' : 'OFF'}
                                </Text>
                                <View
                                    className={`w-10 h-6 rounded-full ml-3 items-start justify-center px-1 ${vibrationEnabled ? 'bg-orange-600' : 'bg-slate-300'}`}
                                >
                                    <View
                                        className={`w-4 h-4 bg-white rounded-full ${vibrationEnabled ? 'self-end' : 'self-start'}`}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* ------------- Refresh data ------------- */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleRefreshData}
                            className="flex-row items-center justify-between p-4 border-b border-slate-100"
                        >
                            <View className="flex-row items-center">
                                <View className="mr-3">
                                    <MaterialCommunityIcons name="refresh" size={20} color="#6D4C41" />
                                </View>
                                <Text className="text-base font-semibold text-slate-700">Refresh data</Text>
                            </View>
                            <Text className="text-slate-400 text-lg">›</Text>
                        </TouchableOpacity>

                        {/* ------------- Reset onboarding (Alerts) ------------- */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleResetOnboarding}
                            className="flex-row items-center justify-between p-4"
                        >
                            <View className="flex-row items-center">
                                <View className="mr-3">
                                    <MaterialCommunityIcons name="alert-outline" size={20} color="#6D4C41" />
                                </View>
                                <Text className="text-base font-semibold text-slate-700">Reset onboarding</Text>
                            </View>
                            <Text className="text-slate-400 text-lg">›</Text>
                        </TouchableOpacity>

                        {/* ------------- Feedback ------------- */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleSendFeedback}
                            className="flex-row items-center justify-between p-4 border-t border-slate-100"
                        >
                            <View className="flex-row items-center">
                                <View className="mr-3">
                                    <MaterialCommunityIcons name="message-text-outline" size={20} color="#6D4C41" />
                                </View>
                                <Text className="text-base font-semibold text-slate-700">Send feedback</Text>
                            </View>
                            <Text className="text-slate-400 text-lg">›</Text>
                        </TouchableOpacity>

                        {/* Location Dropdown Content */}
                        {expandedItem === 'location' && (
                            <View className="border-t border-slate-200 bg-[#fff6e8] p-4">
                                <Text className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                                    US State
                                </Text>
                                <View className="mb-2">
                                    <TextInput
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-800"
                                        placeholder="Type your state (e.g. California)"
                                        placeholderTextColor="#94a3b8"
                                        value={locationStateInput}
                                        onChangeText={handleLocationInputChange}
                                        autoCapitalize="words"
                                    />

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={handleUseMyLocation}
                                        disabled={isLocating}
                                        className={`mt-2 flex-row items-center self-start rounded-full border border-slate-300 bg-slate-50 py-2 px-3 ${isLocating ? 'opacity-70' : 'opacity-100'}`}
                                    >
                                        {isLocating ? (
                                            <ActivityIndicator size="small" color="#475569" />
                                        ) : (
                                            <>
                                                <View className="mr-1.5">
                                                    <Ionicons name="locate-outline" size={16} color="#475569" />
                                                </View>
                                                <Text className="text-[13px] font-semibold text-slate-600">
                                                    Use my location
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    {showSuggestions && (
                                        <View className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                            {filteredStates.map(state => (
                                                <TouchableOpacity
                                                    key={state.code}
                                                    activeOpacity={0.7}
                                                    onPress={() => handleSelectState(state)}
                                                    className="border-b border-slate-100 px-3.5 py-2.5"
                                                >
                                                    <Text className="text-[15px] text-slate-700">{state.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                {resolvedStateCode && (
                                    <View className="mt-2">
                                        <View className="mb-2 ml-0.5 flex-row items-center justify-start gap-1.5">
                                            <Text className="text-xs font-bold uppercase tracking-wide text-slate-600">
                                                City options
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => setShowCityInfo(prev => !prev)}
                                                activeOpacity={0.7}
                                                className="h-5 w-5 items-center justify-center rounded-full bg-orange-100"
                                            >
                                                <Ionicons name="information-circle-outline" size={14} color="#F97316" />
                                            </TouchableOpacity>
                                        </View>
                                        {showCityInfo && (
                                            <View className="mx-0.5 mb-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                                <Text className="text-[13px] text-slate-500">
                                                    We currently only support these cities. If you prefer state-wide data,
                                                    you can choose &quot;State level only&quot; instead.
                                                </Text>
                                            </View>
                                        )}
                                        <View className="flex-row flex-wrap">
                                            {(STATE_CITIES[resolvedStateCode as keyof typeof STATE_CITIES] || []).map(city => {
                                                const isSelected = city === selectedCity && !stateLevelOnly;
                                                return (
                                                    <TouchableOpacity
                                                        key={city}
                                                        onPress={() => {
                                                            setSelectedCity(city);
                                                            setStateLevelOnly(false);
                                                        }}
                                                        activeOpacity={0.8}
                                                        className={`mb-2 mr-2 rounded-full border py-1.5 px-3 ${isSelected ? 'border-orange-600 bg-orange-50' : 'border-slate-200 bg-white'}`}
                                                    >
                                                        <Text
                                                            className={`text-[13px] font-semibold ${isSelected ? 'text-orange-900' : 'text-slate-600'}`}
                                                        >
                                                            {city}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                setStateLevelOnly(true);
                                                setSelectedCity('');
                                            }}
                                            className={`mt-2 self-start rounded-full border py-1.5 px-3 ${stateLevelOnly ? 'border-orange-600 bg-orange-50' : 'border-slate-200 bg-white'}`}
                                        >
                                            <Text
                                                className={`text-[13px] font-semibold ${stateLevelOnly ? 'text-orange-900' : 'text-slate-600'}`}
                                            >
                                                State level only
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <View className="mt-4 flex-row justify-end">
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={handleSaveLocation}
                                        disabled={!locationStateInput.trim()}
                                        className={`rounded-xl py-2.5 px-[18px] ${locationStateInput.trim() ? 'bg-orange-600' : 'bg-slate-300'}`}
                                    >
                                        <Text className="text-sm font-bold text-white">Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                    </View>

                    <View className="mt-auto pb-4">
                        <Text className="text-center text-slate-500 text-xs mb-2 px-4">
                            Cuida is a free platform built by a solo immigrant developer. Your support helps keep it running.
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleSupportProject}
                            className="w-full rounded-[14px] py-[14px] items-center bg-[#F57C00]"
                        >
                            <Text className="text-white text-[15px] font-bold">
                                Support the project
                            </Text>
                        </TouchableOpacity>

                        <Text className="text-center text-slate-400 text-xs mt-3">
                            Cuida App Version 1.0.0
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
