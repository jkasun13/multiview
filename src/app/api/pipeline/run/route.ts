/**
 * Pipeline trigger endpoint.
 *
 * Called by Vercel Cron (vercel.json) every 10 minutes.
 * Each call processes ONE category (round-robin) to stay
 * within Vercel's serverless function timeout.
 *
 * Protected by PIPELINE_SECRET header to prevent public abuse.
 *
 * Manual trigger (dev):
 *   curl -X POST http://localhost:3000/api/pipeline/run \
 *     -H "x-pipeline-secret: your_secret" \
 *     -H "Content-Type: application/json" \
 *     -d '{"category":"politics"}'
 *
 * Run all categories (dev script):
 *   npm run pipeline
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { runPipelineForCategory } from "@/lib/pipeline";
import { getNextCategory, setNextCategory, appendPipelineLog } from "@/lib/db";
import { CATEGORIES } from "@/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds — requires Vercel Pro for full 60s

const ALL_CATEGORIES: string[] = CATEGORIES.map((c) => c.slug);

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.PIPELINE_SECRET;
  // If no secret is set, allow in development only
  if (!secret) return process.env.NODE_ENV !== "production";
  return (
    request.headers.get("x-pipeline-secret") === secret ||
    // Vercel Cron sends Authorization: Bearer <secret>
    request.headers.get("authorization") === `Bearer ${secret}`
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow body to specify a category, otherwise use round-robin
  let category: string | null = null;
  try {
    const body = await request.json().catch(() => ({}));
    if (body?.category) category = body.category as string;
  } catch {}

  if (!category) {
    // Round-robin: get next category in queue
    const stored = await getNextCategory();
    const idx = stored ? ALL_CATEGORIES.indexOf(stored) : -1;
    const nextIdx = (idx + 1) % ALL_CATEGORIES.length;
    category = ALL_CATEGORIES[nextIdx];
    // Advance the pointer for next call
    const afterNext = (nextIdx + 1) % ALL_CATEGORIES.length;
    await setNextCategory(ALL_CATEGORIES[afterNext]);
  }

  await appendPipelineLog(`Pipeline triggered for: ${category}`);

  const result = await runPipelineForCategory(category);

  // Bust Next.js ISR cache so the website reflects new data immediately
  try {
    revalidatePath("/");
    revalidatePath(`/category/${category}`);
    revalidatePath("/search");
  } catch {
    // revalidatePath may not work in all environments — non-fatal
  }

  return NextResponse.json({ ok: true, result });
}

// GET: Vercel Cron also sends GET requests — handle same way
export async function GET(request: NextRequest) {
  return POST(request);
}
