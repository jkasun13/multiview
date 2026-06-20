/**
 * Pipeline status endpoint — for debugging and monitoring.
 * GET /api/pipeline/status
 */

import { NextResponse } from "next/server";
import { getPipelineLog, getLastFetchTime } from "@/lib/db";
import { CATEGORIES } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const log = await getPipelineLog();

  const categoryStatus = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const lastFetch = await getLastFetchTime(cat.slug);
      return {
        category: cat.slug,
        label: cat.label,
        lastFetchAt: lastFetch ? new Date(lastFetch).toISOString() : null,
        minutesAgo: lastFetch
          ? Math.round((Date.now() - lastFetch) / 60000)
          : null,
      };
    })
  );

  return NextResponse.json({
    usingRedis: !!(
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ),
    categories: categoryStatus,
    recentLog: log.slice(0, 20),
  });
}
