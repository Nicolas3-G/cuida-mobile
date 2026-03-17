import { useEffect, useState } from "react";
import { collection, query, where, limit, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";

/** Colors per event icon type (protests, rallies, meetings, etc.) */
const ICON_COLORS: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  "hand-front-right": { color: "#C62828", bg: "#FFEBEE", border: "#EF9A9A" }, // protests, marches, direct action
  "bullhorn-outline": { color: "#E65100", bg: "#FFF3E0", border: "#FFCC80" }, // rallies, call-to-action
  "account-group-outline": {
    color: "#00897B",
    bg: "#E0F2F1",
    border: "#80CBC4",
  }, // community meetings, town halls
  "calendar-outline": { color: "#1565C0", bg: "#E3F2FD", border: "#90CAF9" }, // general events, schedules
  "map-marker-outline": { color: "#6A1B9A", bg: "#F3E5F5", border: "#CE93D8" }, // location-specific, vigils
  "flag-variant": { color: "#B71C1C", bg: "#FFEBEE", border: "#E57373" }, // demonstrations, symbolic
  "human-handsup": { color: "#2E7D32", bg: "#E8F5E9", border: "#A5D6A7" }, // solidarity, celebrations
  "microphone-variant": { color: "#283593", bg: "#E8EAF6", border: "#9FA8DA" }, // speak-outs, panels
  "school-outline": { color: "#5D4037", bg: "#EFEBE9", border: "#BCAAA4" }, // trainings, workshops
  "home-group": { color: "#1B5E20", bg: "#E8F5E9", border: "#81C784" }, // neighborhood, mutual aid
};

const DEFAULT_COLORS = { color: "#2E7D32", bg: "#E8F5E9", border: "#A5D6A7" };

function getColorsForIcon(icon: string) {
  return ICON_COLORS[icon] ?? DEFAULT_COLORS;
}

export interface LocalEvent {
  id: string;
  icon: string;
  title: string;
  date: string;
  time: string;
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
        const eventsRef = collection(db, "localEvents");
        const q = query(
          eventsRef,
          where("city", "==", normalizedCity),
          orderBy('dateCreated', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (cancelled) return;

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as any;
          if (data.events && Array.isArray(data.events)) {
            const mapped = data.events.map((event: any, index: number) => {
              const summary = event.summary || {};
              const title = event.shortName || event.name || "Community event";
              const date = event.date || "";
              const time = event.startTime
                ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ""}`
                : "";
              const location =
                event.venueShort ||
                event.venue ||
                event.address ||
                event.location ||
                normalizedCity;
              const icon = event.icon || "hand-front-right";
              const { color, bg, border } = getColorsForIcon(icon);
              return {
                id: event.id || `local-event-${index}`,
                icon,
                title,
                date,
                time,
                location,
                distance: event.venueType === "virtual" ? "Online" : "Nearby",
                attendees: event.attendees || 0,
                color,
                bg,
                border,
                url: event.url || null,
                description: summary.shortSummary || summary.longSummary || "",
              };
            });
            setEvents(mapped);
          }
        }
      } catch (error) {
        if (!cancelled) console.error("Error fetching local events:", error);
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
