"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, X, Menu, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/types";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center transition-colors group-hover:bg-primary-hover">
              <span className="text-white font-bold text-sm leading-none">M</span>
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">
              multi<span className="text-secondary">view</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  pathname === `/category/${cat.slug}`
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-primary hover:bg-primary-light"
                }`}
              >
                {cat.label}
              </Link>
            ))}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary-light rounded-md transition-colors">
                More <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full right-0 mt-1 w-40 bg-white shadow-lg rounded-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {CATEGORIES.slice(5).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-light hover:text-primary transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-500 hover:text-primary hover:bg-primary-light rounded-md transition-colors"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-primary rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Link
              href="/about"
              className="hidden md:flex items-center px-4 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors"
            >
              About
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-100 bg-surface overflow-hidden"
          >
            <div className="px-4 py-3 grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-2 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary-light rounded-md transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="text-center px-2 py-2 text-sm font-medium text-primary hover:bg-primary-light rounded-md transition-colors"
              >
                About
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3 p-4">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stories, topics, outlets..."
                  className="flex-1 text-lg font-medium outline-none placeholder:text-gray-300 text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                {["AI", "Climate", "Economy", "Politics", "Space"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(tag)}`);
                      setSearchOpen(false);
                    }}
                    className="px-3 py-1 text-sm font-medium bg-surface-muted text-gray-600 rounded-full hover:bg-primary-light hover:text-primary transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
