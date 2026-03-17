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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';


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
    { id: '1', name: 'ACLU local', color: '#E3F2FD' },
    { id: '2', name: 'CASA', color: '#F3E5F5' },
    { id: '3', name: 'Make the Road', color: '#E8F5E9' },
    { id: '4', name: 'Alianza', color: '#FFF3E0' },
    { id: '5', name: 'Legal Shield', color: '#FBE9E7' },
];

export default function VolunteerScreen() {
    const router = useRouter();
    const [step, setStep] = useState<'signup' | 'matches' | 'success'>('signup');
    const [formData, setFormData] = useState({ name: '', phone: '', zip: '' });
    const [sharingIds, setSharingIds] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSignedUp, setHasSignedUp] = useState(false);

    const slideAnim = useRef(new Animated.Value(0)).current;
    const collapseAnim = useRef(new Animated.Value(0)).current; // 1 = expanded, 0 = collapsed
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        async function loadVolunteerStatus() {
            const stored = await AsyncStorage.getItem('hasSignedUpVolunteer');
            if (stored === 'true') {
                setHasSignedUp(true);
            }
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

        if (!formData.name || !formData.phone) return;
        if (isLoading) return;

        try {
            setIsLoading(true);
            await addDoc(collection(db, 'volunteers'), {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                zip: formData.zip.trim() || null,
                createdAt: serverTimestamp(),
                source: 'app-volunteer-screen',
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
                style={[
                    styles.orgSquareCard,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            >
                <View style={[styles.imagePlaceholder, { backgroundColor: org.color }]}>
                    <MaterialCommunityIcons name="image-outline" size={24} color="rgba(0,0,0,0.1)" />
                </View>
                <Text style={styles.orgSquareName} numberOfLines={1}>{org.name}</Text>
            </Animated.View>
        );
    };


    const renderNearbyOrgs = () => (
        <View style={styles.nearbySection}>
            <Text style={styles.nearbyTitle}>Find places near you that needs volunteers</Text>
            <View style={styles.nearbyGrid}>
                {NEARBY_ORGS.map((org, index) => (
                    <AnimatedOrgCard key={org.id} org={org} index={index} />
                ))}
            </View>
        </View>
    );

    const renderSignup = () => (
        <View style={styles.content}>
            <Text style={styles.title}>Join the Network</Text>
            <Text style={styles.subtitle}>
                Sign up to be part of the Cuida Volunteer Network. We'll match you with organizations in your area that need help.
            </Text>

            {hasSignedUp && (
                <View style={styles.banner}>
                    <Text style={styles.bannerTitle}>You're already in the network!</Text>
                    <Text style={styles.bannerText}>
                        You’ve already signed up, but you can sign up again if you want to update your info or add someone else :)
                    </Text>
                </View>
            )}

            <View style={styles.form}>
                <Animated.View
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
                        overflow: 'hidden',
                    }}
                    pointerEvents={isCollapsed ? 'none' : 'auto'}
                >
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        placeholderTextColor="#94a3b8"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="(555) 000-0000"
                        placeholderTextColor="#94a3b8"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    />

                    <Text style={styles.label}>Zip Code (Optional)</Text>
                    <TextInput
                        style={styles.input}
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
                    style={[
                        styles.primaryButton,
                        (!formData.name || !formData.phone) && !isCollapsed && styles.disabledButton,
                    ]}
                    disabled={(!formData.name || !formData.phone || isLoading) && !isCollapsed}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryButtonText}>
                            {hasSignedUp ? 'Sign up anyway' : 'Sign Me Up'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.orSeparator}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
            </View>

            {renderNearbyOrgs()}
        </View>
    );

    const renderMatches = () => (
        <Animated.View style={[styles.content, { opacity: slideAnim }]}>
            <Text style={styles.title}>Your Matches</Text>
            <Text style={styles.subtitle}>
                Based on your location, these organizations are looking for volunteers. Tap to share your info!
            </Text>

            <View style={{ width: '100%' }}>
                {MATCHING_ORGS.map((org) => {
                    const isShared = sharingIds.includes(org.id);
                    return (
                        <View key={org.id} style={styles.orgCard}>
                            <View style={[styles.orgIcon, { backgroundColor: org.color + '20' }]}>
                                <MaterialCommunityIcons name={org.icon as any} size={24} color={org.color} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={styles.orgName}>{org.name}</Text>
                                <Text style={styles.orgType}>{org.type}</Text>
                                <Text style={styles.orgDesc}>{org.desc}</Text>

                                <TouchableOpacity
                                    onPress={() => !isShared && handleShareInfo(org.id)}
                                    disabled={isShared}
                                    style={[styles.shareBtn, isShared && styles.sharedBtn]}
                                >
                                    <Text style={[styles.shareBtnText, isShared && styles.sharedBtnText]}>
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
                    style={[styles.primaryButton, { marginTop: 20 }]}
                >
                    <Text style={styles.primaryButtonText}>I'm Done</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );

    const renderSuccess = () => (
        <View style={[styles.content, { justifyContent: 'center', flex: 1 }]}>
            <View style={styles.successIcon}>
                <MaterialCommunityIcons name="party-popper" size={60} color="#2E7D32" />
            </View>
            <Text style={styles.title}>You're in the Network!</Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
                Thank you for stepping up. Matched organizations have been notified and will reach out to you via phone when help is needed.
            </Text>

            <TouchableOpacity
                onPress={() => router.replace('/')}
                style={[styles.primaryButton, { marginTop: 40, width: '100%' }]}
            >
                <Text style={styles.primaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Volunteer Network</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
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
    container: {
        flex: 1,
        backgroundColor: '#fff6e8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#4E342E',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FBE9E7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#4E342E',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: '#6D4C41',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    banner: {
        width: '100%',
        backgroundColor: '#fef3c7',
        borderRadius: 14,
        padding: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    bannerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#92400e',
        marginBottom: 4,
    },
    bannerText: {
        fontSize: 13,
        color: '#92400e',
        lineHeight: 18,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#5D4037',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#D7CCC8',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#4E342E',
        marginBottom: 20,
    },
    primaryButton: {
        backgroundColor: '#F57C00',
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        shadowColor: '#F57C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    disabledButton: {
        backgroundColor: '#cbd5e1',
        shadowOpacity: 0,
    },
    orgCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF8E1',
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    orgIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orgName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4E342E',
        marginBottom: 2,
    },
    orgType: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6D4C41',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    orgDesc: {
        fontSize: 13,
        color: '#5D4037',
        lineHeight: 18,
        marginBottom: 12,
    },
    shareBtn: {
        backgroundColor: '#fff6e8',
        borderWidth: 1,
        borderColor: '#F57C00',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
    },
    shareBtnText: {
        color: '#F57C00',
        fontSize: 13,
        fontWeight: '700',
    },
    sharedBtn: {
        backgroundColor: '#dcfce7',
        borderColor: '#22c55e',
    },
    sharedBtnText: {
        color: '#166534',
    },
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    nearbySection: {
        width: '100%',
        marginTop: 40,
        marginBottom: 20,
    },
    nearbyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4E342E',
        marginBottom: 16,
        textAlign: 'left',
    },
    nearbyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
        gap: 12,
    },
    orgSquareCard: {
        alignItems: 'center',
        width: (width - 48 - 24) / 3, // Maintains size but now respects gap
        marginBottom: 20,
    },
    imagePlaceholder: {
        width: (width - 48 - 24) / 3,
        height: (width - 48 - 24) / 3,
        borderRadius: 16,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    orgSquareName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6D4C41',
        textAlign: 'center',
        width: '100%',
    },
    orSeparator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
        width: '100%',
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#D7CCC8',
    },
    orText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8D6E63',
        marginHorizontal: 16,
    },
});
