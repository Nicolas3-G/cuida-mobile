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
      <View className="flex-1 justify-end bg-black/50">
        <View className="h-[70%] rounded-t-3xl bg-[#FFF8E1] px-5 pb-10 shadow-lg">
          <View className="my-3 h-1.5 w-10 self-center rounded-[3px] bg-[#D7CCC8]" />

          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-[20px] font-extrabold text-[#4E342E]">Related Articles</Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-200"
            >
              <Text className="text-[18px] text-slate-500">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {snippet?.articles && snippet.articles.length > 0 ? (
              snippet.articles.map((article, index) => (
                <View
                  key={index}
                  className="mb-4 rounded-2xl border border-[#FFE0B2] bg-[#FFF6E8] p-4"
                >
                  <Text className="mb-1 text-[11px] font-bold uppercase text-[#6D4C41]">
                    {article.parsedSource || article.source}
                  </Text>
                  <Text className="mb-3 text-[15px] font-bold leading-[22px] text-[#4E342E]">
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
                    className="flex-row items-center"
                  >
                    <Text className="text-[13px] font-semibold text-[#E65100]">Read full coverage</Text>
                    <Text className="ml-1 text-[16px] text-[#E65100]">›</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View className="items-center py-10">
                <View className="mb-4">
                  <MaterialCommunityIcons
                    name="newspaper-variant-outline"
                    size={40}
                    color="#6D4C41"
                  />
                </View>
                <Text className="text-sm text-[#6D4C41]">No specific articles found for this snippet.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ArticlesListModal;

