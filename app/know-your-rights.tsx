import { useRef, useState, useEffect } from 'react';
import {
    Dimensions,
    FlatList,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking } from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        icon: 'shield-outline',
        title: 'You Have Rights',
        color: '#C2185B',
        points: [
            'You have constitutional rights regardless of your immigration status.',
            'These rights apply to everyone in the United States, citizen or not.',
            'Knowing your rights before an encounter can protect you and your family.',
        ],
        subPoints: [
            'You have the right to remain silent.',
            'You have the right to an attorney.',
            'You have the right aganist unreasonable searches and seizures.',
            'You have the right to record interactions with law enforcement.',
        ],
    },
    {
        id: '2',
        icon: 'comment-off-outline',
        title: 'Right to Remain Silent',
        color: '#6A1B9A',
        points: [
            'You have the right to remain silent. You do not have to answer questions about where you were born or how you entered the US.',
            'Clearly state: "I am exercising my right to remain silent."',
            'Do not lie to officials, silence is safer than a false statement.',
        ],
    },
    {
        id: '3',
        icon: 'door-open',
        title: 'If an Agent Comes to Your Door',
        color: '#00897B',
        points: [
            'You do not have to open the door unless they have a signed judicial warrant.',
            'Ask them to slide the warrant under the door or hold it to the window.',
            'An ICE administrative warrant does NOT give them the right to enter your home.',
        ],
    },
    {
        id: '4',
        icon: 'car-outline',
        title: 'If You Are Stopped in Public',
        color: '#2E7D32',
        points: [
            'Stay calm. Do not run or resist, even if you believe the stop is unlawful.',
            'You can ask: "Am I free to go?" If yes, calmly walk away.',
            'If detained, clearly say: "I do not consent to a search, and I do not wish to answer any questions."',
        ],
    },
    {
        id: '5',
        icon: 'clipboard-text-outline',
        title: 'If You Are Arrested',
        color: '#E65100',
        points: [
            'Say clearly: "I want to speak to a lawyer.", do not answer any questions.',
            'Do not sign any documents without speaking to an attorney first.',
            'You have the right to ask that your consulate be notified.',
            'A consular officer can help you get a lawyer, contact your family, and visit you in detention.'
        ],
    },
    {
        id: '6',
        icon: 'account-heart-outline',
        title: 'Protect Your Family',
        color: '#C62828',
        points: [
            'Create a family safety plan and make sure everyone knows it.',
            'Designate a trusted person who can care for your children if you are detained.',
            'Keep an emergency contact card with your immigration attorney\'s phone number.',
            'Share this brief course with your family members.',
        ],
    },
    {
        id: '7',
        icon: 'library-outline',
        title: 'Learn more',
        color: '#AD1457',
        points: [],
        resources: [
            {
                name: 'National Immigration Law Center',
                description: 'Offers guides, policy updates, legal assistance, and “know your rights” resources about immigration law & enforcement.',
                url: 'https://www.nilc.org/',
            },
            {
                name: 'ACLU: Know Your Rights',
                description: 'Comprehensive know your rights information and other resources.',
                url: 'https://www.aclu.org/know-your-rights',
            },
            {
                name: 'Immigrant Legal Resource Center',
                description: 'Provides immigration legal resources, training, and guides to help immigrants, lawyers, and community organizations.',
                url: 'https://www.ilrc.org/',
            },
        ],
    },
];

interface AnimatedSubPointsProps {
    subPoints: string[];
}

const AnimatedSubPoints = ({ subPoints }: AnimatedSubPointsProps) => {
    const slideAnim = useRef(new Animated.Value(30)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 40,
                friction: 8,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={{
                marginTop: 28,
                padding: 18,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 18,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
        >
            <View style={{ gap: 12 }}>
                {subPoints.map((sub: string, index: number) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <MaterialCommunityIcons name="check" size={14} color="rgba(255,255,255,0.6)" style={{ marginRight: 10, marginTop: 3 }} />
                        <Text style={{ flex: 1, color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 20 }}>{sub}</Text>
                    </View>
                ))}
            </View>
        </Animated.View>
    );
};

export default function KnowYourRightsScreen() {
    const router = useRouter();
    const listRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const goNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            const next = currentIndex + 1;
            listRef.current?.scrollToIndex({ index: next, animated: true });
            setCurrentIndex(next);
        } else {
            router.back();
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            const prev = currentIndex - 1;
            listRef.current?.scrollToIndex({ index: prev, animated: true });
            setCurrentIndex(prev);
        }
    };

    const slide = SLIDES[currentIndex];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: slide.color }}>
            {/* Exit button */}
            <TouchableOpacity
                onPress={() => router.back()}
                style={{
                    position: 'absolute',
                    top: 50,
                    right: 20,
                    zIndex: 10,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '600' }}>✕</Text>
            </TouchableOpacity>

            {/* Progress dots */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 16, paddingBottom: 8, gap: 6 }}>
                {SLIDES.map((_, i) => (
                    <View
                        key={i}
                        style={{
                            width: i === currentIndex ? 20 : 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: i === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.35)',
                        }}
                    />
                ))}
            </View>

            {/* Slide content */}
            <FlatList
                ref={listRef}
                data={SLIDES}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ width, flex: 1, paddingHorizontal: 28, paddingTop: 32, paddingBottom: 16 }}>
                        {/* Icon */}
                        <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 28 }}>
                            <MaterialCommunityIcons name={item.icon as any} size={44} color="#ffffff" />
                        </View>

                        {/* Step label */}
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                            Step {SLIDES.indexOf(item) + 1} of {SLIDES.length}
                        </Text>

                        {/* Title */}
                        <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: '800', lineHeight: 34, marginBottom: 28 }}>
                            {item.title}
                        </Text>

                        {/* Bullet points (Rendered only if present) */}
                        {item.points && item.points.length > 0 && (
                            <View style={{ gap: 16 }}>
                                {item.points.map((point: string, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14, marginTop: 1 }}>
                                            <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>{i + 1}</Text>
                                        </View>
                                        <Text style={{ flex: 1, color: 'rgba(255,255,255,0.92)', fontSize: 15, lineHeight: 22 }}>
                                            {point}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Resources (Rendered only for slide 7) */}
                        {item.resources && (
                            <View style={{ gap: 12 }}>
                                {item.resources.map((res: any, i: number) => (
                                    <View key={i} style={{ padding: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 }}>{res.name}</Text>
                                            <TouchableOpacity
                                                onPress={() => Linking.openURL(res.url)}
                                                style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#ffffff', borderRadius: 6 }}
                                            >
                                                <Text style={{ color: item.color, fontSize: 11, fontWeight: '700' }}>Website</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 18 }}>{res.description}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Sub-points (Key Takeaways) */}
                        {item.subPoints && <AnimatedSubPoints subPoints={item.subPoints} />}
                    </View>
                )}
            />

            {/* Navigation buttons */}
            <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 28, paddingBottom: 32, paddingTop: 16 }}>
                {currentIndex > 0 && (
                    <TouchableOpacity
                        onPress={goPrev}
                        style={{ flex: 1, paddingVertical: 16, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center' }}
                    >
                        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>← Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={goNext}
                    style={{ flex: 2, paddingVertical: 16, borderRadius: 14, backgroundColor: '#ffffff', alignItems: 'center' }}
                >
                    <Text style={{ color: slide.color, fontWeight: '800', fontSize: 15 }}>
                        {currentIndex === SLIDES.length - 1 ? 'Done ✓' : 'Next →'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
