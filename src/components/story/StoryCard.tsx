"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Users } from "lucide-react";
import type { Story } from "@/types";
import { CATEGORIES } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function StoryCard({
  story,
  index = 0,
}: {
  story: Story;
  index?: number;
}) {
  const categoryLabel =
    CATEGORIES.find((c) => c.slug === story.category)?.label || story.category;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link href={`/story/${story.id}`} className="group block h-full">
        <div className="h-full flex flex-col rounded-2xl overflow-hidden bg-surface border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          {/* Image */}
          <div className="aspect-[16/9] overflow-hidden bg-surface-muted relative">
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wide bg-primary text-white rounded-md">
                {categoryLabel}
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

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(story.publishedRange.from)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {story.sources.length}{" "}
                  {story.sources.length === 1 ? "source" : "sources"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
