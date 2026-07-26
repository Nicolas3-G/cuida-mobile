import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { LocalOrganization } from './useLocalOrganizations';

/**
 * Reads curated statewide organizations from the "stateOrganizations" collection,
 * where each document id is the lowercase state code (e.g. "al"). Used for
 * state-level users who haven't selected a supported city.
 */
export function useStateOrganizations(stateCode: string | null, refreshKey: number = 0) {
  const [organizations, setOrganizations] = useState<LocalOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!stateCode) {
      setOrganizations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let cancelled = false;

    async function fetchStateOrganizations() {
      try {
        const snap = await getDoc(
          doc(db, 'stateOrganizations', stateCode.trim().toLowerCase())
        );
        if (cancelled) return;

        const data = snap.exists() ? (snap.data() as any) : null;
        if (data?.organizations && Array.isArray(data.organizations)) {
          const mapped: LocalOrganization[] = data.organizations.map(
            (org: any, index: number) => {
              const summary = org.summary || {};
              return {
                id: org.id || `state-org-${index}`,
                icon: org.icon || 'home-outline',
                name: org.shortName || org.name || 'Organization',
                scope: 'Statewide',
                scopeColor: '#1565C0',
                desc: summary.shortSummary || summary.longSummary || '',
                bg: '#E3F2FD',
                border: '#90CAF9',
                url: org.url || null,
                volunteerOpportunities: org.volunteerOpportunities || undefined,
              };
            }
          );
          setOrganizations(mapped);
        } else {
          setOrganizations([]);
        }
      } catch (error) {
        if (!cancelled) console.error('Error fetching state organizations:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchStateOrganizations();
    return () => {
      cancelled = true;
    };
  }, [stateCode, refreshKey]);

  return { organizations, isLoading };
}
