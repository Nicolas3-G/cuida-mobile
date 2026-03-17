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
        {snippet.scope && (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: snippet.scope === 'local' ? '#E8F5E9' : '#E3F2FD',
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 2,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 0.5,
                color: snippet.scope === 'local' ? '#2E7D32' : '#1565C0',
                textTransform: 'uppercase',
              }}
            >
                  {snippet.scope === 'local' ? 'Near you' : 'In your state'}
            </Text>
          </View>
        )}
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
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#fff6e8',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#D7CCC8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#4E342E' }}>Summary for {userState}</Text>
        <View
          style={{
            marginLeft: 8,
            backgroundColor: '#FFEBEE',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: '#C62828', fontSize: 11, fontWeight: '700' }}>LIVE</Text>
        </View>
      </View>

      {targetingStatus === 1 && (
        <View
          style={{
            backgroundColor: '#FFF9C4',
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#FFF59D',
          }}
        >
          <MaterialCommunityIcons
            name="alert-outline"
            size={18}
            color="#F57F17"
            style={{ marginRight: 10 }}
          />
          <Text style={{ color: '#E65100', fontSize: 13, fontWeight: '700', flex: 1 }}>
            Increased enforcement expected soon in {userState}
          </Text>
        </View>
      )}

      {targetingStatus === 2 && (
        <View
          style={{
            backgroundColor: '#dc2626',
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="alert-outline"
            size={18}
            color="#ffffff"
            style={{ marginRight: 10 }}
          />
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
        <Text
          style={{
            color: '#6D4C41',
            fontSize: 13,
            textAlign: 'center',
            marginVertical: 10,
          }}
        >
          No recent alerts for {userState}.
        </Text>
      )}
    </View>
  );
};

export default DailySummarySection;

