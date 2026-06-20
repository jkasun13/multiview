import type { AIAnalysis } from "@/types";

interface CacheEntry {
  analysis: AIAnalysis;
  expiresAt: number;
}

const TTL_MS = 60 * 60 * 1000; // 1 hour

const cache = new Map<string, CacheEntry>();

export function getCachedAnalysis(storyId: string): AIAnalysis | null {
  const entry = cache.get(storyId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(storyId);
    return null;
  }
  return entry.analysis;
}

export function setCachedAnalysis(storyId: string, analysis: AIAnalysis): void {
  cache.set(storyId, {
    analysis,
    expiresAt: Date.now() + TTL_MS,
  });
}
