import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { STATE_CITIES } from '../../constants/stateCities';
import * as Location from 'expo-location';

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

export default function LocationScreen() {
    const router = useRouter();
    const [location, setLocation] = useState('');
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [stateLevelOnly, setStateLevelOnly] = useState(false);
    const [showCityInfo, setShowCityInfo] = useState(false);
    const [filteredStates, setFilteredStates] = useState<{ name: string; code: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const resolvedStateCode =
        selectedStateCode ||
        US_STATES.find(s => s.name.toLowerCase() === location.trim().toLowerCase())?.code ||
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

    const handleInputChange = (text: string) => {
        setLocation(text);
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
        setLocation(state.name);
        setSelectedStateCode(state.code);
        const stateCities = STATE_CITIES[state.code as keyof typeof STATE_CITIES];
        setSelectedCity(stateCities && stateCities.length > 0 ? stateCities[0] : '');
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

            // Try several possible fields for the state value
            const possibleStateValues = [rawRegion, rawSubregion].filter(Boolean);

            let matchedState =
                // Exact name match
                US_STATES.find(s =>
                    possibleStateValues.some(v => v.toLowerCase() === s.name.toLowerCase())
                ) ||
                // Match by 2-letter code (sometimes region can be "CA", "NY", etc.)
                US_STATES.find(s =>
                    possibleStateValues.some(v => v.toUpperCase() === s.code)
                );

            if (!matchedState && possibleStateValues.length) {
                // Fallback: partial match (e.g. "New York County" → "New York")
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

            setLocation(matchedState.name);
            setSelectedStateCode(matchedState.code);
            setShowSuggestions(false);

            const stateCities = STATE_CITIES[matchedState.code as keyof typeof STATE_CITIES] || [];
            const detectedCityName = rawCity || rawSubregion;
            if (detectedCityName && stateCities.includes(detectedCityName)) {
                setSelectedCity(detectedCityName);
                setStateLevelOnly(false);
            } else {
                // City not supported: fall back to state-level only
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

    const handleContinue = async () => {
        if (!location.trim()) return;

        setIsSaving(true);
        try {
            // Determine city to save for this state if we have one
            if (resolvedStateCode) {
                if (stateLevelOnly) {
                    const stateName =
                        US_STATES.find(s => s.code === resolvedStateCode)?.name || location.trim();
                    await AsyncStorage.setItem('userLocation', stateName);
                } else {
                    const stateCities = STATE_CITIES[resolvedStateCode as keyof typeof STATE_CITIES] || [];
                    const cityToSave = selectedCity || stateCities[0] || location.trim();
                    await AsyncStorage.setItem('userLocation', cityToSave);
                }
            } else {
                // Fallback: save whatever the user typed if we can't resolve a state code
                await AsyncStorage.setItem('userLocation', location.trim());
            }
            // Save the state code if we have it from selection, or try to find it
            const stateCode = resolvedStateCode;
            if (stateCode) {
                await AsyncStorage.setItem('userStateCode', stateCode);
            }

            await AsyncStorage.setItem('hasSeenOnboarding', 'true');

            // Navigate securely to home screen
            router.replace('/');
        } catch (error) {
            console.error('Error saving onboarding state:', error);
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#fff6e8]">
            <View className="flex-1 px-6 pb-8 pt-6">

                {/* Header with Back Button */}
                <View className="mb-10 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-[#FBE9E7]"
                    >
                        <Ionicons name="chevron-back" size={24} color="#4E342E" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-[#4E342E]">
                        Back to Language
                    </Text>
                </View>

                {/* Main Content */}
                <View className="mb-10 items-center">
                    <Text className="mb-3 text-center text-[32px] font-extrabold text-[#4E342E]">
                        Set Your Location
                    </Text>
                    <Text className="px-4 text-center text-base text-slate-600">
                        Cuida relies on your location to provide relevant alerts and resources. (US Only)
                    </Text>
                </View>

                {/* Input Area */}
                <View className="relative z-50 mb-2">
                    <Text className="mb-2 ml-1 text-[13px] font-bold uppercase tracking-wide text-slate-600">
                        US State
                    </Text>
                    <TextInput
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-[18px] text-[18px] text-slate-800"
                        placeholder="Type your state (e.g. California)"
                        placeholderTextColor="#94a3b8"
                        value={location}
                        onChangeText={handleInputChange}
                        autoCapitalize="words"
                    />

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleUseMyLocation}
                        disabled={isLocating}
                        className={`mt-2.5 flex-row items-center self-start rounded-full border border-slate-300 bg-slate-50 py-2.5 px-3.5 ${isLocating ? 'opacity-70' : 'opacity-100'}`}
                    >
                        {isLocating ? (
                            <ActivityIndicator size="small" color="#475569" />
                        ) : (
                            <>
                                <View className="mr-1.5">
                                    <Ionicons name="locate-outline" size={18} color="#475569" />
                                </View>
                                <Text className="text-sm font-semibold text-slate-600">
                                    Use my location
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && (
                        <View className="absolute top-[85px] left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl bg-white shadow-lg">
                            <ScrollView className="max-h-[200px]" keyboardShouldPersistTaps="handled">
                                {filteredStates.map((state) => (
                                    <TouchableOpacity
                                        key={state.code}
                                        onPress={() => handleSelectState(state)}
                                        className="px-4 py-4 border-b border-slate-100 last:border-0 active:bg-slate-50"
                                    >
                                        <Text className="text-slate-700 text-lg font-medium">{state.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* City selection + disclaimer */}
                {resolvedStateCode && (
                    <View className="mb-4">
                        <View className="mb-2 ml-1 flex-row items-center justify-start gap-1.5">
                            <Text className="text-[13px] font-bold uppercase tracking-wide text-slate-600">
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
                            {(STATE_CITIES[resolvedStateCode as keyof typeof STATE_CITIES] || []).map((city) => {
                                const isSelected = city === selectedCity;
                                return (
                                    <TouchableOpacity
                                        key={city}
                                        onPress={() => {
                                            setSelectedCity(city);
                                            setStateLevelOnly(false);
                                        }}
                                        activeOpacity={0.8}
                                        className={`mb-2 mr-2 rounded-full border py-2 px-3.5 ${isSelected ? 'border-orange-600 bg-orange-50' : 'border-slate-200 bg-white'}`}
                                    >
                                        <Text
                                            className={`text-sm font-semibold ${isSelected ? 'text-orange-900' : 'text-slate-600'}`}
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
                            className={`mt-2 self-start rounded-full border py-2 px-3.5 ${stateLevelOnly ? 'border-orange-600 bg-orange-50' : 'border-slate-200 bg-white'}`}
                        >
                            <Text
                                className={`text-sm font-semibold ${stateLevelOnly ? 'text-orange-900' : 'text-slate-600'}`}
                            >
                                State level only
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Finish Button */}
                <View className="mt-auto">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleContinue}
                        disabled={!location.trim() || isSaving}
                        className={`w-full flex-row items-center justify-center rounded-2xl py-[18px] ${location.trim() ? 'bg-orange-600 shadow-md' : 'bg-slate-300'}`}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-[18px] font-bold text-white">
                                Finish Setup
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}
