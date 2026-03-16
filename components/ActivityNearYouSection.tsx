import React, { type MutableRefObject } from 'react';
import { ScrollView, Text, View } from 'react-native';

interface ActivityNearYouSectionProps {
  NEWS_CARD_WIDTH: number;
  lastNewsIndex: MutableRefObject<number>;
  triggerSelectionHaptic: () => void;
  nationArticles: any[];
  summaryArticles: any[];
  NEWS_STORIES: any[];
  AnimatedNewsCard: React.ComponentType<{
    story: any;
    isExpanded: boolean;
    isTruncatable: boolean;
    onToggleExpand: (id: string) => void;
    onTextLayout: (event: any, id: string) => void;
    vibrationEnabled: boolean;
  }>;
  expandedStoryIds: Set<string>;
  truncatableStoryIds: Set<string>;
  toggleExpand: (id: string) => void;
  handleTextLayout: (event: any, id: string) => void;
  vibrationEnabled: boolean;
}

const ActivityNearYouSection = ({
  NEWS_CARD_WIDTH,
  lastNewsIndex,
  triggerSelectionHaptic,
  nationArticles,
  summaryArticles,
  NEWS_STORIES,
  AnimatedNewsCard,
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

