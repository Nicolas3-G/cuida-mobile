import React, { useRef, type MutableRefObject } from 'react';
import { ScrollView, View, Animated, Pressable, TouchableOpacity, Linking } from 'react-native';
import { Text } from './Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../contexts/LanguageContext';

const NEWS_CARD_WIDTH = 232; // 220 + 12 gap

// Data hooks emit fixed English category/fallback labels; map them to locale keys at render time
const CATEGORY_KEYS: Record<string, string> = {
  'Local Coverage': 'home.categoryLocal',
  'Statewide coverage': 'home.categoryStatewide',
  'National Update': 'home.categoryNational',
};

const LOCATION_KEYS: Record<string, string> = {
  'Local Source': 'home.sourceLocal',
  'Statewide source': 'home.sourceStatewide',
  'Nationwide': 'home.sourceNationwide',
};

interface AnimatedNewsCardProps {
  story: any;
  isExpanded: boolean;
  isTruncatable: boolean;
  onToggleExpand: (id: string) => void;
  onTextLayout: (event: any, id: string) => void;
  vibrationEnabled: boolean;
}

const AnimatedNewsCard = ({ story, isExpanded, isTruncatable, onToggleExpand, onTextLayout, vibrationEnabled }: AnimatedNewsCardProps) => {
  const { t } = useTranslation();
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
      className="min-h-[120px] w-[220px] overflow-hidden rounded-2xl"
      style={{
        transform: [{ scale: scaleValue }],
        backgroundColor: story.color,
      }}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          triggerHaptic();
          story.link && Linking.openURL(story.link);
        }}
        className="flex-grow"
        style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
      >
        <View className="flex-1 justify-between p-3">
          <View>
            <Text className="mb-1 text-[10px] font-semibold uppercase text-[rgba(255,255,255,0.75)]">
              {CATEGORY_KEYS[story.category] ? t(CATEGORY_KEYS[story.category]) : story.category}
            </Text>

            <Text
              className="absolute w-[196px] opacity-0 text-[13px] font-bold leading-[18px]"
              onTextLayout={(e) => onTextLayout(e, story.id)}
            >
              {story.title}
            </Text>

            <Text
              className="mb-0.5 text-[13px] font-bold leading-[18px] text-white"
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
                className="mb-1.5 self-start"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="text-[11px] font-semibold text-[rgba(255,255,255,0.8)] underline">
                  {isExpanded ? t('home.showLess') : t('home.more')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mt-1 flex-row items-start">
            <View className="mr-[3px] mt-[1px]">
              <MaterialCommunityIcons name="map-marker-outline" size={13} color="rgba(255,255,255,0.65)" />
            </View>
            <Text className="flex-1 pr-1 text-[11px] text-[rgba(255,255,255,0.65)]">
              {LOCATION_KEYS[story.location] ? t(LOCATION_KEYS[story.location]) : story.location}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

interface ActivityNearYouSectionProps {
  lastNewsIndex: MutableRefObject<number>;
  triggerSelectionHaptic: () => void;
  nationArticles: any[];
  summaryArticles: any[];
  localEvents: any[];
  expandedStoryIds: Set<string>;
  truncatableStoryIds: Set<string>;
  toggleExpand: (id: string) => void;
  handleTextLayout: (event: any, id: string) => void;
  vibrationEnabled: boolean;
}

const ActivityNearYouSection = ({
  lastNewsIndex,
  triggerSelectionHaptic,
  nationArticles,
  summaryArticles,
  localEvents,
  expandedStoryIds,
  truncatableStoryIds,
  toggleExpand,
  handleTextLayout,
  vibrationEnabled,
}: ActivityNearYouSectionProps) => {
  const { t } = useTranslation();
  // Surface the first nearby event (from the Get Organized data) as a card
  const nearbyEvent = localEvents.length > 0 ? localEvents[0] : null;
  const eventCard = nearbyEvent
    ? {
        id: `activity-event-${nearbyEvent.id}`,
        category: t('home.eventNearYou'),
        title: nearbyEvent.title,
        location: [nearbyEvent.location, nearbyEvent.date].filter(Boolean).join(' · '),
        color: '#00897B',
        icon: nearbyEvent.icon,
        link: nearbyEvent.url,
      }
    : null;

  const interleaved: any[] = [];
  const maxLen = Math.max(nationArticles.length, summaryArticles.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < nationArticles.length) interleaved.push(nationArticles[i]);
    if (i < summaryArticles.length) interleaved.push(summaryArticles[i]);
  }
  // Event card slots in as the third card (or at the end if fewer articles)
  const cards = [...interleaved];
  if (eventCard) {
    cards.splice(Math.min(2, cards.length), 0, eventCard);
  }

  if (cards.length === 0) {
    return (
      <View className="mt-4 mb-6">
        <Text className="text-slate-800 text-lg font-bold px-5 mb-3">
          {t('home.activityNearYou')}
        </Text>
        <View className="mx-5 rounded-2xl border border-slate-200 bg-white px-4 py-5">
          <Text className="text-center text-[13px] text-slate-500">
            {t('home.noRecentActivity')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-4 mb-6">
      <Text className="text-slate-800 text-lg font-bold px-5 mb-3">
        {t('home.activityNearYou')}
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
        {cards.map((story) => (
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
  );
};

export default ActivityNearYouSection;

