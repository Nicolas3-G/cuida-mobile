import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Snippet {
  snippetText: string;
  articles?: any[];
}

interface DailySummarySectionProps {
  userState: string;
  targetingStatus: number;
  isLoadingSnippets: boolean;
  snippets: Snippet[];
  AnimatedSummaryItem: React.ComponentType<{
    snippet: Snippet;
    index: number;
    onOpenArticles: (snippet: Snippet) => void;
  }>;
  openArticles: (snippet: Snippet) => void;
}

const DailySummarySection = ({
  userState,
  targetingStatus,
  isLoadingSnippets,
  snippets,
  AnimatedSummaryItem,
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

