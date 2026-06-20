import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Globe2 } from "lucide-react";
import StoryCard from "@/components/story/StoryCard";
import CategoryPill from "@/components/ui/CategoryPill";
import { MOCK_STORIES } from "@/lib/mock-data";
import { CATEGORIES } from "@/types";
import type { Story } from "@/types";

export const revalidate = 10800; // 3 hours

export const metadata: Metadata = {
  title: "Multiview — Compare How News Outlets Cover the Same Story",
};

async function getFeaturedStories(): Promise<Story[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/stories?category=technology`, {
      next: { revalidate: 10800 },
    });
    if (!res.ok) return MOCK_STORIES;
    const data = await res.json();
    return data.stories?.length ? data.stories : MOCK_STORIES;
  } catch {
    return MOCK_STORIES;
  }
}

export default async function HomePage() {
  const stories = await getFeaturedStories();
  const featured = stories[0];
  const rest = stories.slice(1);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white blur-[120px] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-300 blur-[100px] -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
                <Globe2 className="w-4 h-4 text-blue-300" />
                <span className="text-blue-100">
                  Comparing coverage across 50+ outlets
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                The same story.
                <br />
                <span className="text-blue-300">Different angles.</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed mb-8 max-w-lg">
                Multiview shows you how CNN, BBC, Reuters, Fox News, and more
                cover the same event — with AI that highlights what they agree on,
                where they diverge, and what&apos;s missing.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/category/politics"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Explore stories
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
                >
                  How it works
                </Link>
              </div>
            </div>

            {featured && (
              <Link
                href={`/story/${featured.id}`}
                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <Image
                    src={featured.imageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-300" />
                    <span className="text-xs font-bold uppercase tracking-wide text-blue-300">
                      Featured
                    </span>
                  </div>
                  <h2 className="font-bold text-xl leading-snug text-white mb-2 group-hover:text-blue-100 transition-colors line-clamp-3">
                    {featured.title}
                  </h2>
                  <p className="text-sm text-blue-200 flex items-center gap-1">
                    {featured.sources.length} sources covering this story
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Category filter bar */}
      <section className="border-b border-gray-100 bg-[#F8F6F3] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1 shrink-0">
              Topics
            </span>
            {CATEGORIES.map((cat) => (
              <CategoryPill key={cat.slug} slug={cat.slug} label={cat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Stories grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Latest Stories</h2>
            <p className="text-gray-500 mt-1">
              Click any story to compare coverage across sources
            </p>
          </div>
          <Link
            href="/category/world"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {rest.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Globe2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No stories available right now.</p>
          </div>
        )}
      </section>

      {/* CTA strip */}
      <section className="bg-[#F5F0EB] border-t border-[#5C4033]/10 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#5C4033] mb-4">
            Understand the full picture
          </h2>
          <p className="text-[#5C4033]/70 text-lg mb-8">
            Every story has angles the headline doesn&apos;t tell you. Multiview
            uses AI to surface what&apos;s agreed upon, contested, and overlooked
            across the sources that matter.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5C4033] text-white font-bold rounded-xl hover:bg-[#5C4033]/90 transition-colors"
          >
            Read our methodology
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
