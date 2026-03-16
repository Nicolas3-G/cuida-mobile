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

export function useSnippets(stateCode: string | null) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [summaryArticles, setSummaryArticles] = useState<SummaryArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!stateCode) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSnippets() {
      try {
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
            setSnippets(data.snippets);
            const extracted = data.snippets
              .map((snippet: Snippet, index: number) => {
                const firstArticle = snippet.articles?.[0];
                if (!firstArticle) return null;
                return {
                  id: `summary-${index}`,
                  category: 'Local Coverage',
                  title: firstArticle.formattedTitle || firstArticle.title,
                  location: firstArticle.parsedSource || firstArticle.source || 'Local Source',
                  link: firstArticle.link,
                  color: '#AD1457',
                  icon: 'newspaper-variant-outline',
                  fullArticle: firstArticle,
                };
              })
              .filter(Boolean);
            setSummaryArticles(extracted);
          }
        }
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
  }, [stateCode]);

  return { snippets, summaryArticles, isLoading };
}
