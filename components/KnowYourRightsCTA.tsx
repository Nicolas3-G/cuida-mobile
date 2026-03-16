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
      style={{
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#6A1B9A',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.2)',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
        }}
      >
        <MaterialCommunityIcons name="scale-balance" size={26} color="#ffffff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
          Know Your Rights
        </Text>
        <Text style={{ color: '#CE93D8', fontSize: 13, lineHeight: 18 }}>
          Tap here to learn what to do when confronted by immigration officials.
        </Text>
      </View>
      <Text style={{ color: '#CE93D8', fontSize: 20, marginLeft: 8 }}>›</Text>
    </TouchableOpacity>
  );
};

export default KnowYourRightsCTA;

