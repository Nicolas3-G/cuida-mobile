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
    <View className="mb-5">
      <Text className="mb-1 px-5 text-[18px] font-bold text-[#4E342E]">
        Get Organized
      </Text>
      <Text className="mb-3 px-5 text-[13px] text-[#6D4C41]">
        Protests & events happening near you
      </Text>

      {isLoadingEvents ? (
        <ActivityIndicator color="#C2185B" className="my-2.5" />
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
              className="w-[210px] rounded-2xl border p-3.5"
              style={{ backgroundColor: event.bg, borderColor: event.border }}
            >
              <View className="mb-2.5 flex-row items-start justify-between">
                <View
                  className="h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: event.color }}
                >
                  <MaterialCommunityIcons name={event.icon as any} size={22} color="#ffffff" />
                </View>
                {typeof event.attendees === 'number' && event.attendees > 0 && (
                  <View
                    className="flex-row items-center rounded-lg px-1.5 py-0.5"
                    style={{ backgroundColor: event.color + '22' }}
                  >
                    <View className="mr-0.5">
                      <MaterialCommunityIcons name="account-group-outline" size={12} color={event.color} />
                    </View>
                    <Text className="text-[11px] font-bold" style={{ color: event.color }}>{event.attendees.toLocaleString()}</Text>
                  </View>
                )}
              </View>

              <Text className="mb-2 text-[13px] font-bold leading-[18px] text-[#4E342E]">
                {event.title}
              </Text>

              <View className="mb-0.5 flex-row items-center">
                <View className="mr-1">
                  <MaterialCommunityIcons name="calendar-outline" size={12} color="#6D4C41" />
                </View>
                <Text className="text-[11px] text-[#6D4C41]">{event.date}</Text>
              </View>
              {event.time ? (
                <View className="mb-0.5 flex-row items-center">
                  <View className="mr-1">
                    <MaterialCommunityIcons name="clock-outline" size={12} color="#6D4C41" />
                  </View>
                  <Text className="text-[11px] text-[#6D4C41]">{event.time}</Text>
                </View>
              ) : null}
              <View className="flex-row items-center">
                <View className="mr-1">
                  <MaterialCommunityIcons name="map-marker-outline" size={12} color="#6D4C41" />
                </View>
                <Text className="text-[11px] text-[#6D4C41]">{event.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default GetOrganizedSection;

