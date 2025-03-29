import { setImageWidth } from "../utils/imageUtils"; // ✅ importa dai tuoi utils

export type WikipediaArticle = {
  title: string;
  extract: string;
  thumbnail?: { source: string };
  content_urls: {
    mobile: { page: string };
  };
};

/**
 * Analizza la velocità e qualità della connessione per decidere la dimensione dell’immagine
 */
async function getAdaptiveImageWidth(): Promise<number> {
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    const conn = navigator.connection as any;
    const downSpeed = conn.downlink || 0; // Mbps
    const rtt = conn.rtt || 0;

    if (downSpeed > 10 && rtt < 100) return 1200; // Connessione buona
    if (downSpeed > 3) return 800;                // Connessione media
    return 500;                                   // Connessione debole
  }

  return 800;
}

export async function fetchRandomArticle(lang: string = "it"): Promise<WikipediaArticle> {
  const response = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`);
  if (!response.ok) {
    throw new Error("Errore nel recupero dell’articolo");
  }

  const data = await response.json();

  if (data.thumbnail?.source) {
    const width = await getAdaptiveImageWidth();
    data.thumbnail.source = setImageWidth(data.thumbnail.source, width);
  }

  return data;
}

export async function fetchMultipleArticles(count: number = 5, lang: string = "it"): Promise<WikipediaArticle[]> {
  const articles: WikipediaArticle[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const article = await fetchRandomArticle(lang);
      articles.push(article);
    } catch (error) {
      console.error("Errore nel prefetch di un articolo", error);
    }
  }

  return articles;
}