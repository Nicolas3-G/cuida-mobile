import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface NationArticle {
  id: string;
  category: string;
  title: string;
  location: string;
  link: string;
  color: string;
  icon: string;
  fullArticle: any;
}

export function useNationTopics() {
  const [nationArticles, setNationArticles] = useState<NationArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchNationTopics() {
      try {
        const nationRef = collection(db, 'nationTopics');
        const q = query(nationRef, orderBy('dateCreated', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        if (cancelled) return;

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          if (data.topics && Array.isArray(data.topics)) {
            const articles = data.topics.map((topic: any, index: number) => {
              const firstArticle = topic.articles?.[0];
              if (!firstArticle) return null;
              return {
                id: `nation-${index}`,
                category: topic.topicName || 'National Update',
                title: firstArticle.formattedTitle || firstArticle.title,
                location: firstArticle.parsedSource || firstArticle.source || 'Nationwide',
                link: firstArticle.link,
                color: '#00897B',
                icon: 'earth',
                fullArticle: firstArticle,
              };
            }).filter(Boolean);
            setNationArticles(articles);
          }
        }
      } catch (error) {
        if (!cancelled) console.error('Error fetching nation topics:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchNationTopics();
    return () => {
      cancelled = true;
    };
  }, []);

  return { nationArticles, isLoading };
}
