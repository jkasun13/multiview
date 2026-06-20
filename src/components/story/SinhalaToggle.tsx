"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Loader2 } from "lucide-react";
import type { Story } from "@/types";
import SourceCard from "./SourceCard";

interface TranslatedContent {
  title: string;
  summary: string;
  sources: { id: string; headline: string; snippet: string }[];
}

interface Props {
  story: Story;
  /** Render prop — called with whatever content to show */
  children: (content: {
    title: string;
    summary: string;
    isSinhala: boolean;
  }) => React.ReactNode;
}

// Exported separately so the source-cards section can also receive translated content
export function SinhalaSourceCards({
  story,
  translated,
}: {
  story: Story;
  translated: TranslatedContent | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {story.sources.map((source, i) => {
        const t = translated?.sources.find((s) => s.id === source.id);
        return (
          <SourceCard
            key={source.id}
            article={
              t
                ? { ...source, headline: t.headline, snippet: t.snippet }
                : source
            }
            index={i}
          />
        );
      })}
    </div>
  );
}

export default function SinhalaToggle({ story, children }: Props) {
  const [isSinhala, setIsSinhala] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState<TranslatedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function enableSinhala() {
    if (translated) {
      setIsSinhala(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId: story.id,
          title: story.title,
          summary: story.summary,
          sources: story.sources.map((s) => ({
            id: s.id,
            outlet: s.outlet,
            headline: s.headline,
            snippet: s.snippet,
          })),
        }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({}));
        throw new Error(msg || "Translation failed");
      }
      const data: TranslatedContent = await res.json();
      setTranslated(data);
      setIsSinhala(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setLoading(false);
    }
  }

  const content = isSinhala && translated
    ? { title: translated.title, summary: translated.summary, isSinhala: true }
    : { title: story.title, summary: story.summary, isSinhala: false };

  return (
    <>
      {/* Language toggle pill */}
      <div className="flex items-center gap-3 mb-6">
        <Languages className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden bg-[#F8F6F3] text-sm font-medium">
          <button
            onClick={() => setIsSinhala(false)}
            className={`px-4 py-2 transition-colors ${
              !isSinhala
                ? "bg-primary text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            English
          </button>
          <button
            onClick={enableSinhala}
            disabled={loading}
            className={`px-4 py-2 flex items-center gap-1.5 transition-colors disabled:opacity-60 ${
              isSinhala
                ? "bg-primary text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            සිංහල
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        {loading && (
          <p className="text-xs text-gray-400 animate-pulse">AI translating…</p>
        )}
      </div>

      {/* Animated content swap */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isSinhala ? "si" : "en"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {children(content)}
        </motion.div>
      </AnimatePresence>

      {/* Translated source cards — rendered outside the AnimatePresence children */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          {isSinhala ? "ලිපි ආවරණය කළ ආකාරය" : "How outlets covered this story"}
        </h2>
        <SinhalaSourceCards story={story} translated={isSinhala ? translated : null} />
      </div>
    </>
  );
}
