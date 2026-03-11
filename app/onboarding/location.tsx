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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff6e8' }}>
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}>

                {/* Header with Back Button */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 40 }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FBE9E7', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}
                    >
                        <Ionicons name="chevron-back" size={24} color="#4E342E" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#4E342E' }}>
                        Back to Language
                    </Text>
                </View>

                {/* Main Content */}
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <Text style={{ fontSize: 32, fontWeight: '800', color: '#4E342E', textAlign: 'center', marginBottom: 12 }}>
                        Set Your Location
                    </Text>
                    <Text style={{ fontSize: 16, color: '#475569', textAlign: 'center', paddingHorizontal: 16 }}>
                        Cuida relies on your location to provide relevant alerts and resources. (US Only)
                    </Text>
                </View>

                {/* Input Area */}
                <View style={{ marginBottom: 8, position: 'relative', zIndex: 50 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                        US State
                    </Text>
                    <TextInput
                        style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 18, fontSize: 18, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' }}
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
                        style={{
                            marginTop: 10,
                            alignSelf: 'flex-start',
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: '#cbd5e1',
                            backgroundColor: '#f8fafc',
                            opacity: isLocating ? 0.7 : 1,
                        }}
                    >
                        {isLocating ? (
                            <ActivityIndicator size="small" color="#475569" />
                        ) : (
                            <>
                                <Ionicons name="locate-outline" size={18} color="#475569" style={{ marginRight: 6 }} />
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569' }}>
                                    Use my location
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && (
                        <View className="absolute top-[85px] left-0 right-0 bg-white rounded-xl shadow-lg mt-1 overflow-hidden z-50">
                            <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
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
                    <View style={{ marginBottom: 16 }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                marginBottom: 8,
                                marginLeft: 4,
                                gap: 6,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontWeight: '700',
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                }}
                            >
                                City options
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowCityInfo(prev => !prev)}
                                activeOpacity={0.7}
                                style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#FFEDD5',
                                }}
                            >
                                <Ionicons name="information-circle-outline" size={14} color="#F97316" />
                            </TouchableOpacity>
                        </View>
                        {showCityInfo && (
                            <View
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#e2e8f0',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                    marginBottom: 10,
                                    marginLeft: 2,
                                    marginRight: 2,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: '#64748b',
                                    }}
                                >
                                    We currently only support these cities. If you prefer state-wide data,
                                    you can choose &quot;State level only&quot; instead.
                                </Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
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
                                        style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 14,
                                            borderRadius: 999,
                                            borderWidth: 1,
                                            borderColor: isSelected ? '#F57C00' : '#e2e8f0',
                                            backgroundColor: isSelected ? '#FFF3E0' : '#ffffff',
                                            marginRight: 8,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                fontWeight: '600',
                                                color: isSelected ? '#BF360C' : '#475569',
                                            }}
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
                            style={{
                                marginTop: 8,
                                alignSelf: 'flex-start',
                                paddingVertical: 8,
                                paddingHorizontal: 14,
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: stateLevelOnly ? '#F57C00' : '#e2e8f0',
                                backgroundColor: stateLevelOnly ? '#FFF3E0' : '#ffffff',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: stateLevelOnly ? '#BF360C' : '#475569',
                                }}
                            >
                                State level only
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Finish Button */}
                <View style={{ marginTop: 'auto' }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleContinue}
                        disabled={!location.trim() || isSaving}
                        style={{
                            width: '100%',
                            paddingVertical: 18,
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            backgroundColor: location.trim() ? '#F57C00' : '#cbd5e1',
                            shadowColor: '#F57C00',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: location.trim() ? 0.2 : 0,
                            shadowRadius: 8,
                            elevation: 4
                        }}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff' }}>
                                Finish Setup
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}
