import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ScrollView, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import GetOrganizedSection from '../components/GetOrganizedSection';
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

export default function HomeScreen() {
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [stateCode, setStateCode] = useState<string | null>(null);
  const [savedLocation, setSavedLocation] = useState<string | null>(null);
  const [userState, setUserState] = useState('');

  const { snippets, summaryArticles, allSummaryArticles, isLoading: isLoadingSnippets } = useSnippets(stateCode, savedLocation);
  const { targetingStatus } = useTargetingStatus(savedLocation);
  const { nationArticles, isLoading: isLoadingNation } = useNationTopics();
  const { events: localEvents, isLoading: isLoadingEvents } = useLocalEvents(savedLocation);
  const { organizations: localOrganizations, isLoading: isLoadingOrgs } = useLocalOrganizations(savedLocation);

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
        setUserState(location || code || 'your area');
        setIsCheckingOnboarding(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsCheckingOnboarding(false);
      }
    }
    checkOnboarding();
  }, [router]);

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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ── Activity Near You ── */}
        <ActivityNearYouSection
          lastNewsIndex={lastNewsIndex}
          triggerSelectionHaptic={triggerSelectionHaptic}
          nationArticles={nationArticles}
          summaryArticles={allSummaryArticles}
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

