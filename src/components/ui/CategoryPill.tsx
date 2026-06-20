import Link from "next/link";

export default function CategoryPill({
  slug,
  label,
  active = false,
}: {
  slug: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={`/category/${slug}`}
      className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-primary text-white shadow-sm shadow-primary/30"
          : "bg-surface-muted text-gray-600 hover:bg-primary-light hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}
