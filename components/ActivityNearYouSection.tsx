import React, { useRef, type MutableRefObject } from 'react';
import { ScrollView, Text, View, Animated, Pressable, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const NEWS_CARD_WIDTH = 232; // 220 + 12 gap

const NEWS_STORIES = [
  { id: '1', category: 'Alert', title: 'ICE checkpoint reported near Central Ave', location: 'Central Ave, 0.4 mi away', color: '#C62828', icon: 'alert-outline' },
  { id: '2', category: 'Know Your Rights', title: "You have the right to remain silent — here's what to say", location: 'Tap to read', color: '#6A1B9A', icon: 'scale-balance' },
  { id: '3', category: 'Operation Report', title: 'Increased enforcement spotted near Eastside Market', location: 'Eastside, 1.1 mi away', color: '#E65100', icon: 'clipboard-text-outline' },
  { id: '4', category: 'Get Involved', title: 'Community rapid response network meeting this Friday', location: 'Community Center, 0.6 mi away', color: '#2E7D32', icon: 'hand-front-right' },
  { id: '5', category: 'Resource', title: 'Free legal consultations — immigration attorneys on call', location: 'Legal Aid Office, 1.8 mi away', color: '#00897B', icon: 'phone-outline' },
];

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
              {story.category}
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
                  {isExpanded ? 'Show less' : 'More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mt-1 flex-row items-center">
            <View className="mr-[3px]">
              <MaterialCommunityIcons name="map-marker-outline" size={13} color="rgba(255,255,255,0.65)" />
            </View>
            <Text className="text-[11px] text-[rgba(255,255,255,0.65)]">
              {story.location}
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
  expandedStoryIds,
  truncatableStoryIds,
  toggleExpand,
  handleTextLayout,
  vibrationEnabled,
}: ActivityNearYouSectionProps) => {
  return (
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
          const interleaved: any[] = [];
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
  );
};

export default ActivityNearYouSection;

