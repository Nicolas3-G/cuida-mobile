import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface VolunteerCTAProps {
  onPress: () => void;
}

const VolunteerCTA = ({ onPress }: VolunteerCTAProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="mx-5 mb-5 flex-row items-center rounded-2xl bg-[#2E7D32] p-5"
    >
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-[14px] bg-white/20">
        <MaterialCommunityIcons name="handshake-outline" size={26} color="#ffffff" />
      </View>
      <View className="flex-1">
        <Text className="mb-1 text-[16px] font-bold text-white">
          Volunteer
        </Text>
        <Text className="text-[13px] leading-[18px] text-[#A5D6A7]">
          Find organizations that need help or join our list to be contacted!
        </Text>
      </View>
      <Text className="ml-2 text-[20px] text-[#A5D6A7]">›</Text>
    </TouchableOpacity>
  );
};

export default VolunteerCTA;

