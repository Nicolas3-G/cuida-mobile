import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ScrollView, View, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import EventsSection from '../components/EventsSection';
import OrganizationsSection from '../components/OrganizationsSection';
import ArticlesListModal from '../components/ArticlesListModal';
import VolunteerCTA from '../components/VolunteerCTA';
import KnowYourRightsCTA from '../components/KnowYourRightsCTA';
import DailySummarySection from '../components/DailySummarySection';
import ActivityNearYouSection from '../components/ActivityNearYouSection';
import { useSnippets, type Snippet } from '../hooks/useSnippets';
import { useTargetingStatus } from '../hooks/useTargetingStatus';
import { useNationTopics } from '../hooks/useNationTopics';
import { useLocalEvents } from '../hooks/useLocalEvents';
import { useLocalOrganizations } from '../hooks/useLocalOrganizations';
import { useStateOrganizations } from '../hooks/useStateOrganizations';
import { useTranslation } from '../contexts/LanguageContext';
import { SUPPORTED_CITIES } from '../constants/stateCities';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [stateCode, setStateCode] = useState<string | null>(null);
  const [savedLocation, setSavedLocation] = useState<string | null>(null);
  const [userState, setUserState] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { snippets, summaryArticles, allSummaryArticles, isLoading: isLoadingSnippets } = useSnippets(stateCode, savedLocation, refreshKey);
  const { targetingStatus } = useTargetingStatus(savedLocation, stateCode, refreshKey);
  const { nationArticles, isLoading: isLoadingNation } = useNationTopics(refreshKey);
  const { events: localEvents, isLoading: isLoadingEvents } = useLocalEvents(savedLocation, refreshKey);
  const { organizations: localOrganizations, isLoading: isLoadingOrgs } = useLocalOrganizations(savedLocation, refreshKey);
  const { organizations: stateOrganizations, isLoading: isLoadingStateOrgs } = useStateOrganizations(stateCode, refreshKey);

  // State-level = no supported city selected (savedLocation holds the state name instead of a city).
  const isStateLevel = !savedLocation || !SUPPORTED_CITIES.some(
    (c) => c.toLowerCase() === savedLocation.trim().toLowerCase()
  );

  // State-level users see curated statewide orgs; city users see local ones.
  const orgsForSection = isStateLevel ? stateOrganizations : localOrganizations;
  const orgsSectionLoading = isStateLevel ? isLoadingStateOrgs : isLoadingOrgs;

  const [expandedStoryIds, setExpandedStoryIds] = useState<Set<string>>(new Set());
  const [truncatableStoryIds, setTruncatableStoryIds] = useState<Set<string>>(new Set());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);

  const lastNewsIndex = useRef(0);
  const lastOrgIndex = useRef(0);
  const lastEventIndex = useRef(0);

  useFocusEffect(
    useCallback(() => {
      async function loadVibrationSetting() {
        const vib = await AsyncStorage.getItem('userVibrationEnabled');
        if (vib !== null) setVibrationEnabled(vib === 'true');
      }
      loadVibrationSetting();
    }, [])
  );

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!hasSeen) {
          router.replace('/onboarding');
          return;
        }
        const code = await AsyncStorage.getItem('userStateCode');
        const location = await AsyncStorage.getItem('userLocation');
        setStateCode(code);
        setSavedLocation(location);
        // Store the raw value only — the translated fallback is applied at render
        // time. Calling t() here would put it in this effect's deps, and t is a new
        // reference on every language change, which re-ran this effect mid-onboarding
        // and bounced the user back to the first onboarding screen.
        setUserState(location || code || '');
        setIsCheckingOnboarding(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsCheckingOnboarding(false);
      }
    }
    checkOnboarding();
  }, [router]);

  // End the pull-to-refresh spinner only after a refresh actually started
  // loading and then finished (the loading flags flip on a later render).
  const refreshStartedRef = useRef(false);
  const anyLoading = isLoadingSnippets || isLoadingNation || isLoadingEvents || isLoadingOrgs;
  useEffect(() => {
    if (!isRefreshing) return;
    if (anyLoading) {
      refreshStartedRef.current = true;
    } else if (refreshStartedRef.current) {
      refreshStartedRef.current = false;
      setIsRefreshing(false);
    }
  }, [isRefreshing, anyLoading]);

  const handleRefresh = () => {
    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
  };

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
      <View className="flex-1 items-center justify-center bg-[#fff6e8]">
        <ActivityIndicator size="large" color="#C2185B" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fff6e8]" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#C2185B"
            colors={['#C2185B']}
          />
        }
      >

        {/* ── Activity Near You ── */}
        <ActivityNearYouSection
          lastNewsIndex={lastNewsIndex}
          triggerSelectionHaptic={triggerSelectionHaptic}
          nationArticles={nationArticles}
          summaryArticles={allSummaryArticles}
          localEvents={localEvents}
          expandedStoryIds={expandedStoryIds}
          truncatableStoryIds={truncatableStoryIds}
          toggleExpand={toggleExpand}
          handleTextLayout={handleTextLayout}
          vibrationEnabled={vibrationEnabled}
        />

        {/* ── Daily Summary ── */}
        <DailySummarySection
          userState={userState || t('home.yourArea')}
          targetingStatus={targetingStatus}
          isLoadingSnippets={isLoadingSnippets}
          snippets={snippets}
          openArticles={openArticles}
        />

        {/* ── Know Your Rights CTA ── */}
        <KnowYourRightsCTA onPress={() => router.push('/know-your-rights')} />

        {/* ── Organizations ── */}
        <OrganizationsSection
          isLoadingOrgs={orgsSectionLoading}
          localOrganizations={orgsForSection}
          lastOrgIndex={lastOrgIndex}
          triggerSelectionHaptic={triggerSelectionHaptic}
        />

        {/* ── Volunteer CTA ── */}
        <VolunteerCTA onPress={() => router.push('/volunteer')} />

        {/* ── Get Organized ── */}
        <EventsSection
          isLoadingEvents={isLoadingEvents}
          localEvents={localEvents}
          lastEventIndex={lastEventIndex}
          triggerSelectionHaptic={triggerSelectionHaptic}
          isStateLevel={isStateLevel}
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

