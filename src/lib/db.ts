/**
 * Database abstraction.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL + TOKEN are set,
 * otherwise falls back to a module-level in-memory store so local
 * development works with zero external services.
 */

import type { Story, AIAnalysis } from "@/types";

// ─── In-memory fallback ────────────────────────────────────────────────────
const mem = new Map<string, { value: string; expiresAt?: number }>();

function memGet(key: string): string | null {
  const entry = mem.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    mem.delete(key);
    return null;
  }
  return entry.value;
}

function memSet(key: string, value: string, ttlSeconds?: number): void {
  mem.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
  });
}

// ─── Redis singleton ───────────────────────────────────────────────────────
let _redis: import("@upstash/redis").Redis | null = null;

async function getRedis() {
  if (_redis) return _redis;
  const { Redis } = await import("@upstash/redis");
  _redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  return _redis;
}

function hasRedis(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// ─── Low-level helpers ─────────────────────────────────────────────────────
async function kget(key: string): Promise<string | null> {
  if (hasRedis()) {
    const redis = await getRedis();
    const v = await redis.get<string>(key);
    return v ?? null;
  }
  return memGet(key);
}

async function kset(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (hasRedis()) {
    const redis = await getRedis();
    ttlSeconds
      ? await redis.set(key, value, { ex: ttlSeconds })
      : await redis.set(key, value);
    return;
  }
  memSet(key, value, ttlSeconds);
}

async function kdel(key: string): Promise<void> {
  if (hasRedis()) {
    const redis = await getRedis();
    await redis.del(key);
    return;
  }
  mem.delete(key);
}

// ─── Typed domain helpers ──────────────────────────────────────────────────
const TTL_STORIES  = 4 * 3600; // 4 h
const TTL_ANALYSIS = 4 * 3600;
const TTL_META     = 24 * 3600;

export async function getStoriesByCategory(category: string): Promise<Story[] | null> {
  const raw = await kget(`stories:${category}`);
  return raw ? (JSON.parse(raw) as Story[]) : null;
}

export async function setStoriesByCategory(
  category: string,
  stories: Story[]
): Promise<void> {
  await kset(`stories:${category}`, JSON.stringify(stories), TTL_STORIES);
  // Also index each story individually for /story/[id] lookups
  await Promise.all(stories.map((s) => setStory(s)));
}

export async function getStoryById(id: string): Promise<Story | null> {
  const raw = await kget(`story:${id}`);
  return raw ? (JSON.parse(raw) as Story) : null;
}

export async function setStory(story: Story): Promise<void> {
  await kset(`story:${story.id}`, JSON.stringify(story), TTL_STORIES);
}

export async function getAnalysis(storyId: string): Promise<AIAnalysis | null> {
  const raw = await kget(`analysis:${storyId}`);
  return raw ? (JSON.parse(raw) as AIAnalysis) : null;
}

export async function setAnalysis(
  storyId: string,
  analysis: AIAnalysis
): Promise<void> {
  await kset(`analysis:${storyId}`, JSON.stringify(analysis), TTL_ANALYSIS);
}

export async function getLastFetchTime(category: string): Promise<number | null> {
  const raw = await kget(`last_fetch:${category}`);
  return raw ? parseInt(raw, 10) : null;
}

export async function setLastFetchTime(
  category: string,
  ts: number
): Promise<void> {
  await kset(`last_fetch:${category}`, String(ts), TTL_META);
}

export async function getNextCategory(): Promise<string | null> {
  const raw = await kget("pipeline:next_category");
  return raw ?? null;
}

export async function setNextCategory(category: string): Promise<void> {
  await kset("pipeline:next_category", category, TTL_META);
}

export async function getPipelineLog(): Promise<string[]> {
  const raw = await kget("pipeline:log");
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export async function appendPipelineLog(entry: string): Promise<void> {
  const log = await getPipelineLog();
  log.unshift(`[${new Date().toISOString()}] ${entry}`);
  await kset("pipeline:log", JSON.stringify(log.slice(0, 50)), TTL_META);
}

export async function clearCategory(category: string): Promise<void> {
  await kdel(`stories:${category}`);
}
