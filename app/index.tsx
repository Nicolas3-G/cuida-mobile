import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Linking, Animated, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GetOrganizedSection from '../components/GetOrganizedSection';
import OrganizationsSection from '../components/OrganizationsSection';
import ArticlesListModal from '../components/ArticlesListModal';
import VolunteerCTA from '../components/VolunteerCTA';
import KnowYourRightsCTA from '../components/KnowYourRightsCTA';
import DailySummarySection from '../components/DailySummarySection';
import ActivityNearYouSection from '../components/ActivityNearYouSection';

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
  const [localOrganizations, setLocalOrganizations] = useState<any[]>([]);
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [expandedStoryIds, setExpandedStoryIds] = useState<Set<string>>(new Set());
  const [truncatableStoryIds, setTruncatableStoryIds] = useState<Set<string>>(new Set());
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(true);
  const [isLoadingNation, setIsLoadingNation] = useState(true);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
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
          const savedLocation = await AsyncStorage.getItem('userLocation');
          setUserState(savedLocation || stateCode || 'your area');

          console.log("Use Effect Running...", stateCode)
          if (stateCode) {
            fetchSnippets(stateCode);
            fetchTargetingStatus(stateCode);
          } else {
            setIsLoadingSnippets(false);
          }

          // Fetch local organizations based on the user's saved city/location.
          if (savedLocation) {
            fetchLocalOrganizations(savedLocation);
            fetchLocalEvents(savedLocation);
          } else {
            setIsLoadingOrgs(false);
            setIsLoadingEvents(false);
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

    async function fetchLocalEvents(city: string) {
      try {
        const normalizedCity = city.trim().toLowerCase();
        const eventsRef = collection(db, 'localEvents');
        const q = query(eventsRef, where('city', '==', normalizedCity), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as any;
          if (data.events && Array.isArray(data.events)) {
            const mapped = data.events.map((event: any, index: number) => {
              const summary = event.summary || {};
              const title = event.shortName || event.name || 'Community event';
              const dateLabel =
                event.date && event.startTime
                  ? `${event.date} · ${event.startTime}${event.endTime ? `–${event.endTime}` : ''}`
                  : event.date || '';
              const location =
                event.venue ||
                event.address ||
                event.location ||
                normalizedCity;

              return {
                id: event.id || `local-event-${index}`,
                icon: event.icon || 'hand-front-right',
                title,
                date: dateLabel,
                location,
                distance: event.venueType === 'virtual' ? 'Online' : 'Nearby',
                attendees: event.attendees || 0,
                color: '#2E7D32',
                bg: '#E8F5E9',
                border: '#A5D6A7',
                url: event.url || null,
                description: summary.shortSummary || summary.longSummary || '',
              };
            });
            setLocalEvents(mapped);
          }
        }
      } catch (error) {
        console.error('Error fetching local events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    }

    async function fetchLocalOrganizations(city: string) {
      try {
        const normalizedCity = city.trim().toLowerCase();
        const orgsRef = collection(db, 'localOrganizations');
        const q = query(orgsRef, where('city', '==', normalizedCity), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as any;
          if (data.organizations && Array.isArray(data.organizations)) {
            const mapped = data.organizations.map((org: any, index: number) => {
              const summary = org.summary || {};
              const name = org.shortName || org.name || 'Local organization';
              const desc = summary.shortSummary || summary.longSummary || '';

              return {
                id: org.id || `local-org-${index}`,
                icon: org.icon || 'home-outline',
                name,
                scope: org.scope || 'Local',
                scopeColor: '#2E7D32',
                desc,
                bg: '#E8F5E9',
                border: '#A5D6A7',
                url: org.url || org.website || null,
              };
            });
            setLocalOrganizations(mapped);
          }
        }
      } catch (error) {
        console.error('Error fetching local organizations:', error);
      } finally {
        setIsLoadingOrgs(false);
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
        <ActivityNearYouSection
          NEWS_CARD_WIDTH={NEWS_CARD_WIDTH}
          lastNewsIndex={lastNewsIndex}
          triggerSelectionHaptic={triggerSelectionHaptic}
          nationArticles={nationArticles}
          summaryArticles={summaryArticles}
          NEWS_STORIES={NEWS_STORIES}
          AnimatedNewsCard={AnimatedNewsCard}
          expandedStoryIds={expandedStoryIds}
          truncatableStoryIds={truncatableStoryIds}
          toggleExpand={toggleExpand}
          handleTextLayout={handleTextLayout}
          vibrationEnabled={vibrationEnabled}
        />

        {/* ── Daily Summary ── */}
        <DailySummarySection
          userState={userState}
          targetingStatus={targetingStatus}
          isLoadingSnippets={isLoadingSnippets}
          snippets={snippets}
          AnimatedSummaryItem={AnimatedSummaryItem}
          openArticles={openArticles}
        />

        {/* ── Know Your Rights CTA ── */}
        <KnowYourRightsCTA onPress={() => router.push('/know-your-rights')} />

        {/* ── Organizations ── */}
        <OrganizationsSection
          isLoadingOrgs={isLoadingOrgs}
          localOrganizations={localOrganizations}
          lastOrgIndex={lastOrgIndex}
          ORG_CARD_WIDTH={ORG_CARD_WIDTH}
          triggerSelectionHaptic={triggerSelectionHaptic}
        />

        {/* ── Volunteer CTA ── */}
        <VolunteerCTA onPress={() => router.push('/volunteer')} />

        {/* ── Get Organized ── */}
        <GetOrganizedSection
          isLoadingEvents={isLoadingEvents}
          localEvents={localEvents}
          lastEventIndex={lastEventIndex}
          triggerSelectionHaptic={triggerSelectionHaptic}
        />

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

      <ArticlesListModal
        visible={isModalVisible}
        onClose={closeArticles}
        snippet={selectedSnippet}
        triggerHaptic={() => triggerHaptic()}
      />
    </SafeAreaView>
  );
}

