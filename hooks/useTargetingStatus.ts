import { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Resolves the enforcement targeting status (0-2) for the user's area.
 * Prefers city-level status when a city is selected, and falls back to
 * state-level status — which is also what state-level users get.
 */
export function useTargetingStatus(
  city: string | null,
  stateCode: string | null,
  refreshKey: number = 0
) {
  const [targetingStatus, setTargetingStatus] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        // 1) City-level targeting when a city is selected.
        if (city) {
          const citySnap = await getDocs(
            query(
              collection(db, 'cityTargetingStatus'),
              where('city', '==', city.trim().toLowerCase()),
              limit(1)
            )
          );
          if (cancelled) return;
          if (!citySnap.empty) {
            const code = parseInt(citySnap.docs[0].data().targetingStatusCode);
            if (!isNaN(code)) {
              setTargetingStatus(code);
              return;
            }
          }
        }

        // 2) Fall back to state-level targeting (backend stores stateCode lowercase).
        if (stateCode) {
          const stateSnap = await getDocs(
            query(
              collection(db, 'stateTargetingStatus'),
              where('stateCode', '==', stateCode.trim().toLowerCase()),
              limit(1)
            )
          );
          if (cancelled) return;
          if (!stateSnap.empty) {
            const code = parseInt(stateSnap.docs[0].data().targetingStatusCode);
            if (!isNaN(code)) {
              setTargetingStatus(code);
              return;
            }
          }
        }

        if (!cancelled) setTargetingStatus(0);
      } catch (error) {
        if (!cancelled) console.error('Error fetching targeting status:', error);
      }
    }

    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [city, stateCode, refreshKey]);

  return { targetingStatus };
}
