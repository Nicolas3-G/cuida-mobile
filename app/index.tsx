import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Modal, Linking, Animated, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const NEWS_STORIES = [
  {
    id: '1',
    category: 'Alert',
    title: 'ICE checkpoint reported near Central Ave',
    location: 'Central Ave, 0.4 mi away',
    color: '#C62828',
    icon: 'alert-outline',
  },
  {
    id: '2',
    category: 'Know Your Rights',
    title: 'You have the right to remain silent — here\'s what to say',
    location: 'Tap to read',
    color: '#6A1B9A',
    icon: 'scale-balance',
  },
  {
    id: '3',
    category: 'Operation Report',
    title: 'Increased enforcement spotted near Eastside Market',
    location: 'Eastside, 1.1 mi away',
    color: '#E65100',
    icon: 'clipboard-text-outline',
  },
  {
    id: '4',
    category: 'Get Involved',
    title: 'Community rapid response network meeting this Friday',
    location: 'Community Center, 0.6 mi away',
    color: '#2E7D32',
    icon: 'hand-front-right',
  },
  {
    id: '5',
    category: 'Resource',
    title: 'Free legal consultations — immigration attorneys on call',
    location: 'Legal Aid Office, 1.8 mi away',
    color: '#00897B',
    icon: 'phone-outline',
  },
];

interface Article {
  title: string;
  formattedTitle?: string;
  link: string;
  source?: string;
  parsedSource?: string;
  datePublished?: string;
}

interface Snippet {
  snippetText: string;
  articles?: Article[];
}

interface AnimatedNewsCardProps {
  story: any;
  isExpanded: boolean;
  isTruncatable: boolean;
  onToggleExpand: (id: string) => void;
  onTextLayout: (event: any, id: string) => void;
  vibrationEnabled: boolean;
}

