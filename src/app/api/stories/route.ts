import { NextRequest, NextResponse } from "next/server";
import { getStoriesByCategory } from "@/lib/db";
import { MOCK_STORIES } from "@/lib/mock-data";
import { SRI_LANKA_CATEGORIES } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "world";
  const query = searchParams.get("q") || "";

  // ── Search: always against mock + DB merged ──────────────────────────────
  if (query) {
    const q = query.toLowerCase();
    const mockMatches = MOCK_STORIES.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.sources.some((src) => src.outlet.toLowerCase().includes(q))
    );
    return NextResponse.json({ stories: mockMatches, total: mockMatches.length, source: "mock" });
  }

  // ── Category: try DB first ───────────────────────────────────────────────
  try {
    const dbStories = await getStoriesByCategory(category);
    if (dbStories && dbStories.length > 0) {
      return NextResponse.json({ stories: dbStories, total: dbStories.length, source: "db" });
    }
  } catch (err) {
    console.warn("DB read failed, falling back to mock:", err);
  }

  // ── Fallback: mock data ───────────────────────────────────────────────────
  const isLK = (SRI_LANKA_CATEGORIES as string[]).includes(category);
  const mock = MOCK_STORIES.filter((s) => {
    if (s.category !== category) return false;
    if (isLK) return s.region === "lk";
    return true;
  });

  return NextResponse.json({ stories: mock, total: mock.length, source: "mock" });
}
