import type { ToneType } from "@/types";

const TONE_CONFIG: Record<ToneType, { label: string; className: string }> = {
  neutral: {
    label: "Neutral",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  critical: {
    label: "Critical",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  favorable: {
    label: "Favorable",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  mixed: {
    label: "Mixed",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export default function ToneBadge({ tone }: { tone: ToneType }) {
  const config = TONE_CONFIG[tone];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
