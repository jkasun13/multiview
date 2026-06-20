"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight, ChevronLeft, ExternalLink } from "lucide-react";
import type { Story } from "@/types";

const POLL_INTERVAL_MS = 60_000; // re-fetch every 60 s (breaking = ASAP)
const ROTATE_INTERVAL_MS = 5_000;

export default function BreakingNewsBanner() {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const fetchBreaking = useCallback(async () => {
    try {
      const res = await fetch("/api/stories/breaking", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.stories) && data.stories.length > 0) {
        setStories(data.stories);
        setVisible(true);
      }
    } catch {
      // silently fail — breaking banner is non-critical
    }
  }, []);

  // Initial fetch + poll every minute
  useEffect(() => {
    fetchBreaking();
    const interval = setInterval(fetchBreaking, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchBreaking]);

  // Auto-rotate ticker items
  useEffect(() => {
    if (stories.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % stories.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [stories.length]);

  if (!visible || stories.length === 0) return null;

  const active = stories[activeIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-red-600 text-white z-40 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0 h-11">
            {/* Label */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-sm mr-4 shrink-0">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-widest">Breaking</span>
            </div>

            {/* Rotating headline */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <Link
                    href={`/story/${active.id}`}
                    className="text-sm font-medium truncate hover:underline"
                  >
                    {active.title}
                  </Link>
                  {active.sources[0] && (
                    <a
                      href={active.sources[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-xs text-red-200 hover:text-white transition-colors"
                    >
                      <span className="hidden sm:inline">{active.sources[0].outlet}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Nav arrows — only if multiple stories */}
            {stories.length > 1 && (
              <div className="flex items-center gap-1 ml-3 shrink-0">
                <button
                  onClick={() => setActiveIndex((i) => (i - 1 + stories.length) % stories.length)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                  aria-label="Previous breaking story"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-red-200 tabular-nums w-10 text-center">
                  {activeIndex + 1}/{stories.length}
                </span>
                <button
                  onClick={() => setActiveIndex((i) => (i + 1) % stories.length)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                  aria-label="Next breaking story"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
