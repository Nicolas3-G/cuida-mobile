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
  ORG_CARD_WIDTH: number;
  triggerSelectionHaptic: () => void;
}

const OrganizationsSection = ({
  isLoadingOrgs,
  localOrganizations,
  lastOrgIndex,
  ORG_CARD_WIDTH,
  triggerSelectionHaptic,
}: OrganizationsSectionProps) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: '#4E342E', fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 12 }}>
        Organizations
      </Text>
      {isLoadingOrgs ? (
        <ActivityIndicator color="#C2185B" style={{ marginVertical: 10 }} />
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
              style={{ width: 190, backgroundColor: org.bg, borderWidth: 1, borderColor: org.border, borderRadius: 16, padding: 14 }}
            >
              <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: org.scopeColor, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{org.scope.toUpperCase()}</Text>
              </View>

              <MaterialCommunityIcons name={org.icon as any} size={26} color={org.scopeColor} style={{ marginBottom: 8 }} />
              <Text style={{ color: '#4E342E', fontSize: 14, fontWeight: '700', marginBottom: 6, paddingRight: 60 }}>{org.name}</Text>
              <Text style={{ color: '#6D4C41', fontSize: 12, lineHeight: 17, marginBottom: 8 }}>{org.desc}</Text>

              <View style={{ position: 'absolute', bottom: 12, right: 12 }}>
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

