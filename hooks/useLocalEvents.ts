import { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface LocalEvent {
  id: string;
  icon: string;
  title: string;
  date: string;
  location: string;
  distance: string;
  attendees: number;
  color: string;
  bg: string;
  border: string;
  url: string | null;
  description: string;
}

export function useLocalEvents(city: string | null) {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!city) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const normalizedCity = city.trim().toLowerCase();

    async function fetchLocalEvents() {
      try {
        const eventsRef = collection(db, 'localEvents');
        const q = query(eventsRef, where('city', '==', normalizedCity), limit(1));
        const querySnapshot = await getDocs(q);
        if (cancelled) return;

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as any;
          if (data.events && Array.isArray(data.events)) {
            const mapped = data.events.map((event: any, index: number) => {
              const summary = event.summary || {};
              const title = event.shortName || event.name || 'Community event';
              const dateLabel =
                event.date && event.startTime
                  ? `${event.date} · ${event.startTime}${event.endTime ? `–${event.endTime}` : ''}`
                  : event.date || '';
              const location =
                event.venue ||
                event.address ||
                event.location ||
                normalizedCity;
              return {
                id: event.id || `local-event-${index}`,
                icon: event.icon || 'hand-front-right',
                title,
                date: dateLabel,
                location,
                distance: event.venueType === 'virtual' ? 'Online' : 'Nearby',
                attendees: event.attendees || 0,
                color: '#2E7D32',
                bg: '#E8F5E9',
                border: '#A5D6A7',
                url: event.url || null,
                description: summary.shortSummary || summary.longSummary || '',
              };
            });
            setEvents(mapped);
          }
        }
      } catch (error) {
        if (!cancelled) console.error('Error fetching local events:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchLocalEvents();
    return () => {
      cancelled = true;
    };
  }, [city]);

  return { events, isLoading };
}
