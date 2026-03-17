import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface Article {
  title: string;
  formattedTitle?: string;
  link: string;
  source?: string;
  parsedSource?: string;
  datePublished?: string;
}

export interface Snippet {
  snippetText: string;
  articles?: Article[];
  scope?: 'local' | 'state';
}

export interface SummaryArticle {
  id: string;
  category: string;
  title: string;
  location: string;
  link: string;
  color: string;
  icon: string;
  fullArticle: Article;
}

export function useSnippets(stateCode: string | null, city: string | null) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [summaryArticles, setSummaryArticles] = useState<SummaryArticle[]>([]);
  const [allSummaryArticles, setAllSummaryArticles] = useState<SummaryArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!stateCode && !city) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSnippets() {
      try {
        const citySnippets: Snippet[] = [];
        const stateSnippets: Snippet[] = [];

        // 1) City-level snippets (if we have a city)
        if (city) {
          const normalizedCity = city.trim().toLowerCase();
          const cityRef = collection(db, 'citySnippetObjects');
          const cityQuery = query(
            cityRef,
            where('city', '==', normalizedCity),
            orderBy('dateCreated', 'desc'),
            limit(1)
          );
          const citySnapshot = await getDocs(cityQuery);
          if (cancelled) return;

          if (!citySnapshot.empty) {
            const data = citySnapshot.docs[0].data();
            if (data.snippets && Array.isArray(data.snippets)) {
              citySnippets.push(...data.snippets);
            }
          }
        }

        // 2) State-level snippets (if we have a state)
        if (stateCode) {
          const snippetsRef = collection(db, 'stateSnippetObjects');
          const q = query(
            snippetsRef,
            where('stateCode', '==', stateCode),
            orderBy('dateCreated', 'desc'),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          if (cancelled) return;

          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            if (data.snippets && Array.isArray(data.snippets)) {
              stateSnippets.push(...data.snippets);
            }
          }
        }

        // 3) Build list of all first-article summaries (for Activity Near You)
        const allCityExtracted = citySnippets
          .map((snippet: Snippet, index: number): SummaryArticle | null => {
            const firstArticle = snippet.articles?.[0];
            if (!firstArticle) return null;
            return {
              id: `all-city-${index}`,
              category: 'Local Coverage',
              title: firstArticle.formattedTitle || firstArticle.title,
              location: firstArticle.parsedSource || firstArticle.source || 'Local Source',
              link: firstArticle.link,
              color: '#2E7D32',
              icon: 'newspaper-variant-outline',
              fullArticle: firstArticle,
            };
          })
          .filter((item): item is SummaryArticle => item !== null);

        const allStateExtracted = stateSnippets
          .map((snippet: Snippet, index: number): SummaryArticle | null => {
            const firstArticle = snippet.articles?.[0];
            if (!firstArticle) return null;
            return {
              id: `all-state-${index}`,
              category: 'Statewide coverage',
              title: firstArticle.formattedTitle || firstArticle.title,
              location: firstArticle.parsedSource || firstArticle.source || 'Statewide source',
              link: firstArticle.link,
              color: '#1565C0',
              icon: 'newspaper-variant-outline',
              fullArticle: firstArticle,
            };
          })
          .filter((item): item is SummaryArticle => item !== null);

        const maxAllLen = Math.max(allCityExtracted.length, allStateExtracted.length);
        const interleavedAll: SummaryArticle[] = [];
        for (let i = 0; i < maxAllLen; i++) {
          if (i < allCityExtracted.length) interleavedAll.push(allCityExtracted[i]);
          if (i < allStateExtracted.length) interleavedAll.push(allStateExtracted[i]);
        }
        setAllSummaryArticles(interleavedAll);

        // 4) Combine: at most 1 city snippet + first 2 state snippets (for Daily Summary)
        const combinedCity = citySnippets.slice(0, 1).map((s) => ({
          ...s,
          scope: 'local' as const,
        }));
        const combinedState = stateSnippets.slice(0, 2).map((s) => ({
          ...s,
          scope: 'state' as const,
        }));
        const combined = [...combinedCity, ...combinedState];

        setSnippets(combined);

        const extracted = combined
          .map((snippet: Snippet, index: number): SummaryArticle | null => {
            const firstArticle = snippet.articles?.[0];
            if (!firstArticle) return null;
            return {
              id: `summary-${index}`,
              category: 'Local Coverage',
              title: firstArticle.formattedTitle || firstArticle.title,
              location: firstArticle.parsedSource || firstArticle.source || 'Local Source',
              link: firstArticle.link,
              color: '#2E7D32',
              icon: 'newspaper-variant-outline',
              fullArticle: firstArticle,
            };
          })
          .filter((item): item is SummaryArticle => item !== null);
        setSummaryArticles(extracted);
      } catch (error) {
        if (!cancelled) console.error('Error fetching snippets:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchSnippets();
    return () => {
      cancelled = true;
    };
  }, [stateCode, city]);

  return { snippets, summaryArticles, allSummaryArticles, isLoading };
}
