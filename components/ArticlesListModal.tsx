import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Article {
  title: string;
  formattedTitle?: string;
  link: string;
  source?: string;
  parsedSource?: string;
}

interface Snippet {
  snippetText: string;
  articles?: Article[];
}

interface ArticlesListModalProps {
  visible: boolean;
  onClose: () => void;
  snippet: Snippet | null;
  triggerHaptic: () => void;
}

const ArticlesListModal = ({ visible, onClose, snippet, triggerHaptic }: ArticlesListModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: '#FFF8E1',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingBottom: 40,
            height: '70%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
          }}
        >
          <View
            style={{
              width: 40,
              height: 5,
              backgroundColor: '#D7CCC8',
              borderRadius: 3,
              alignSelf: 'center',
              marginVertical: 12,
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#4E342E' }}>Related Articles</Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#e2e8f0',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18, color: '#64748b' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {snippet?.articles && snippet.articles.length > 0 ? (
              snippet.articles.map((article, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    backgroundColor: '#FFF6E8',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#FFE0B2',
                  }}
                >
                  <Text
                    style={{
                      color: '#6D4C41',
                      fontSize: 11,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    {article.parsedSource || article.source}
                  </Text>
                  <Text
                    style={{
                      color: '#4E342E',
                      fontSize: 15,
                      fontWeight: '700',
                      lineHeight: 22,
                      marginBottom: 12,
                    }}
                  >
                    {article.formattedTitle || article.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic();
                      if (article.link) {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        Linking.openURL(article.link);
                      }
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Text style={{ color: '#E65100', fontSize: 13, fontWeight: '600' }}>Read full coverage</Text>
                    <Text style={{ color: '#E65100', fontSize: 16, marginLeft: 4 }}>›</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <MaterialCommunityIcons
                  name="newspaper-variant-outline"
                  size={40}
                  color="#6D4C41"
                  style={{ marginBottom: 16 }}
                />
                <Text style={{ color: '#6D4C41', fontSize: 14 }}>No specific articles found for this snippet.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ArticlesListModal;

