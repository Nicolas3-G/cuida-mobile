import React, { type MutableRefObject } from 'react';
import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Organization {
  id?: string;
  icon: string;
  name: string;
  scope: string;
  scopeColor: string;
  desc: string;
  bg: string;
  border: string;
  url?: string | null;
}

interface OrganizationsSectionProps {
  isLoadingOrgs: boolean;
  localOrganizations: Organization[];
  lastOrgIndex: MutableRefObject<number>;
  triggerSelectionHaptic: () => void;
}

const OrganizationsSection = ({
  isLoadingOrgs,
  localOrganizations,
  lastOrgIndex,
  triggerSelectionHaptic,
}: OrganizationsSectionProps) => {
  const ORG_CARD_WIDTH = 202; // 190 + 12 gap

  return (
    <View className="mb-5">
      <Text className="mb-3 px-5 text-[18px] font-bold text-[#4E342E]">
        Organizations
      </Text>
      {isLoadingOrgs ? (
        <ActivityIndicator color="#C2185B" className="my-2.5" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const currentX = e.nativeEvent.contentOffset.x;
            const index = Math.round(currentX / ORG_CARD_WIDTH);
            if (index !== lastOrgIndex.current) {
              triggerSelectionHaptic();
              lastOrgIndex.current = index;
            }
          }}
        >
          {(() => {
            const nationalOrgs: Organization[] = [
              {
                icon: 'bank-outline',
                name: 'ACLU',
                scope: 'Nationwide',
                scopeColor: '#BF360C',
                desc: 'Defends civil liberties and fights immigration rights abuses in court.',
                bg: '#FBE9E7',
                border: '#FFCCBC',
                url: 'https://www.aclu.org/',
              },
              {
                icon: 'scale-balance',
                name: 'NILC',
                scope: 'Nationwide',
                scopeColor: '#BF360C',
                desc: 'National Immigration Law Center — policy & legal defense for immigrants.',
                bg: '#FBE9E7',
                border: '#FFCCBC',
                url: 'https://www.nilc.org/',
              },
              {
                icon: 'handshake-outline',
                name: 'UnidosUS',
                scope: 'Nationwide',
                scopeColor: '#BF360C',
                desc: "The nation's largest Latino civil rights & advocacy organization.",
                bg: '#FBE9E7',
                border: '#FFCCBC',
                url: 'https://unidosus.org/',
              },
              {
                icon: 'book-open-page-variant-outline',
                name: 'ILRC',
                scope: 'Nationwide',
                scopeColor: '#BF360C',
                desc: 'Immigrant Legal Resource Center — legal training & educational materials.',
                bg: '#FBE9E7',
                border: '#FFCCBC',
                url: 'https://www.ilrc.org/',
              },
            ];

            const interleaved: Organization[] = [];
            const maxLen = Math.max(localOrganizations.length, nationalOrgs.length);
            for (let i = 0; i < maxLen; i++) {
              if (i < localOrganizations.length) interleaved.push(localOrganizations[i]);
              if (i < nationalOrgs.length) interleaved.push(nationalOrgs[i]);
            }

            return interleaved;
          })().map((org) => (
            <TouchableOpacity
              key={org.id || org.name}
              activeOpacity={0.7}
              onPress={() => {
                if (!org.url) return;
                triggerSelectionHaptic();
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                Linking.openURL(org.url);
              }}
              className="w-[190px] rounded-2xl border p-3.5"
              style={{ backgroundColor: org.bg, borderColor: org.border }}
            >
              <View
                className="absolute right-2.5 top-2.5 rounded px-1.5 py-0.5"
                style={{ backgroundColor: org.scopeColor }}
              >
                <Text className="text-[9px] font-bold text-white">{org.scope.toUpperCase()}</Text>
              </View>

              <View className="mb-2">
                <MaterialCommunityIcons name={org.icon as any} size={26} color={org.scopeColor} />
              </View>
              <Text className="mb-1.5 pr-[60px] text-[14px] font-bold text-[#4E342E]">{org.name}</Text>
              <Text className="mb-2 text-[12px] leading-[17px] text-[#6D4C41]">{org.desc}</Text>

              <View className="absolute bottom-3 right-3">
                <MaterialCommunityIcons name="chevron-right" size={18} color={org.scopeColor} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default OrganizationsSection;

