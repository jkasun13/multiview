import { NextResponse } from "next/server";
import { MOCK_STORIES } from "@/lib/mock-data";

// Never cache this route — always return fresh data for breaking news
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.NEWS_API_KEY) {
      // Return mock breaking stories (those published most recently)
      const breaking = MOCK_STORIES.filter((s) => s.isBreaking).slice(0, 5);
      // If no mock stories are tagged breaking (timestamps are old), return top 3 as demo
      const result = breaking.length > 0 ? breaking : MOCK_STORIES.slice(0, 3).map((s) => ({ ...s, isBreaking: true }));
      return NextResponse.json({ stories: result });
    }

    const { getNewsProvider } = await import("@/lib/newsapi");
    const provider = getNewsProvider();
    const stories = await provider.fetchBreakingStories(20);
    return NextResponse.json({ stories });
  } catch (err) {
    console.error("Breaking news fetch error:", err);
    // Graceful fallback
    const fallback = MOCK_STORIES.slice(0, 3).map((s) => ({ ...s, isBreaking: true }));
    return NextResponse.json({ stories: fallback });
  }
}
