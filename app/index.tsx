import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import * as Haptics from 'expo-haptics';
import GetOrganizedSection from '../components/GetOrganizedSection';
import OrganizationsSection from '../components/OrganizationsSection';
import ArticlesListModal from '../components/ArticlesListModal';
import VolunteerCTA from '../components/VolunteerCTA';
import KnowYourRightsCTA from '../components/KnowYourRightsCTA';
import DailySummarySection from '../components/DailySummarySection';
import ActivityNearYouSection from '../components/ActivityNearYouSection';

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
          lastNewsIndex={lastNewsIndex}
          triggerSelectionHaptic={triggerSelectionHaptic}
          nationArticles={nationArticles}
          summaryArticles={summaryArticles}
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

