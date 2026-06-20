"use client";

import { motion } from "framer-motion";
import { ExternalLink, Clock } from "lucide-react";
import type { SourceArticle } from "@/types";
import ToneBadge from "@/components/ui/ToneBadge";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function OutletIcon({ domain }: { domain: string }) {
  const initials = domain
    .split(".")
    .slice(-2, -1)[0]
    ?.slice(0, 2)
    .toUpperCase() || "??";

  const colors: Record<string, string> = {
    "cnn.com": "bg-[#CC0000]",
    "bbc.com": "bg-[#BB1919]",
    "reuters.com": "bg-[#FF8000]",
    "nytimes.com": "bg-gray-900",
    "wsj.com": "bg-[#0274B3]",
    "foxnews.com": "bg-[#003087]",
    "foxbusiness.com": "bg-[#003087]",
    "theguardian.com": "bg-[#052962]",
    "bloomberg.com": "bg-[#1A1A1A]",
    "apnews.com": "bg-[#C41E3A]",
    "npr.org": "bg-[#1A6496]",
    "politico.com": "bg-[#243666]",
    "techcrunch.com": "bg-[#0A8C4C]",
    "theverge.com": "bg-[#FA4D1F]",
    "wired.com": "bg-[#111111]",
    "arstechnica.com": "bg-[#D04900]",
    "nbcnews.com": "bg-[#1A73E8]",
    "statnews.com": "bg-[#CC0000]",
    "scientificamerican.com": "bg-[#1166AA]",
  };

  const bgColor = colors[domain] || "bg-secondary";

  return (
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center ${bgColor} shrink-0`}
    >
      <span className="text-white text-xs font-bold">{initials}</span>
    </div>
  );
}

export default function SourceCard({
  article,
  index = 0,
}: {
  article: SourceArticle;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
      className="group bg-surface rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <OutletIcon domain={article.outletDomain} />
          <div>
            <p className="font-bold text-sm text-gray-900">{article.outlet}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{formatDateTime(article.publishedAt)}</span>
            </div>
          </div>
        </div>
        <ToneBadge tone={article.tone} />
      </div>

      {/* Headline */}
      <h3 className="font-bold text-base leading-snug text-gray-900 group-hover:text-primary transition-colors">
        {article.headline}
      </h3>

      {/* Snippet */}
      {article.snippet && (
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
          {article.snippet}
        </p>
      )}

      {/* Link */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        Read original
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </motion.div>
  );
}