const AnimatedNewsCard = ({ story, isExpanded, isTruncatable, onToggleExpand, onTextLayout, vibrationEnabled }: AnimatedNewsCardProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const triggerHaptic = () => {
    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
        backgroundColor: story.color,
        width: 220,
        minHeight: 120,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          triggerHaptic();
          story.link && Linking.openURL(story.link);
        }}
        style={({ pressed }) => ({
          flexGrow: 1,
          opacity: pressed ? 0.95 : 1,
        })}
      >

        <View style={{ padding: 12, flex: 1, justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 }}>
              {story.category}
            </Text>

            <Text
              style={{ position: 'absolute', opacity: 0, fontSize: 13, fontWeight: '700', lineHeight: 18, width: 220 - 24 }}
              onTextLayout={(e) => onTextLayout(e, story.id)}
            >
              {story.title}
            </Text>

            <Text
              style={{ color: '#ffffff', fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 2 }}
              numberOfLines={isExpanded ? undefined : 3}
            >
              {story.title}
            </Text>

            {(isTruncatable || isExpanded) && (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  onToggleExpand(story.id);
                }}
                style={{ alignSelf: 'flex-start', marginBottom: 6 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', textDecorationLine: 'underline' }}>
                  {isExpanded ? 'Show less' : 'More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <MaterialCommunityIcons name="map-marker-outline" size={13} color="rgba(255,255,255,0.65)" style={{ marginRight: 3 }} />
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
              {story.location}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

interface AnimatedSummaryItemProps {
  snippet: Snippet;
  index: number;
  onOpenArticles: (snippet: Snippet) => void;
}

const AnimatedSummaryItem = ({ snippet, index, onOpenArticles }: AnimatedSummaryItemProps) => {
  const slideAnim = useRef(new Animated.Value(50)).current; // Start 50px to the right
  const fadeAnim = useRef(new Animated.Value(0)).current;  // Start invisible

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 150, // Staggered delay
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
    >
      <MaterialCommunityIcons name="circle-small" size={20} color="#F57C00" style={{ marginRight: 6, marginTop: 1 }} />
      <View style={{ flex: 1, borderLeftWidth: 2, borderLeftColor: '#F57C00', paddingLeft: 10 }}>
        <Text style={{ color: '#5D4037', fontSize: 13, lineHeight: 19, marginBottom: 6 }}>{snippet.snippetText}</Text>
        {snippet.articles && snippet.articles.length > 0 && (
          <TouchableOpacity
            onPress={() => onOpenArticles(snippet)}
            style={{ alignSelf: 'flex-start', backgroundColor: '#FFF8E1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
          >
            <Text style={{ color: '#E65100', fontSize: 11, fontWeight: '600' }}>More ›</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [summaryArticles, setSummaryArticles] = useState<any[]>([]);
  const [nationArticles, setNationArticles] = useState<any[]>([]);
  const [expandedStoryIds, setExpandedStoryIds] = useState<Set<string>>(new Set());
  const [truncatableStoryIds, setTruncatableStoryIds] = useState<Set<string>>(new Set());
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(true);
  const [isLoadingNation, setIsLoadingNation] = useState(true);
  const [userState, setUserState] = useState('');

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);

  // Dynamic targeting status: 0 (none), 1 (expecting - yellow), 2 (active - red)
  const [targetingStatus, setTargetingStatus] = useState<number>(0);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);


  const lastNewsIndex = useRef(0);
  const lastOrgIndex = useRef(0);
  const lastEventIndex = useRef(0);
  const NEWS_CARD_WIDTH = 232; // 220 + 12 gap
  const ORG_CARD_WIDTH = 202;  // 190 + 12 gap
  const EVENT_CARD_WIDTH = 222; // 210 + 12 gap

  // Load vibration setting when focused
  useFocusEffect(
    useCallback(() => {
      async function loadVibrationSetting() {
        const vib = await AsyncStorage.getItem('userVibrationEnabled');
        if (vib !== null) setVibrationEnabled(vib === 'true');
      }
      loadVibrationSetting();
    }, [])
  );

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (vibrationEnabled) {
      Haptics.impactAsync(style);
    }
  };

  const triggerSelectionHaptic = () => {
    if (vibrationEnabled) {
      Haptics.selectionAsync();
    }
  };

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!hasSeen) {
          router.replace('/onboarding');
        } else {
          setIsCheckingOnboarding(false);
          const stateCode = await AsyncStorage.getItem('userStateCode');
          const stateName = await AsyncStorage.getItem('userLocation');
          setUserState(stateName || stateCode || 'your area');

          console.log("Use Effect Running...", stateCode)
          if (stateCode) {
            fetchSnippets(stateCode);
            fetchTargetingStatus(stateCode);
          } else {
            setIsLoadingSnippets(false);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsCheckingOnboarding(false);
      }
    }

    async function fetchSnippets(stateCode: string) {
      try {
        const snippetsRef = collection(db, 'stateSnippetObjects');
        const q = query(
          snippetsRef,
          where('stateCode', '==', stateCode),
          orderBy('dateCreated', 'desc'),
          limit(1)
        );


        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          if (data.snippets && Array.isArray(data.snippets)) {
            setSnippets(data.snippets);

            // Extract first article from each snippet for the horizontal bar
            const extractedArticles = data.snippets
              .map((snippet: Snippet, index: number) => {
                const firstArticle = snippet.articles?.[0];
                if (!firstArticle) return null;

                return {
                  id: `summary-${index}`,
                  category: 'Local Coverage',
                  title: firstArticle.formattedTitle || firstArticle.title,
                  location: firstArticle.parsedSource || firstArticle.source || 'Local Source',
                  link: firstArticle.link,
                  color: '#AD1457', // Fuchsia picado for local articles
                  icon: 'newspaper-variant-outline',
                  fullArticle: firstArticle
                };
              })
              .filter(Boolean);
            setSummaryArticles(extractedArticles);
          }
        }
      } catch (error) {
        console.error('Error fetching snippets:', error);
      } finally {
        setIsLoadingSnippets(false);
      }
    }

    async function fetchTargetingStatus(stateCode: string) {
      try {
        const statusRef = collection(db, 'stateTargetingStatus');
        const q = query(
          statusRef,
          where('stateCode', '==', stateCode),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          const statusCode = parseInt(data.targetingStatusCode);
          if (!isNaN(statusCode)) {
            setTargetingStatus(statusCode);
          }
        }
      } catch (error) {
        console.error('Error fetching targeting status:', error);
      }
    }

    async function fetchNationTopics() {
      try {
        const nationRef = collection(db, 'nationTopics');
        const q = query(nationRef, orderBy('dateCreated', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          if (data.topics && Array.isArray(data.topics)) {
            const articles = data.topics.map((topic: any, index: number) => {
              const firstArticle = topic.articles?.[0];
              if (!firstArticle) return null;

              // Map to horizontal scroll item format
              return {
                id: `nation-${index}`,
                category: topic.topicName || 'National Update',
                title: firstArticle.formattedTitle || firstArticle.title,
                location: firstArticle.parsedSource || firstArticle.source || 'Nationwide',
                link: firstArticle.link,
                color: '#00897B', // Turquoise for national articles
                icon: 'earth',
                fullArticle: firstArticle // Store full article for modal if needed
              };
            }).filter(Boolean);
            setNationArticles(articles);
          }
        }
      } catch (error) {
        console.error('Error fetching nation topics:', error);
      } finally {
        setIsLoadingNation(false);
      }
    }

    checkOnboarding();
    fetchNationTopics();
  }, [router]);

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

  const openArticles = (snippet: Snippet) => {
    triggerHaptic();
    setSelectedSnippet(snippet);
    setIsModalVisible(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedStoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleTextLayout = (event: any, id: string) => {
    const { lines } = event.nativeEvent;
    if (lines.length > 3) {
      setTruncatableStoryIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  const closeArticles = () => {
    setIsModalVisible(false);
    setSelectedSnippet(null);
  };

  if (isCheckingOnboarding) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff6e8', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#C2185B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff6e8' }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── Activity Near You ── */}
        <View className="mt-4 mb-6">
          <Text className="text-slate-800 text-lg font-bold px-5 mb-3">
            Activity near you
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const currentX = e.nativeEvent.contentOffset.x;
              const index = Math.round(currentX / NEWS_CARD_WIDTH);
              if (index !== lastNewsIndex.current) {
                triggerSelectionHaptic();
                lastNewsIndex.current = index;
              }
            }}
          >
            {(() => {
              const interleaved = [];
              const maxLen = Math.max(nationArticles.length, summaryArticles.length);
              for (let i = 0; i < maxLen; i++) {
                if (i < nationArticles.length) interleaved.push(nationArticles[i]);
                if (i < summaryArticles.length) interleaved.push(summaryArticles[i]);
              }
              return [...interleaved, ...NEWS_STORIES];
            })().map((story) => (
              <AnimatedNewsCard
                key={story.id}
                story={story}
                isExpanded={expandedStoryIds.has(story.id)}
                isTruncatable={truncatableStoryIds.has(story.id)}
                onToggleExpand={toggleExpand}
                onTextLayout={handleTextLayout}
                vibrationEnabled={vibrationEnabled}
              />
            ))}


          </ScrollView>

        </View>

        {/* ── Daily Summary ── */}
        <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: '#fff6e8', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#D7CCC8', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#4E342E' }}>Summary for {userState}</Text>
            <View style={{ marginLeft: 8, backgroundColor: '#FFEBEE', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ color: '#C62828', fontSize: 11, fontWeight: '700' }}>LIVE</Text>
            </View>
          </View>

          {targetingStatus === 1 && (
            <View style={{ backgroundColor: '#FFF9C4', borderRadius: 10, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#FFF59D' }}>
              <MaterialCommunityIcons name="alert-outline" size={18} color="#F57F17" style={{ marginRight: 10 }} />
              <Text style={{ color: '#E65100', fontSize: 13, fontWeight: '700', flex: 1 }}>
                Increased enforcement expected soon in {userState}
              </Text>
            </View>
          )}

          {targetingStatus === 2 && (
            <View style={{ backgroundColor: '#dc2626', borderRadius: 10, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="alert-outline" size={18} color="#ffffff" style={{ marginRight: 10 }} />
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700', flex: 1 }}>
                Increased enforcement targeting {userState}
              </Text>
            </View>
          )}

          {isLoadingSnippets ? (
            <ActivityIndicator color="#C2185B" style={{ marginVertical: 20 }} />
          ) : snippets.length > 0 ? (
            snippets.map((snippet, i) => (
              <AnimatedSummaryItem
                key={i}
                snippet={snippet}
                index={i}
                onOpenArticles={openArticles}
              />
            ))
          ) : (
            <Text style={{ color: '#6D4C41', fontSize: 13, textAlign: 'center', marginVertical: 10 }}>
              No recent alerts for {userState}.
            </Text>
          )}
        </View>

        {/* ── Know Your Rights CTA ── */}
        <TouchableOpacity
          onPress={() => router.push('/know-your-rights')}
          activeOpacity={0.85}
          style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: '#6A1B9A', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center' }}
        >
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
            <MaterialCommunityIcons name="scale-balance" size={26} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
              Know Your Rights
            </Text>
            <Text style={{ color: '#CE93D8', fontSize: 13, lineHeight: 18 }}>
              Tap here to learn what to do when confronted by immigration officials.
            </Text>
          </View>
          <Text style={{ color: '#CE93D8', fontSize: 20, marginLeft: 8 }}>›</Text>
        </TouchableOpacity>

        {/* ── Organizations ── */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: '#4E342E', fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 12 }}>
            Organizations
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const currentX = e.nativeEvent.contentOffset.x;
              const index = Math.round(currentX / ORG_CARD_WIDTH);
              if (index !== lastOrgIndex.current) {
                triggerSelectionHaptic();
                lastOrgIndex.current = index;
              }
            }}
          >
            {[
              {
                icon: 'bank-outline',
                name: 'ACLU',
                scope: 'Nationwide',
                scopeColor: '#BF360C',
                desc: 'Defends civil liberties and fights immigration rights abuses in court.',
                bg: '#FBE9E7',
                border: '#FFCCBC',
                url: 'https://www.aclu.org/',
              },
              {
                icon: 'scale-balance',
                name: 'NILC',
                scope: 'Nationwide',
                scopeColor: '#BF360C',
                desc: 'National Immigration Law Center — policy & legal defense for immigrants.',
                bg: '#FBE9E7',
                border: '#FFCCBC',
                url: 'https://www.nilc.org/',
              },
              {
                icon: 'handshake-outline',
                name: 'UnidosUS',
                scope: 'Nationwide',
                scopeColor: '#BF360C',
                desc: "The nation's largest Latino civil rights & advocacy organization.",
                bg: '#FBE9E7',
                border: '#FFCCBC',
                url: 'https://unidosus.org/',
              },
              {
                icon: 'book-open-page-variant-outline',
                name: 'ILRC',
                scope: 'Nationwide',
                scopeColor: '#BF360C',
                desc: 'Immigrant Legal Resource Center — legal training & educational materials.',
                bg: '#FBE9E7',
                border: '#FFCCBC',
                url: 'https://www.ilrc.org/',
              },
              {
                icon: 'home-outline',
                name: 'Local Legal Aid',
                scope: 'Local',
                scopeColor: '#2E7D32',
                desc: 'Free immigration legal services for low-income residents in your area.',
                bg: '#E8F5E9',
                border: '#A5D6A7',
                url: 'https://www.lawhelp.org/',
              },
              {
                icon: 'web',
                name: 'Comunidades Unidas',
                scope: 'Local',
                scopeColor: '#2E7D32',
                desc: 'Community-led organization supporting immigrant families nearby.',
                bg: '#E8F5E9',
                border: '#A5D6A7',
                url: 'https://www.cuutah.org/',
              },
              {
                icon: 'bullhorn-outline',
                name: 'Rapid Response Network',
                scope: 'Local',
                scopeColor: '#2E7D32',
                desc: 'Volunteer-run network that responds to enforcement activity in real time.',
                bg: '#E8F5E9',
                border: '#A5D6A7',
                url: 'https://www.pichr.org/rapid-response',
              },
            ].map((org) => (
              <TouchableOpacity
                key={org.name}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic();
                  Linking.openURL(org.url);
                }}
                style={{ width: 190, backgroundColor: org.bg, borderWidth: 1, borderColor: org.border, borderRadius: 16, padding: 14 }}
              >
                {/* Scope badge — top-right */}
                <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: org.scopeColor, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{org.scope.toUpperCase()}</Text>
                </View>

                <MaterialCommunityIcons name={org.icon as any} size={26} color={org.scopeColor} style={{ marginBottom: 8 }} />
                <Text style={{ color: '#4E342E', fontSize: 14, fontWeight: '700', marginBottom: 6, paddingRight: 60 }}>{org.name}</Text>
                <Text style={{ color: '#6D4C41', fontSize: 12, lineHeight: 17, marginBottom: 8 }}>{org.desc}</Text>

                {/* Bottom-right arrow indicator */}
                <View style={{ position: 'absolute', bottom: 12, right: 12 }}>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={org.scopeColor} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/volunteer')}
          style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: '#2E7D32', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center' }}
        >
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
            <MaterialCommunityIcons name="handshake-outline" size={26} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
              Volunteer
            </Text>
            <Text style={{ color: '#A5D6A7', fontSize: 13, lineHeight: 18 }}>
              Find organizations that need help or join our list to be contacted!
            </Text>
          </View>
          <Text style={{ color: '#A5D6A7', fontSize: 20, marginLeft: 8 }}>›</Text>
        </TouchableOpacity>

        {/* ── Get Organized ── */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: '#4E342E', fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 4 }}>
            Get Organized
          </Text>
          <Text style={{ color: '#6D4C41', fontSize: 13, paddingHorizontal: 20, marginBottom: 12 }}>
            Protests & actions happening near you
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const currentX = e.nativeEvent.contentOffset.x;
              const index = Math.round(currentX / EVENT_CARD_WIDTH);
              if (index !== lastEventIndex.current) {
                triggerSelectionHaptic();
                lastEventIndex.current = index;
              }
            }}
          >
            {[
              {
                icon: 'hand-front-right',
                title: 'Rally for Immigrant Rights',
                date: 'Sat, Mar 1 · 10:00 AM',
                location: 'City Hall Plaza',
                distance: '0.5 mi away',
                attendees: 340,
                color: '#6A1B9A',
                bg: '#F3E5F5',
                border: '#CE93D8',
              },
              {
                icon: 'bullhorn-outline',
                title: 'Community Vigil — No More Raids',
                date: 'Sun, Mar 2 · 6:00 PM',
                location: 'Riverside Park',
                distance: '1.2 mi away',
                attendees: 180,
                color: '#C62828',
                bg: '#FFEBEE',
                border: '#EF9A9A',
              },
              {
                icon: 'sign-text',
                title: 'March on Federal Building',
                date: 'Fri, Mar 7 · 9:00 AM',
                location: 'Federal Courthouse',
                distance: '2.0 mi away',
                attendees: 620,
                color: '#00897B',
                bg: '#E0F2F1',
                border: '#80CBC4',
              },
              {
                icon: 'handshake-outline',
                title: 'Know Your Rights Workshop',
                date: 'Thu, Mar 6 · 7:00 PM',
                location: 'Community Library',
                distance: '0.8 mi away',
                attendees: 95,
                color: '#2E7D32',
                bg: '#E8F5E9',
                border: '#A5D6A7',
              },
              {
                icon: 'volume-high',
                title: 'Call-In Day to Congress',
                date: 'Mon, Mar 3 · All Day',
                location: 'Virtual / Phone',
                distance: 'Anywhere',
                attendees: 1200,
                color: '#E65100',
                bg: '#FFF3E0',
                border: '#FFCC80',
              },
            ].map((event) => (
              <View
                key={event.title}
                style={{ width: 210, backgroundColor: event.bg, borderWidth: 1, borderColor: event.border, borderRadius: 16, padding: 14 }}
              >
                {/* Top row: icon + attendee count */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: event.color, justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons name={event.icon as any} size={22} color="#ffffff" />
                  </View>
                  <View style={{ backgroundColor: event.color + '22', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="account-group-outline" size={12} color={event.color} style={{ marginRight: 3 }} />
                    <Text style={{ color: event.color, fontSize: 11, fontWeight: '700' }}>{event.attendees.toLocaleString()}</Text>
                  </View>
                </View>

                {/* Title */}
                <Text style={{ color: '#4E342E', fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 8 }}>
                  {event.title}
                </Text>

                {/* Date & location */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <MaterialCommunityIcons name="calendar-outline" size={12} color="#6D4C41" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#6D4C41', fontSize: 11 }}>{event.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="map-marker-outline" size={12} color="#6D4C41" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#6D4C41', fontSize: 11 }}>{event.location} · {event.distance}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Quick Actions ── */}
        <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 20 }}>
          {[
            { icon: 'alert-outline', label: 'Alerts', onPress: handleResetOnboarding },
            { icon: 'scale-balance', label: 'Know Your\nRights', onPress: () => router.push('/know-your-rights') },
            { icon: 'hand-front-right', label: 'Organize', onPress: undefined },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.7}
              onPress={item.onPress}
              style={{ flex: 1, backgroundColor: '#FBE9E7', borderWidth: 1, borderColor: '#FFCCBC', borderRadius: 14, padding: 14, alignItems: 'center' }}
            >
              <MaterialCommunityIcons name={item.icon as any} size={22} color="#BF360C" style={{ marginBottom: 4 }} />
              <Text style={{ color: '#BF360C', fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 15 }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* ── Articles Bottom Sheet Modal ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeArticles}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFF8E1', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 40, height: '70%', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10 }}>
            {/* Grabber */}
            <View style={{ width: 40, height: 5, backgroundColor: '#D7CCC8', borderRadius: 3, alignSelf: 'center', marginVertical: 12 }} />

            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#4E342E' }}>Related Articles</Text>
              <TouchableOpacity onPress={closeArticles} className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                <Text style={{ fontSize: 18, color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedSnippet?.articles && selectedSnippet.articles.length > 0 ? (
                selectedSnippet.articles.map((article, index) => (
                  <View key={index} style={{ marginBottom: 16, padding: 16, backgroundColor: '#FFF6E8', borderRadius: 16, borderWidth: 1, borderColor: '#FFE0B2' }}>
                    <Text style={{ color: '#6D4C41', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>{article.parsedSource || article.source}</Text>
                    <Text style={{ color: '#4E342E', fontSize: 15, fontWeight: '700', lineHeight: 22, marginBottom: 12 }}>{article.formattedTitle || article.title}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        triggerHaptic();
                        article.link && Linking.openURL(article.link);
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Text style={{ color: '#E65100', fontSize: 13, fontWeight: '600' }}>Read full coverage</Text>
                      <Text style={{ color: '#E65100', fontSize: 16, marginLeft: 4 }}>›</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <MaterialCommunityIcons name="newspaper-variant-outline" size={40} color="#6D4C41" style={{ marginBottom: 16 }} />
                  <Text style={{ color: '#6D4C41', fontSize: 14 }}>No specific articles found for this snippet.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

