"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, ArrowLeftRight, HelpCircle, AlertTriangle, RefreshCw } from "lucide-react";
import type { AIAnalysis } from "@/types";

interface Props {
  storyId: string;
  initialAnalysis?: AIAnalysis | null;
}

export default function AIHighlightsPanel({ storyId, initialAnalysis }: Props) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(initialAnalysis ?? null);
  const [loading, setLoading] = useState(!initialAnalysis);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/analysis`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Analysis unavailable (${res.status})`);
      }
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialAnalysis) {
      fetchAnalysis();
    }
  }, [storyId]);

  return (
    <div className="rounded-2xl border-2 border-secondary/30 bg-secondary-bg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-secondary/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-secondary text-base">AI Highlights</h2>
            <p className="text-xs text-secondary/70">Powered by Claude</p>
          </div>
        </div>
        {!loading && (
          <button
            onClick={fetchAnalysis}
            className="p-2 text-secondary/60 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
            aria-label="Refresh analysis"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 rounded bg-secondary/20 animate-pulse" />
                  <div className="h-3 w-full rounded bg-secondary/10 animate-pulse" />
                  <div className="h-3 w-5/6 rounded bg-secondary/10 animate-pulse" />
                  <div className="h-3 w-4/6 rounded bg-secondary/10 animate-pulse" />
                </div>
              ))}
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <AlertTriangle className="w-8 h-8 text-secondary/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-secondary/80">{error}</p>
              <button
                onClick={fetchAnalysis}
                className="mt-4 px-4 py-2 text-sm font-medium text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 transition-colors"
              >
                Try again
              </button>
            </motion.div>
          )}

          {analysis && !loading && !error && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Agree */}
              <Section
                icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
                title="What sources agree on"
                items={analysis.agree}
                itemStyle="text-gray-700"
                dotColor="bg-green-500"
              />

              {/* Differ */}
              <Section
                icon={<ArrowLeftRight className="w-4 h-4 text-primary-hover" />}
                title="Where they differ"
                items={analysis.differ.map(
                  (d) => `${d.outlet}: ${d.angle}`
                )}
                itemStyle="text-gray-700"
                dotColor="bg-primary-hover"
              />

              {/* Missing */}
              <Section
                icon={<HelpCircle className="w-4 h-4 text-amber-600" />}
                title="Missing context"
                items={analysis.missingContext}
                itemStyle="text-gray-700"
                dotColor="bg-amber-500"
              />

              {/* Disclaimer */}
              <p className="text-xs text-secondary/50 pt-2 border-t border-secondary/20">
                Generated by AI — verify against original sources. Analysis may
                be incomplete or contain errors.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  items,
  itemStyle,
  dotColor,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  itemStyle: string;
  dotColor: string;
}) {
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-bold text-sm text-secondary">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-2 shrink-0`} />
            <p className={`text-sm leading-relaxed ${itemStyle}`}>{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
