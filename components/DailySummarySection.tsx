import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Snippet {
  snippetText: string;
  articles?: any[];
  scope?: 'local' | 'state';
}

interface AnimatedSummaryItemProps {
  snippet: Snippet;
  index: number;
  onOpenArticles: (snippet: Snippet) => void;
}

const AnimatedSummaryItem = ({ snippet, index, onOpenArticles }: AnimatedSummaryItemProps) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 150,
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
      className="mb-4 flex-row items-start"
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
    >
      <View className="mr-1.5 mt-0.5">
        <MaterialCommunityIcons name="circle-small" size={20} color="#F57C00" />
      </View>
      <View className="flex-1 border-l-2 border-l-[#F57C00] pl-2.5">
        {snippet.scope && (
          <View
            className={`mb-1 self-start rounded-full px-2 py-0.5 ${snippet.scope === 'local' ? 'bg-[#E8F5E9]' : 'bg-[#E3F2FD]'}`}
          >
            <Text
              className={`text-[10px] font-bold uppercase tracking-wide ${snippet.scope === 'local' ? 'text-[#2E7D32]' : 'text-[#1565C0]'}`}
            >
              {snippet.scope === 'local' ? 'Near you' : 'In your state'}
            </Text>
          </View>
        )}
        <Text className="mb-1.5 text-[13px] leading-[19px] text-[#5D4037]">{snippet.snippetText}</Text>
        {snippet.articles && snippet.articles.length > 0 && (
          <TouchableOpacity
            onPress={() => onOpenArticles(snippet)}
            className="self-start rounded-md bg-[#FFF8E1] px-2.5 py-1"
          >
            <Text className="text-[11px] font-semibold text-[#E65100]">More ›</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

interface DailySummarySectionProps {
  userState: string;
  targetingStatus: number;
  isLoadingSnippets: boolean;
  snippets: Snippet[];
  openArticles: (snippet: Snippet) => void;
}

const DailySummarySection = ({
  userState,
  targetingStatus,
  isLoadingSnippets,
  snippets,
  openArticles,
}: DailySummarySectionProps) => {
  return (
    <View className="mx-5 mb-5 rounded-2xl border border-[#D7CCC8] bg-[#fff6e8] p-5 shadow-md">
      <View className="mb-3.5 flex-row items-center">
        <Text className="text-[18px] font-bold text-[#4E342E]">Summary for {userState}</Text>
        <View className="ml-2 rounded-md bg-[#FFEBEE] px-2 py-0.5">
          <Text className="text-[11px] font-bold text-[#C62828]">LIVE</Text>
        </View>
      </View>

      {targetingStatus === 1 && (
        <View className="mb-4 flex-row items-center rounded-[10px] border border-[#FFF59D] bg-[#FFF9C4] p-3">
          <View className="mr-2.5">
            <MaterialCommunityIcons
              name="alert-outline"
              size={18}
              color="#F57F17"
            />
          </View>
          <Text className="flex-1 text-[13px] font-bold text-[#E65100]">
            Increased enforcement expected soon in {userState}
          </Text>
        </View>
      )}

      {targetingStatus === 2 && (
        <View className="mb-4 flex-row items-center rounded-[10px] bg-red-600 p-3">
          <View className="mr-2.5">
            <MaterialCommunityIcons
              name="alert-outline"
              size={18}
              color="#ffffff"
            />
          </View>
          <Text className="flex-1 text-sm font-bold text-white">
            Increased enforcement targeting {userState}
          </Text>
        </View>
      )}

      {isLoadingSnippets ? (
        <ActivityIndicator color="#C2185B" className="my-5" />
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
        <Text className="my-2.5 text-center text-[13px] text-[#6D4C41]">
          No recent alerts for {userState}.
        </Text>
      )}
    </View>
  );
};

export default DailySummarySection;

