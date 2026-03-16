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
      style={{
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#2E7D32',
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
        <MaterialCommunityIcons name="handshake-outline" size={26} color="#ffffff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
          Volunteer
        </Text>
        <Text style={{ color: '#A5D6A7', fontSize: 13, lineHeight: 18 }}>
          Find organizations that need help or join our list to be contacted!
        </Text>
      </View>
      <Text style={{ color: '#A5D6A7', fontSize: 20, marginLeft: 8 }}>›</Text>
    </TouchableOpacity>
  );
};

export default VolunteerCTA;

