import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    SafeAreaView,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useLocalOrganizations } from '../hooks/useLocalOrganizations';


const { width } = Dimensions.get('window');

const MATCHING_ORGS = [
    {
        id: '1',
        name: 'Respond NY',
        type: 'Legal & Response',
        icon: 'scale-balance',
        color: '#AD1457',
        desc: 'Rapid response team for local enforcement actions.',
    },
    {
        id: '2',
        name: 'Freedom Voices',
        type: 'Community Advocacy',
        icon: 'hand-front-right',
        color: '#6A1B9A',
        desc: 'Connecting volunteers with affected families.',
    },
    {
        id: '3',
        name: 'Safe Haven Network',
        type: 'Emergency Support',
        icon: 'home-outline',
        color: '#2E7D32',
        desc: 'Providing temporary shelter and coordination.',
    },
];

const NEARBY_ORGS = [
    {
        id: '1',
        name: 'ACLU local',
        icon: 'bank-outline',
        desc: 'Civil liberties and immigrant rights support in your area.',
    },
    {
        id: '2',
        name: 'CASA',
        icon: 'account-group-outline',
        desc: 'Local immigrant advocacy and community organizing.',
    },
    {
        id: '3',
        name: 'Make the Road',
        icon: 'walk',
        desc: 'Grassroots organizing and legal support for immigrants.',
    },
    {
        id: '4',
        name: 'Alianza',
        icon: 'account-heart-outline',
        desc: 'Community network offering support to local families.',
    },
    {
        id: '5',
        name: 'Legal Shield',
        icon: 'shield-check-outline',
        desc: 'Legal assistance and rapid response coordination.',
    },
];

const isValidPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
};

const getOrgColorsForIcon = (iconName?: string | null) => {
    switch (iconName) {
        case 'bank-outline':
        case 'scale-balance':
            return { bg: '#FBE9E7', scopeColor: '#BF360C' };
        case 'account-group-outline':
        case 'handshake-outline':
            return { bg: '#F3E5F5', scopeColor: '#6A1B9A' };
        case 'walk':
        case 'hand-front-right':
            return { bg: '#E8F5E9', scopeColor: '#2E7D32' };
        case 'account-heart-outline':
            return { bg: '#FFF3E0', scopeColor: '#E65100' };
        case 'shield-check-outline':
        case 'shield-alert-outline':
            return { bg: '#FBE9E7', scopeColor: '#B71C1C' };
        case 'home-outline':
            return { bg: '#E3F2FD', scopeColor: '#1565C0' };
        default:
            return { bg: '#E8F5E9', scopeColor: '#2E7D32' };
    }
};

