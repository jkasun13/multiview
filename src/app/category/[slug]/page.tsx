import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryCard from "@/components/story/StoryCard";
import CategoryPill from "@/components/ui/CategoryPill";
import { MOCK_STORIES } from "@/lib/mock-data";
import { CATEGORIES } from "@/types";
import type { Story } from "@/types";

async function getStoriesByCategory(slug: string): Promise<Story[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/stories?category=${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return MOCK_STORIES;
    const data = await res.json();
    return data.stories?.length ? data.stories : MOCK_STORIES;
  } catch {
    return MOCK_STORIES;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return { title: "Category not found" };
  return {
    title: `${cat.label} News`,
    description: `Compare how different news outlets cover ${cat.label.toLowerCase()} stories.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();

  const stories = await getStoriesByCategory(slug);

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-300 text-sm font-medium uppercase tracking-widest mb-3">
            Category
          </p>
          <h1 className="text-4xl md:text-5xl font-bold">{cat.label}</h1>
          <p className="text-blue-200 mt-3 text-lg max-w-xl">
            Compare how different outlets frame the latest {cat.label.toLowerCase()} stories.
          </p>
        </div>
      </div>

      {/* Category pills */}
      <div className="border-b border-gray-100 bg-[#F8F6F3] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {CATEGORIES.map((c) => (
              <CategoryPill
                key={c.slug}
                slug={c.slug}
                label={c.label}
                active={c.slug === slug}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {stories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-medium">
              No {cat.label.toLowerCase()} stories right now.
            </p>
            <p className="text-sm mt-2">Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
