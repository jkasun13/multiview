import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Users, Tag } from "lucide-react";
import SourceCard from "@/components/story/SourceCard";
import AIHighlightsPanel from "@/components/story/AIHighlightsPanel";
import { MOCK_STORIES, MOCK_ANALYSIS } from "@/lib/mock-data";
import { CATEGORIES } from "@/types";
import type { Story } from "@/types";

async function getStory(id: string): Promise<Story | null> {
  const mock = MOCK_STORIES.find((s) => s.id === id);
  if (mock) return mock;
  return null;
}

function formatDateRange(from: string, to: string) {
  const a = new Date(from);
  const b = new Date(to);
  const opts: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  if (a.toDateString() === b.toDateString()) {
    return a.toLocaleDateString("en-US", opts);
  }
  return `${a.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${b.toLocaleDateString("en-US", opts)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const story = await getStory(id);
  if (!story) return { title: "Story not found" };
  return {
    title: story.title,
    description: story.summary,
    openGraph: {
      title: story.title,
      description: story.summary,
      images: [{ url: story.imageUrl }],
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getStory(id);

  if (!story) notFound();

  const categoryLabel =
    CATEGORIES.find((c) => c.slug === story.category)?.label || story.category;

  const initialAnalysis = MOCK_ANALYSIS[id] ?? null;

  return (
    <div className="bg-white">
      {/* Back nav */}
      <div className="border-b border-gray-100 bg-[#F8F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to stories
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <Image
          src={story.imageUrl}
          alt={story.title}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide bg-primary text-white rounded-md">
                {categoryLabel}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {formatDateRange(
                    story.publishedRange.from,
                    story.publishedRange.to
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Users className="w-3.5 h-3.5" />
                <span>{story.sources.length} sources</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
              {story.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Sources — left 2/3 */}
          <div className="xl:col-span-2 space-y-8">
            {/* Summary */}
            {story.summary && (
              <div className="p-6 bg-[#F8F6F3] rounded-2xl border border-gray-100">
                <p className="text-base text-gray-600 leading-relaxed">
                  {story.summary}
                </p>
                {story.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    {story.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 bg-white rounded-full text-gray-500 border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Source cards */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                How outlets covered this story
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {story.sources.map((source, i) => (
                  <SourceCard key={source.id} article={source} index={i} />
                ))}
              </div>
            </div>
          </div>

          {/* AI Highlights — sticky right column on xl */}
          <div className="xl:col-span-1">
            <div className="xl:sticky xl:top-28">
              <AIHighlightsPanel
                storyId={story.id}
                initialAnalysis={initialAnalysis}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
