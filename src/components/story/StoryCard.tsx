"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Users, Zap } from "lucide-react";
import type { Story } from "@/types";
import { CATEGORIES, SRI_LANKA_CATEGORIES } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StoryCard({ story, index = 0 }: { story: Story; index?: number }) {
  const categoryLabel =
    CATEGORIES.find((c) => c.slug === story.category)?.label || story.category;
  const isLK = (SRI_LANKA_CATEGORIES as string[]).includes(story.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link href={`/story/${story.id}`} className="group block h-full">
        <div
          className={`h-full flex flex-col rounded-2xl overflow-hidden bg-white transition-all duration-300
            ${story.isBreaking
              ? "border-2 border-red-400 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/10"
              : "border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
            }`}
        >
          {/* Image */}
          <div className="aspect-[16/9] overflow-hidden bg-gray-100 relative" suppressHydrationWarning>
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Top-left badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              {story.isBreaking && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wide bg-red-600 text-white rounded-md animate-pulse">
                  <Zap className="w-3 h-3" /> Breaking
                </span>
              )}
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wide bg-primary text-white rounded-md">
                {isLK && "🇱🇰 "}{categoryLabel}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-5">
            <h2 className="font-bold text-lg leading-snug text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-3">
              {story.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-4">
              {story.summary}
            </p>

            {/* Source outlet pills */}
            {story.sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {story.sources.slice(0, 3).map((s) => (
                  <span
                    key={s.id}
                    className="inline-block px-2 py-0.5 text-xs font-medium bg-[#F8F6F3] text-gray-500 rounded-full border border-gray-200"
                  >
                    {s.outlet}
                  </span>
                ))}
                {story.sources.length > 3 && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-[#F8F6F3] text-gray-400 rounded-full border border-gray-200">
                    +{story.sources.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(story.publishedRange.from)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#5C4033]">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {story.sources.length} {story.sources.length === 1 ? "source" : "sources"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
