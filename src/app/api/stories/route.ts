import { NextRequest, NextResponse } from "next/server";
import { MOCK_STORIES } from "@/lib/mock-data";
import { SRI_LANKA_CATEGORIES } from "@/types";

export const revalidate = 18000; // 5 hours for regular news

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "world";
  const query = searchParams.get("q") || "";

  try {
    if (!process.env.NEWS_API_KEY) {
      const isSriLanka = (SRI_LANKA_CATEGORIES as string[]).includes(category);

      const filtered = query
        ? MOCK_STORIES.filter(
            (s) =>
              s.title.toLowerCase().includes(query.toLowerCase()) ||
              s.summary.toLowerCase().includes(query.toLowerCase()) ||
              s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
          )
        : MOCK_STORIES.filter((s) => {
            if (category === "all") return true;
            if (s.category !== category) return false;
            // Sri Lanka categories: only return lk region stories
            if (isSriLanka) return s.region === "lk";
            return true;
          });

      return NextResponse.json({ stories: filtered, total: filtered.length });
    }

    const { getNewsProvider } = await import("@/lib/newsapi");
    const provider = getNewsProvider();

    const stories = query
      ? await provider.searchStories(query)
      : await provider.fetchStoriesByCategory(category);

    return NextResponse.json({ stories, total: stories.length });
  } catch (err) {
    console.error("Stories fetch error:", err);
    return NextResponse.json({ stories: MOCK_STORIES, total: MOCK_STORIES.length });
  }
}
