import { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export function useTargetingStatus(stateCode: string | null) {
  const [targetingStatus, setTargetingStatus] = useState<number>(0);

  useEffect(() => {
    if (!stateCode) return;

    let cancelled = false;

    async function fetchStatus() {
      try {
        const statusRef = collection(db, 'stateTargetingStatus');
        const q = query(
          statusRef,
          where('stateCode', '==', stateCode),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (cancelled) return;

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          const statusCode = parseInt(data.targetingStatusCode);
          if (!isNaN(statusCode)) {
            setTargetingStatus(statusCode);
          }
        }
      } catch (error) {
        if (!cancelled) console.error('Error fetching targeting status:', error);
      }
    }

    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [stateCode]);

  return { targetingStatus };
}
