import { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface LocalOrganization {
  id: string;
  icon: string;
  name: string;
  scope: string;
  scopeColor: string;
  desc: string;
  bg: string;
  border: string;
  url: string | null;
  volunteerOpportunities?: {
    lookingForVolunteers?: boolean;
    volunteeringLink?: string | null;
  };
}

export function useLocalOrganizations(city: string | null) {
  const [organizations, setOrganizations] = useState<LocalOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!city) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const normalizedCity = city.trim().toLowerCase();

    async function fetchLocalOrganizations() {
      try {
        const orgsRef = collection(db, 'localOrganizations');
        const q = query(orgsRef, where('city', '==', normalizedCity), limit(1));
        const querySnapshot = await getDocs(q);
        if (cancelled) return;

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as any;
          if (data.organizations && Array.isArray(data.organizations)) {
            const mapped = data.organizations.map((org: any, index: number) => {
              const summary = org.summary || {};
              const name = org.shortName || org.name || 'Local organization';
              const desc = summary.shortSummary || summary.longSummary || '';
              return {
                id: org.id || `local-org-${index}`,
                icon: org.icon || 'home-outline',
                name,
                scope: org.scope || 'Local',
                scopeColor: '#2E7D32',
                desc,
                bg: '#E8F5E9',
                border: '#A5D6A7',
                url: org.url || org.website || null,
                volunteerOpportunities: org.volunteerOpportunities || undefined,
              };
            });
            setOrganizations(mapped);
          }
        }
      } catch (error) {
        if (!cancelled) console.error('Error fetching local organizations:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchLocalOrganizations();
    return () => {
      cancelled = true;
    };
  }, [city]);

  return { organizations, isLoading };
}
