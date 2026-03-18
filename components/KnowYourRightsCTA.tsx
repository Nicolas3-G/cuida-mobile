import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface KnowYourRightsCTAProps {
  onPress: () => void;
}

const KnowYourRightsCTA = ({ onPress }: KnowYourRightsCTAProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="mx-5 mb-5 flex-row items-center rounded-2xl bg-[#6A1B9A] p-5"
    >
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-[14px] bg-white/20">
        <MaterialCommunityIcons name="scale-balance" size={26} color="#ffffff" />
      </View>
      <View className="flex-1">
        <Text className="mb-1 text-[16px] font-bold text-white">
          Know Your Rights
        </Text>
        <Text className="text-[13px] leading-[18px] text-[#CE93D8]">
          Tap here to learn what to do when confronted by immigration officials.
        </Text>
      </View>
      <Text className="ml-2 text-[20px] text-[#CE93D8]">›</Text>
    </TouchableOpacity>
  );
};

export default KnowYourRightsCTA;

