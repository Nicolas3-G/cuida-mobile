import { useMemo, useRef, useState, useEffect } from 'react';
import {
    Dimensions,
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    View,
    Animated,
} from 'react-native';
import { Text } from '../components/Text';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import { useTranslation } from '../contexts/LanguageContext';
import { kyrSlides as kyrSlidesEn, type KyrSlideContent } from '../locales/en';
import { kyrSlides as kyrSlidesEs } from '../locales/es';

const { width } = Dimensions.get('window');

// Visual metadata per slide; the text content lives in the locale files and
// is merged by index (both arrays must stay the same length/order).
const SLIDE_META = [
    { id: '1', icon: 'shield-outline', color: '#C2185B' },
    { id: '2', icon: 'comment-off-outline', color: '#6A1B9A' },
    { id: '3', icon: 'door-open', color: '#00897B' },
    { id: '4', icon: 'car-outline', color: '#2E7D32' },
    { id: '5', icon: 'clipboard-text-outline', color: '#E65100' },
    { id: '6', icon: 'account-heart-outline', color: '#C62828' },
    { id: '7', icon: 'library-outline', color: '#AD1457' },
] as const;

const SLIDES_CONTENT: Record<'en' | 'es', KyrSlideContent[]> = {
    en: kyrSlidesEn,
    es: kyrSlidesEs,
};

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
            className="mt-7 p-[18px] rounded-[18px] border border-white/20 bg-white/10"
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
        >
            <View className="gap-3">
                {subPoints.map((sub: string, index: number) => (
                    <View key={index} className="flex-row items-start">
                        <View className="mr-2.5 mt-0.5">
                            <MaterialCommunityIcons name="check" size={14} color="rgba(255,255,255,0.6)" />
                        </View>
                        <Text className="flex-1 text-sm leading-5 text-[rgba(255,255,255,0.85)]">{sub}</Text>
                    </View>
                ))}
            </View>
        </Animated.View>
    );
};

export default function KnowYourRightsScreen() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const listRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const SLIDES = useMemo(() => {
        const content = SLIDES_CONTENT[language] ?? SLIDES_CONTENT.en;
        return SLIDE_META.map((meta, i) => ({ ...meta, ...content[i] }));
    }, [language]);

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
        <SafeAreaView className="flex-1" style={{ backgroundColor: slide.color }}>
            {/* Exit button */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute right-5 top-[50px] z-10 h-9 w-9 items-center justify-center rounded-full bg-white/20"
            >
                <Text className="text-xl font-semibold text-white">✕</Text>
            </TouchableOpacity>

            {/* Progress dots */}
            <View className="flex-row justify-center gap-1.5 pb-2 pt-4">
                {SLIDES.map((_, i) => (
                    <View
                        key={i}
                        className={`h-1.5 rounded-full ${i === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/35'}`}
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
                    <View className="flex-1 px-7 pb-4 pt-8" style={{ width }}>
                        {/* Icon */}
                        <View className="mb-7 h-[90px] w-[90px] items-center justify-center rounded-[45px] bg-white/15">
                            <MaterialCommunityIcons name={item.icon as any} size={44} color="#ffffff" />
                        </View>

                        {/* Step label */}
                        <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-[rgba(255,255,255,0.6)]">
                            {t('kyr.step', { current: SLIDES.indexOf(item) + 1, total: SLIDES.length })}
                        </Text>

                        {/* Title */}
                        <Text className="mb-7 text-[28px] font-extrabold leading-[34px] text-white">
                            {item.title}
                        </Text>

                        {/* Bullet points (Rendered only if present) */}
                        {item.points && item.points.length > 0 && (
                            <View className="gap-4">
                                {item.points.map((point: string, i: number) => (
                                    <View key={i} className="flex-row items-start">
                                        <View className="mr-3.5 mt-0.5 h-[22px] w-[22px] items-center justify-center rounded-[11px] bg-white/20">
                                            <Text className="text-[11px] font-bold text-white">{i + 1}</Text>
                                        </View>
                                        <Text className="flex-1 text-[15px] leading-[22px] text-[rgba(255,255,255,0.92)]">
                                            {point}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Resources (Rendered only for slide 7) */}
                        {item.resources && (
                            <View className="gap-3">
                                {item.resources.map((res: any, i: number) => (
                                    <View key={i} className="rounded-2xl border border-white/15 bg-white/10 p-4">
                                        <View className="mb-2 flex-row items-start justify-between">
                                            <Text className="mr-2 flex-1 text-[15px] font-bold text-white">{res.name}</Text>
                                            <TouchableOpacity
                                                onPress={() => Linking.openURL(res.url)}
                                                className="rounded-md bg-white px-2.5 py-1"
                                            >
                                                <Text className="text-[11px] font-bold" style={{ color: item.color }}>{t('kyr.website')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text className="text-xs leading-[18px] text-[rgba(255,255,255,0.8)]">{res.description}</Text>
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
            <View className="flex-row gap-3 px-7 pb-8 pt-4">
                {currentIndex > 0 && (
                    <TouchableOpacity
                        onPress={goPrev}
                        className="flex-1 items-center rounded-[14px] bg-white/15 py-4"
                    >
                        <Text className="text-[15px] font-bold text-white">{t('kyr.back')}</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={goNext}
                    className="flex-[2] items-center rounded-[14px] bg-white py-4"
                >
                    <Text className="text-[15px] font-extrabold" style={{ color: slide.color }}>
                        {currentIndex === SLIDES.length - 1 ? t('kyr.done') : t('kyr.next')}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
