import type { Story, SourceArticle, ToneType } from "@/types";

export interface NewsProvider {
  fetchStoriesByCategory(category: string, pageSize?: number): Promise<Story[]>;
  searchStories(query: string, pageSize?: number): Promise<Story[]>;
}

function guessTone(title: string, description: string): ToneType {
  const text = `${title} ${description}`.toLowerCase();
  const criticalWords = [
    "fail",
    "crisis",
    "scandal",
    "controversy",
    "condemn",
    "blasts",
    "slams",
    "accuse",
    "warn",
    "problem",
    "threat",
    "collapse",
    "disaster",
  ];
  const favorableWords = [
    "breakthrough",
    "success",
    "win",
    "growth",
    "record",
    "celebrate",
    "achieve",
    "boost",
    "improve",
    "progress",
    "innovative",
  ];
  const criticalScore = criticalWords.filter((w) => text.includes(w)).length;
  const favorableScore = favorableWords.filter((w) => text.includes(w)).length;
  if (criticalScore > 0 && favorableScore > 0) return "mixed";
  if (criticalScore > favorableScore) return "critical";
  if (favorableScore > criticalScore) return "favorable";
  return "neutral";
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}

function groupArticlesIntoStories(
  articles: NewsAPIArticle[]
): NewsAPIArticle[][] {
  const groups: NewsAPIArticle[][] = [];
  const used = new Set<number>();

  for (let i = 0; i < articles.length; i++) {
    if (used.has(i)) continue;
    const group = [articles[i]];
    used.add(i);

    const titleWords = new Set(
      articles[i].title
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4)
    );

    for (let j = i + 1; j < articles.length; j++) {
      if (used.has(j)) continue;
      const otherWords = articles[j].title
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4);
      const overlap = otherWords.filter((w) => titleWords.has(w)).length;
      const similarity = overlap / Math.max(titleWords.size, otherWords.length);
      if (similarity >= 0.35) {
        group.push(articles[j]);
        used.add(j);
      }
    }

    groups.push(group);
  }

  return groups;
}

interface NewsAPIArticle {
  source: { id: string | null; name: string };
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
  message?: string;
}

function articleToSource(article: NewsAPIArticle, index: number): SourceArticle {
  return {
    id: `src-${index}-${Date.now()}`,
    outlet: article.source.name,
    outletDomain: extractDomain(article.url),
    headline: article.title,
    snippet: article.description || article.content?.slice(0, 200) || "",
    url: article.url,
    publishedAt: article.publishedAt,
    tone: guessTone(article.title, article.description || ""),
    imageUrl: article.urlToImage || undefined,
  };
}

function groupToStory(group: NewsAPIArticle[], index: number, category: string): Story {
  const primary = group[0];
  const dates = group.map((a) => a.publishedAt).sort();
  const sources = group.map((a, i) => articleToSource(a, i));

  return {
    id: `story-${category}-${index}-${Date.now()}`,
    title: primary.title,
    summary: primary.description || "",
    category,
    imageUrl:
      group.find((a) => a.urlToImage)?.urlToImage ||
      `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80`,
    publishedRange: {
      from: dates[0],
      to: dates[dates.length - 1],
    },
    sources,
    tags: [],
  };
}

export class NewsAPIProvider implements NewsProvider {
  private apiKey: string;
  private baseUrl = "https://newsapi.org/v2";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set("apiKey", this.apiKey);

    const res = await fetch(url.toString(), {
      next: { revalidate: 10800 },
    });

    if (!res.ok) {
      throw new Error(`NewsAPI error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  async fetchStoriesByCategory(category: string, pageSize = 40): Promise<Story[]> {
    const categoryMap: Record<string, string> = {
      politics: "politics",
      technology: "technology",
      business: "business",
      world: "general",
      science: "science",
      health: "health",
      sports: "sports",
      entertainment: "entertainment",
    };

    const newsCategory = categoryMap[category] || "general";

    const data = await this.fetch<NewsAPIResponse>("/top-headlines", {
      category: newsCategory,
      language: "en",
      pageSize: String(pageSize),
    });

    if (data.status !== "ok") {
      throw new Error(data.message || "Failed to fetch stories");
    }

    const valid = data.articles.filter(
      (a) => a.title && a.title !== "[Removed]" && a.url
    );
    const groups = groupArticlesIntoStories(valid);

    return groups
      .filter((g) => g.length >= 1)
      .map((g, i) => groupToStory(g, i, category))
      .slice(0, 12);
  }

  async searchStories(query: string, pageSize = 40): Promise<Story[]> {
    const data = await this.fetch<NewsAPIResponse>("/everything", {
      q: query,
      language: "en",
      sortBy: "publishedAt",
      pageSize: String(pageSize),
    });

    if (data.status !== "ok") {
      throw new Error(data.message || "Failed to search stories");
    }

    const valid = data.articles.filter(
      (a) => a.title && a.title !== "[Removed]" && a.url
    );
    const groups = groupArticlesIntoStories(valid);

    return groups
      .filter((g) => g.length >= 1)
      .map((g, i) => groupToStory(g, i, "search"))
      .slice(0, 12);
  }
}

let providerInstance: NewsProvider | null = null;

export function getNewsProvider(): NewsProvider {
  if (!providerInstance) {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) throw new Error("NEWS_API_KEY is not set");
    providerInstance = new NewsAPIProvider(apiKey);
  }
  return providerInstance;
}
