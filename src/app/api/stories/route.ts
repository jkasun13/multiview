import { NextRequest, NextResponse } from "next/server";
import { MOCK_STORIES } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "technology";
  const query = searchParams.get("q") || "";
  const useMock = !process.env.NEWS_API_KEY;

  try {
    if (useMock) {
      const filtered = query
        ? MOCK_STORIES.filter(
            (s) =>
              s.title.toLowerCase().includes(query.toLowerCase()) ||
              s.summary.toLowerCase().includes(query.toLowerCase()) ||
              s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
          )
        : MOCK_STORIES.filter((s) => !category || s.category === category || category === "all");

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
    // Fallback to mock data on error
    return NextResponse.json({ stories: MOCK_STORIES, total: MOCK_STORIES.length });
  }
}
