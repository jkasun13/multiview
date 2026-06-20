/**
 * Core pipeline:
 *   NewsAPI → AI clustering → AI analysis → DB → cache revalidation
 *
 * Designed to run one category per invocation so it stays within
 * Vercel's serverless function timeout even on the Hobby plan.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Story, SourceArticle, ToneType } from "@/types";
import { SRI_LANKA_CATEGORIES } from "@/types";
import {
  setStoriesByCategory,
  setAnalysis,
  setLastFetchTime,
  appendPipelineLog,
} from "./db";

// ─── Anthropic client ──────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── NewsAPI types ─────────────────────────────────────────────────────────
interface RawArticle {
  source: { id: string | null; name: string };
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return "unknown"; }
}

function guessTone(title: string, desc: string): ToneType {
  const t = `${title} ${desc}`.toLowerCase();
  const neg = ["fail","crisis","scandal","condemn","blasts","slams","warn","threat","collapse","disaster","controversy"].filter(w => t.includes(w)).length;
  const pos = ["breakthrough","success","win","growth","record","achieve","boost","improve","progress","innovative","celebrate"].filter(w => t.includes(w)).length;
  if (neg > 0 && pos > 0) return "mixed";
  if (neg > pos) return "critical";
  if (pos > neg) return "favorable";
  return "neutral";
}

function isBreaking(publishedAt: string): boolean {
  return Date.now() - new Date(publishedAt).getTime() < 3 * 60 * 60 * 1000;
}

function articleToSource(a: RawArticle, idx: number): SourceArticle {
  return {
    id: `src-${idx}-${Date.now()}`,
    outlet: a.source.name,
    outletDomain: extractDomain(a.url),
    headline: a.title,
    snippet: a.description || a.content?.slice(0, 200) || "",
    url: a.url,
    publishedAt: a.publishedAt,
    tone: guessTone(a.title, a.description || ""),
    imageUrl: a.urlToImage || undefined,
  };
}

// ─── Step 1: Fetch articles from NewsAPI ──────────────────────────────────
async function fetchArticles(
  category: string,
  apiKey: string
): Promise<RawArticle[]> {
  const isLK = (SRI_LANKA_CATEGORIES as string[]).includes(category);
  const categoryMap: Record<string, string> = {
    politics: "general", technology: "technology", business: "business",
    world: "general", science: "science", health: "health",
    sports: "sports", entertainment: "entertainment",
  };
  const newsCategory = categoryMap[category] || "general";

  const params = new URLSearchParams({
    apiKey,
    pageSize: "40",
    ...(isLK
      ? { country: "lk", category: newsCategory }
      : { category: newsCategory, language: "en" }),
  });

  const res = await fetch(
    `https://newsapi.org/v2/top-headlines?${params}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error(`NewsAPI ${res.status}: ${res.statusText}`);

  const data = await res.json();
  if (data.status !== "ok") throw new Error(data.message || "NewsAPI error");

  return (data.articles as RawArticle[]).filter(
    (a) => a.title && a.title !== "[Removed]" && a.url
  );
}

// ─── Step 2: AI clustering ─────────────────────────────────────────────────
interface ClusterResult {
  eventTitle: string;
  eventSummary: string;
  articleIndices: number[];
}

async function clusterArticles(
  articles: RawArticle[]
): Promise<ClusterResult[]> {
  if (articles.length === 0) return [];

  const listing = articles
    .map((a, i) => `[${i}] ${a.source.name}: "${a.title}"`)
    .join("\n");

  const prompt = `You are a news editor. Below are ${articles.length} news articles.
Group them by underlying real-world event. Articles about the same event (even if the headlines differ) should be in the same cluster.
Only include articles that have at least one other article covering the same event.

Articles:
${listing}

Return ONLY a valid JSON array. Each element:
{
  "eventTitle": "Concise factual headline for the event (max 15 words)",
  "eventSummary": "One sentence summary of the event",
  "articleIndices": [array of article indices that cover this event]
}

Rules:
- Only create a cluster if 2+ articles cover the same event
- Omit articles that are clearly standalone with no matching coverage
- Be strict: only cluster articles about the genuinely same event
- Return an empty array [] if nothing clusters`;

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    msg.content[0].type === "text" ? msg.content[0].text.trim() : "[]";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const clusters = JSON.parse(cleaned) as ClusterResult[];
    return Array.isArray(clusters) ? clusters : [];
  } catch {
    return [];
  }
}

// ─── Step 3: AI analysis per story ────────────────────────────────────────
async function analyzeStory(story: Story) {
  const sourceSummaries = story.sources
    .map(
      (s, i) =>
        `Source ${i + 1} — ${s.outlet}:\nHeadline: "${s.headline}"\nSnippet: "${s.snippet}"\nTone: ${s.tone}`
    )
    .join("\n\n");

  const prompt = `You are a journalism analyst. Given coverage of the same story from multiple outlets, produce a structured analysis.

Story: "${story.title}"

${sourceSummaries}

Return ONLY a valid JSON object with exactly these three keys:
{
  "agree": ["bullet 1", "bullet 2"],
  "differ": [{"outlet": "Name", "angle": "their specific angle"}],
  "missingContext": ["bullet 1", "bullet 2"]
}

Rules:
- "agree": 2–4 factual points confirmed by all/most sources
- "differ": one entry per source with a notably distinct framing
- "missingContext": 2–4 important facts or context absent from coverage
- Return only JSON, no markdown fences`;

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    agree: Array.isArray(parsed.agree) ? parsed.agree : [],
    differ: Array.isArray(parsed.differ) ? parsed.differ : [],
    missingContext: Array.isArray(parsed.missingContext) ? parsed.missingContext : [],
    generatedAt: new Date().toISOString(),
  };
}

// ─── Main pipeline function ────────────────────────────────────────────────
export interface PipelineResult {
  category: string;
  articlesFound: number;
  storiesCreated: number;
  storiesAnalyzed: number;
  durationMs: number;
  error?: string;
}

export async function runPipelineForCategory(
  category: string
): Promise<PipelineResult> {
  const start = Date.now();
  const result: PipelineResult = {
    category,
    articlesFound: 0,
    storiesCreated: 0,
    storiesAnalyzed: 0,
    durationMs: 0,
  };

  try {
    const newsApiKey = process.env.NEWS_API_KEY;
    if (!newsApiKey) throw new Error("NEWS_API_KEY not set");
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");

    const isLK = (SRI_LANKA_CATEGORIES as string[]).includes(category);
    const region: "lk" | "world" = isLK ? "lk" : "world";

    // Step 1: fetch
    const articles = await fetchArticles(category, newsApiKey);
    result.articlesFound = articles.length;

    if (articles.length === 0) {
      await appendPipelineLog(`${category}: no articles found`);
      result.durationMs = Date.now() - start;
      return result;
    }

    // Step 2: AI clustering
    const clusters = await clusterArticles(articles);

    // Step 3: build Story objects
    const stories: Story[] = clusters.map((cluster, i) => {
      const sources = cluster.articleIndices
        .map((idx) => articles[idx])
        .filter(Boolean)
        .map((a, j) => articleToSource(a, j));

      const dates = sources.map((s) => s.publishedAt).sort();
      const latest = dates[dates.length - 1] || new Date().toISOString();
      const imageUrl =
        cluster.articleIndices
          .map((idx) => articles[idx]?.urlToImage)
          .find(Boolean) ||
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80";

      return {
        id: `${category}-${Date.now()}-${i}`,
        title: cluster.eventTitle,
        summary: cluster.eventSummary,
        category,
        region,
        isBreaking: isBreaking(latest),
        imageUrl,
        publishedRange: { from: dates[0] || latest, to: latest },
        sources,
        tags: [],
      };
    });

    result.storiesCreated = stories.length;

    // Persist stories
    await setStoriesByCategory(category, stories);
    await setLastFetchTime(category, Date.now());

    // Step 4: AI analysis for each story (max 5 to stay within timeout)
    const toAnalyze = stories.slice(0, 5);
    for (const story of toAnalyze) {
      try {
        const analysis = await analyzeStory(story);
        await setAnalysis(story.id, analysis);
        result.storiesAnalyzed++;
      } catch (err) {
        // Non-fatal — story is still shown, just without AI highlights
        console.warn(`Analysis failed for ${story.id}:`, err);
      }
    }

    await appendPipelineLog(
      `${category}: ${result.articlesFound} articles → ${result.storiesCreated} stories, ${result.storiesAnalyzed} analyzed`
    );
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    await appendPipelineLog(`${category} ERROR: ${result.error}`).catch(() => {});
  }

  result.durationMs = Date.now() - start;
  return result;
}
