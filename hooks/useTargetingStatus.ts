import { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export function useTargetingStatus(city: string | null) {
  const [targetingStatus, setTargetingStatus] = useState<number>(0);

  useEffect(() => {
    if (!city) return;

    let cancelled = false;
    const normalizedCity = city.trim().toLowerCase();

    async function fetchStatus() {
      try {
        const statusRef = collection(db, 'cityTargetingStatus');
        const q = query(
          statusRef,
          where('city', '==', normalizedCity),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (cancelled) return;

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as any;
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
  }, [city]);

  return { targetingStatus };
}
