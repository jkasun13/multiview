import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import StoryCard from "@/components/story/StoryCard";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { MOCK_STORIES } from "@/lib/mock-data";
import type { Story } from "@/types";

async function searchStories(query: string): Promise<Story[]> {
  if (!query.trim()) return [];
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const res = await fetch(
      `${baseUrl}/api/stories?q=${encodeURIComponent(query)}`,
      { next: { revalidate: 18000 } }
    );
    if (!res.ok) {
      return MOCK_STORIES.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.summary.toLowerCase().includes(query.toLowerCase())
      );
    }
    const data = await res.json();
    return data.stories || [];
  } catch {
    return MOCK_STORIES.filter(
      (s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.summary.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" — Search` : "Search",
    description: q
      ? `News coverage comparison results for "${q}"`
      : "Search Multiview stories",
  };
}

async function Results({ query }: { query: string }) {
  const stories = await searchStories(query);

  if (!stories.length) {
    return (
      <div className="text-center py-24 text-gray-400">
        <SearchX className="w-12 h-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg font-medium">No stories found for &quot;{query}&quot;</p>
        <p className="text-sm mt-2">Try a different keyword or topic.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story, i) => (
        <StoryCard key={story.id} story={story} index={i} />
      ))}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-[#F8F6F3] border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">
            Search results
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {query ? (
              <>
                Results for &quot;<span className="text-primary">{query}</span>&quot;
              </>
            ) : (
              "Search"
            )}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {query ? (
          <Suspense fallback={<SkeletonGrid count={6} />}>
            <Results query={query} />
          </Suspense>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-medium">Enter a search term to find stories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