export default function VolunteerScreen() {
    const router = useRouter();
    const [step, setStep] = useState<'signup' | 'matches' | 'success'>('signup');
    const [formData, setFormData] = useState({ name: '', phone: '', zip: '' });
    const [sharingIds, setSharingIds] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSignedUp, setHasSignedUp] = useState(false);
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [savedLocation, setSavedLocation] = useState<string | null>(null);
    const { organizations: localOrganizations } = useLocalOrganizations(savedLocation);

    const slideAnim = useRef(new Animated.Value(0)).current;
    const collapseAnim = useRef(new Animated.Value(0)).current; // 1 = expanded, 0 = collapsed
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        async function loadVolunteerStatus() {
            const stored = await AsyncStorage.getItem('hasSignedUpVolunteer');
            if (stored === 'true') {
                setHasSignedUp(true);
            }
            const location = await AsyncStorage.getItem('userLocation');
            setSavedLocation(location);
        }
        loadVolunteerStatus();
    }, []);
    const handleSignup = async () => {
        if (isCollapsed) {
            setIsCollapsed(false);
            Animated.spring(collapseAnim, {
                toValue: 1,
                useNativeDriver: false,
                tension: 40,
                friction: 7,
            }).start();
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }

        if (!formData.name || !formData.phone || !isValidPhone(formData.phone)) {
            if (!isValidPhone(formData.phone)) {
                setPhoneError('The phone number is not valid.');
            }
            return;
        }
        if (isLoading) return;

        try {
            setIsLoading(true);

            const volunteersCollection = collection(db, 'volunteers');
            const volunteerDocRef = doc(volunteersCollection);

            await setDoc(volunteerDocRef, {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                zip: formData.zip.trim() || null,
                dateCreated: serverTimestamp(),
                dateModified: serverTimestamp(),
                source: 'app-volunteer-screen',
                uuid: volunteerDocRef.id,
            });

            await AsyncStorage.setItem('hasSignedUpVolunteer', 'true');
            setHasSignedUp(true);
            setStep('success');
        } catch (error) {
            console.error('Error saving volunteer signup:', error);
        } finally {
            setIsLoading(false);
        }
    };



    const handleShareInfo = (id: string) => {
        setSharingIds((prev) => [...prev, id]);
        // Simulate sharing
        setTimeout(() => {
            if (sharingIds.length + 1 === MATCHING_ORGS.length) {
                setStep('success');
            }
        }, 1200);
    };

    const AnimatedOrgCard = ({ org, index }: { org: any, index: number }) => {
        const slideAnim = useRef(new Animated.Value(50)).current;
        const fadeAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                    delay: index * 100,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                    delay: index * 100,
                }),
            ]).start();
        }, []);

        return (
            <Animated.View
                className="mb-0"
                style={[
                    styles.orgSquareCard,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            >
                <View
                    className="rounded-2xl border px-3.5 py-3 bg-white"
                    style={{
                        borderColor: org.scopeColor,
                        backgroundColor: org.bg,
                    }}
                >
                    <View className="flex-row items-center mb-2.5">
                        <View
                            className="mr-2.5 rounded-xl justify-center items-center"
                            style={[
                                styles.imagePlaceholder,
                                { backgroundColor: 'rgba(255,255,255,0.8)' },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={org.icon as any}
                                size={22}
                                color={org.scopeColor}
                            />
                        </View>
                        <Text
                            className="flex-1 text-[13px] font-semibold text-[#4E342E]"
                            numberOfLines={2}
                        >
                            {org.name}
                        </Text>
                    </View>

                    {org.desc && (
                        <Text
                            className="text-[11px] leading-[16px] text-[#5D4037] mb-3"
                            numberOfLines={3}
                        >
                            {org.desc}
                        </Text>
                    )}

                    <View className="flex-row items-center justify-end">
                        <Text className="text-[11px] font-semibold text-[#4E342E] mr-1.5">
                            Learn more
                        </Text>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={14}
                            color={org.scopeColor}
                        />
                    </View>
                </View>
            </Animated.View>
        );
    };


    const renderNearbyOrgs = () => {
        let orgsToShow: any[] = [];

        if (localOrganizations && localOrganizations.length > 0) {
            const volunteerOrgs = localOrganizations.filter(
                (org: any) => org.volunteerOpportunities?.lookingForVolunteers
            );

            orgsToShow = volunteerOrgs.map((org: any) => {
                const colors = getOrgColorsForIcon(org.icon);
                return {
                    id: org.id,
                    name: org.name,
                    desc: org.desc,
                    icon: org.icon || 'home-outline',
                    bg: colors.bg,
                    scopeColor: colors.scopeColor,
                    volunteeringLink:
                        org.volunteerOpportunities?.volunteeringLink || org.url || null,
                };
            });
        }

        const hasVolunteerOrgs = orgsToShow.length > 0;

        return (
        <View className="w-full mt-10 mb-5">
            <Text className="text-[16px] font-bold text-[#4E342E] mb-4 text-left">
                Places near you that need volunteers
            </Text>

            {!hasVolunteerOrgs ? (
                <View className="rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-3">
                    <Text className="text-[13px] leading-[18px] text-[#4B5563]">
                        We couldn’t find any organizations near you that are actively looking for volunteers right now.
                        Check back soon! We're always updating this list!
                    </Text>
                </View>
            ) : (
                <View className="flex-row flex-wrap justify-start w-full gap-3">
                    {orgsToShow.map((org, index) => (
                        <TouchableOpacity
                            key={org.id || `${org.name}-${index}`}
                            activeOpacity={0.8}
                            onPress={() => {
                                if (!org.volunteeringLink) return;
                                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                Linking.openURL(org.volunteeringLink);
                            }}
                        >
                            <AnimatedOrgCard org={org} index={index} />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
        );
    };

    const renderSignup = () => {
        const isPrimaryDisabled = (!formData.name || !formData.phone || isLoading) && !isCollapsed;

        return (
            <View className="px-6 items-center">
                <Text className="text-[28px] font-extrabold text-[#4E342E] text-center mb-3">Join the Network</Text>
                <Text className="text-[15px] text-[#6D4C41] text-center leading-[22px] mb-8">
                    Sign up to be part of the Cuida Volunteer Network. We'll match you with organizations in your area that need help.
                </Text>

                {hasSignedUp && (
                    <View className="w-full rounded-[14px] border border-[#fde68a] bg-[#fef3c7] px-3.5 py-3.5 mb-6">
                        <Text className="text-sm font-bold text-[#92400e] mb-1">You're already in the network!</Text>
                        <Text className="text-[13px] leading-[18px] text-[#92400e]">
                            You’ve already signed up, but you can sign up again if you want to update your info or add someone else :)
                        </Text>
                    </View>
                )}

                <View className="w-full">
                    <Animated.View
                        className="overflow-hidden"
                        style={{
                            opacity: collapseAnim,
                            maxHeight: collapseAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 300], // Adjust based on content height
                            }),
                            transform: [{
                                scale: collapseAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                            }],
                        }}
                        pointerEvents={isCollapsed ? 'none' : 'auto'}
                    >
                        <Text className="text-[13px] font-bold text-[#5D4037] mb-2 ml-1 uppercase">Full Name</Text>
                        <TextInput
                            className="bg-slate-50 border border-[#D7CCC8] rounded-xl px-4 py-4 text-base text-[#4E342E] mb-5"
                            placeholder="Enter your name"
                            placeholderTextColor="#94a3b8"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />

                        <Text className="text-[13px] font-bold text-[#5D4037] mb-2 ml-1 uppercase">Phone Number</Text>
                        <TextInput
                            className="bg-slate-50 border border-[#D7CCC8] rounded-xl px-4 py-4 text-base text-[#4E342E] mb-2"
                            placeholder="(555) 000-0000"
                            placeholderTextColor="#94a3b8"
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={(text) => {
                                setFormData({ ...formData, phone: text });
                                if (phoneError && isValidPhone(text)) {
                                    setPhoneError(null);
                                }
                            }}
                        />
                        {phoneError && (
                            <Text className="text-[12px] text-red-600 mb-4">
                                {phoneError}
                            </Text>
                        )}

                        <Text className="text-[13px] font-bold text-[#5D4037] mb-2 ml-1 uppercase">Zip Code (Optional)</Text>
                        <TextInput
                            className="bg-slate-50 border border-[#D7CCC8] rounded-xl px-4 py-4 text-base text-[#4E342E] mb-5"
                            placeholder="e.g. 10001"
                            placeholderTextColor="#94a3b8"
                            keyboardType="number-pad"
                            value={formData.zip}
                            onChangeText={(text) => setFormData({ ...formData, zip: text })}
                        />
                    </Animated.View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleSignup}
                        className={`rounded-[14px] py-[18px] items-center ${
                            isPrimaryDisabled ? 'bg-slate-300' : 'bg-[#F57C00]'
                        }`}
                        style={{
                            shadowColor: '#F57C00',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: isPrimaryDisabled ? 0 : 0.2,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                        disabled={isPrimaryDisabled}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-[16px] font-bold">
                                {hasSignedUp ? 'Sign up anyway' : 'Sign Me Up'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center my-8 w-full">
                    <View className="flex-1 h-px bg-[#D7CCC8]" />
                    <Text className="mx-4 text-[14px] font-bold text-[#8D6E63]">OR</Text>
                    <View className="flex-1 h-px bg-[#D7CCC8]" />
                </View>

                {renderNearbyOrgs()}
            </View>
        );
    };

    const renderMatches = () => (
        <Animated.View style={{ opacity: slideAnim }}>
            <View className="px-6 items-center">
                <Text className="text-[28px] font-extrabold text-[#4E342E] text-center mb-3">Your Matches</Text>
                <Text className="text-[15px] text-[#6D4C41] text-center leading-[22px] mb-8">
                Based on your location, these organizations are looking for volunteers. Tap to share your info!
                </Text>
            </View>

            <View className="w-full px-6">
                {MATCHING_ORGS.map((org) => {
                    const isShared = sharingIds.includes(org.id);
                    return (
                        <View
                            key={org.id}
                            className="flex-row bg-[#FFF8E1] rounded-[18px] px-4 py-4 mb-4 border border-[#FFE0B2]"
                        >
                            <View
                                className="w-[52px] h-[52px] rounded-[14px] justify-center items-center"
                                style={{ backgroundColor: org.color + '20' }}
                            >
                                <MaterialCommunityIcons name={org.icon as any} size={24} color={org.color} />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-[16px] font-bold text-[#4E342E] mb-0.5">{org.name}</Text>
                                <Text className="text-[12px] font-semibold text-[#6D4C41] uppercase mb-2">{org.type}</Text>
                                <Text className="text-[13px] text-[#5D4037] leading-[18px] mb-3">{org.desc}</Text>

                                <TouchableOpacity
                                    onPress={() => !isShared && handleShareInfo(org.id)}
                                    disabled={isShared}
                                    className={`self-start rounded-lg border px-3 py-2 ${
                                        isShared ? 'bg-emerald-100 border-emerald-500' : 'bg-[#fff6e8] border-[#F57C00]'
                                    }`}
                                >
                                    <Text
                                        className={`text-[13px] font-bold ${
                                            isShared ? 'text-[#166534]' : 'text-[#F57C00]'
                                        }`}
                                    >
                                        {isShared ? '✓ Info Shared' : 'Share My Contact Info'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </View>

            {sharingIds.length > 0 && (
                <TouchableOpacity
                    onPress={() => setStep('success')}
                    className="mt-5 rounded-[14px] py-[18px] items-center bg-[#F57C00]"
                    style={{
                        shadowColor: '#F57C00',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    <Text className="text-white text-[16px] font-bold">I'm Done</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );

    const renderSuccess = () => (
        <View className="px-6 flex-1 justify-center items-center">
            <View className="w-[100px] h-[100px] rounded-full bg-[#f0fdf4] mb-6 justify-center items-center">
                <MaterialCommunityIcons name="party-popper" size={60} color="#2E7D32" />
            </View>
            <Text className="text-[28px] font-extrabold text-[#4E342E] text-center mb-3">You're in the Network!</Text>
            <Text className="text-[15px] text-[#6D4C41] text-center leading-[22px] mb-8">
                Thank you for stepping up. Matched organizations have been notified and will reach out to you via phone when help is needed.
            </Text>

            <TouchableOpacity
                onPress={() => router.replace('/')}
                className="mt-10 w-full rounded-[14px] py-[18px] items-center bg-[#F57C00]"
                style={{
                    shadowColor: '#F57C00',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                }}
            >
                <Text className="text-white text-[16px] font-bold">Back to Home</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#fff6e8]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-row items-center justify-between px-5 py-2.5">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-[#FBE9E7] justify-center items-center"
                    >
                        <Ionicons name="chevron-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text className="text-[17px] font-bold text-[#4E342E]">Volunteer Network</Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1"
                    contentContainerClassName="flex-grow"
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                >
                    {step === 'signup' && renderSignup()}
                    {step === 'matches' && renderMatches()}
                    {step === 'success' && renderSuccess()}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    orgSquareCard: {
        width: (width - 48 - 16) / 2, // two cards per row with gap
    },
    imagePlaceholder: {
        width: 32,
        height: 32,
    },
});
