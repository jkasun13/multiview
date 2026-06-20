/**
 * Local dev script: runs the full pipeline for all categories.
 *
 * Usage:
 *   npm run pipeline
 *
 * Requires the dev server to be running (npm run dev) so the
 * API route is available, OR set PIPELINE_SECRET in .env.local
 * and the server will handle auth.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const SECRET = process.env.PIPELINE_SECRET || "";

const CATEGORIES = [
  "politics", "sports",
  "technology", "business", "world",
  "science", "health", "entertainment",
];

async function runCategory(category) {
  const res = await fetch(`${BASE_URL}/api/pipeline/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(SECRET ? { "x-pipeline-secret": SECRET } : {}),
    },
    body: JSON.stringify({ category }),
  });

  const json = await res.json();
  return json;
}

console.log("🔄 Running Multiview pipeline for all categories...\n");

for (const cat of CATEGORIES) {
  process.stdout.write(`  ${cat.padEnd(15)}`);
  try {
    const result = await runCategory(cat);
    const r = result.result;
    if (r?.error) {
      console.log(`❌ ${r.error}`);
    } else {
      console.log(
        `✅ ${r?.articlesFound ?? 0} articles → ${r?.storiesCreated ?? 0} stories, ${r?.storiesAnalyzed ?? 0} analyzed (${r?.durationMs ?? 0}ms)`
      );
    }
  } catch (err) {
    console.log(`❌ ${err.message}`);
  }
}

console.log("\n✅ Pipeline complete. Check http://localhost:3000/api/pipeline/status for details.");
