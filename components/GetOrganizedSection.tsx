import React, { type MutableRefObject } from 'react';
import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface GetOrganizedSectionProps {
  isLoadingEvents: boolean;
  localEvents: any[];
  lastEventIndex: MutableRefObject<number>;
  triggerSelectionHaptic: () => void;
}

const GetOrganizedSection = ({
  isLoadingEvents,
  localEvents,
  lastEventIndex,
  triggerSelectionHaptic,
}: GetOrganizedSectionProps) => {
  const EVENT_CARD_WIDTH = 222; // 210 + 12 gap

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: '#4E342E', fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 4 }}>
        Get Organized
      </Text>
      <Text style={{ color: '#6D4C41', fontSize: 13, paddingHorizontal: 20, marginBottom: 12 }}>
        Protests & actions happening near you
      </Text>

      {isLoadingEvents ? (
        <ActivityIndicator color="#C2185B" style={{ marginVertical: 10 }} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const currentX = e.nativeEvent.contentOffset.x;
            const index = Math.round(currentX / EVENT_CARD_WIDTH);
            if (index !== lastEventIndex.current) {
              triggerSelectionHaptic();
              lastEventIndex.current = index;
            }
          }}
        >
          {localEvents.map((event) => (
            <TouchableOpacity
              key={event.id || event.title}
              activeOpacity={0.85}
              onPress={() => {
                if (event.url) Linking.openURL(event.url);
              }}
              style={{ width: 210, backgroundColor: event.bg, borderWidth: 1, borderColor: event.border, borderRadius: 16, padding: 14 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: event.color, justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name={event.icon as any} size={22} color="#ffffff" />
                </View>
                {typeof event.attendees === 'number' && event.attendees > 0 && (
                  <View style={{ backgroundColor: event.color + '22', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="account-group-outline" size={12} color={event.color} style={{ marginRight: 3 }} />
                    <Text style={{ color: event.color, fontSize: 11, fontWeight: '700' }}>{event.attendees.toLocaleString()}</Text>
                  </View>
                )}
              </View>

              <Text style={{ color: '#4E342E', fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 8 }}>
                {event.title}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialCommunityIcons name="calendar-outline" size={12} color="#6D4C41" style={{ marginRight: 4 }} />
                <Text style={{ color: '#6D4C41', fontSize: 11 }}>{event.date}</Text>
              </View>
              {event.time ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color="#6D4C41" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#6D4C41', fontSize: 11 }}>{event.time}</Text>
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="map-marker-outline" size={12} color="#6D4C41" style={{ marginRight: 4 }} />
                <Text style={{ color: '#6D4C41', fontSize: 11 }}>{event.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default GetOrganizedSection;

