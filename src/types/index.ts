export type ToneType = "neutral" | "critical" | "favorable" | "mixed";

export interface SourceArticle {
  id: string;
  outlet: string;
  outletDomain: string;
  headline: string;
  snippet: string;
  url: string;
  publishedAt: string;
  tone: ToneType;
  imageUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  summary: string;
  category: string;
  region: "lk" | "world"; // lk = Sri Lanka, world = international
  isBreaking: boolean;
  imageUrl: string;
  publishedRange: {
    from: string;
    to: string;
  };
  sources: SourceArticle[];
  tags: string[];
}

export interface AIAnalysis {
  agree: string[];
  differ: { outlet: string; angle: string }[];
  missingContext: string[];
  generatedAt: string;
}

export interface StoriesResponse {
  stories: Story[];
  total: number;
  category?: string;
  query?: string;
}

export type Category =
  | "politics"
  | "technology"
  | "business"
  | "world"
  | "science"
  | "health"
  | "sports"
  | "entertainment";

export const CATEGORIES: { slug: Category; label: string; region?: "lk" | "world" }[] = [
  { slug: "politics", label: "Politics", region: "lk" },
  { slug: "sports",   label: "Sports",   region: "lk" },
  { slug: "technology",   label: "Tech"          },
  { slug: "business",     label: "Business"      },
  { slug: "world",        label: "World"         },
  { slug: "science",      label: "Science"       },
  { slug: "health",       label: "Health"        },
  { slug: "entertainment",label: "Entertainment" },
];

// Categories that are Sri Lanka-specific
export const SRI_LANKA_CATEGORIES: Category[] = ["politics", "sports"];
