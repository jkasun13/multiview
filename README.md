# Multiview

Compare how different news outlets cover the same story, side by side, with AI-generated analysis of agreement, disagreement, and missing context.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|---|---|---|
| `NEWS_API_KEY` | [NewsAPI.org](https://newsapi.org/register) free key | Optional (falls back to mock data) |
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com) key | Optional (AI Highlights panel shows error without it) |
| `NEXT_PUBLIC_BASE_URL` | Your deployment URL (e.g. `https://multiview.vercel.app`) | Vercel only |

> Without any keys, the app runs fully on mock data. All UI features work — only live news and live AI analysis require keys.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push the repo to GitHub
2. Import in Vercel — it auto-detects Next.js
3. Add env vars in **Project Settings → Environment Variables**
4. Set `NEXT_PUBLIC_BASE_URL` to your Vercel deployment URL

## Swapping the news provider

The project uses an adapter pattern in `src/lib/newsapi.ts`. The `NewsProvider` interface requires two methods:

```ts
interface NewsProvider {
  fetchStoriesByCategory(category: string, pageSize?: number): Promise<Story[]>;
  searchStories(query: string, pageSize?: number): Promise<Story[]>;
}
```

To add GNews or Mediastack:

1. Create a new class implementing `NewsProvider` in `src/lib/newsapi.ts`
2. Update `getNewsProvider()` to instantiate it based on an env var
3. Add the new API key to `.env.local` and `.env.example`

## Architecture

```
src/
├── app/
│   ├── page.tsx                        # Homepage feed
│   ├── story/[id]/page.tsx             # Story comparison page
│   ├── category/[slug]/page.tsx        # Category feed
│   ├── search/page.tsx                 # Search results
│   ├── about/page.tsx                  # Methodology & disclaimers
│   └── api/
│       └── stories/
│           ├── route.ts                # GET /api/stories?category=&q=
│           └── [id]/analysis/route.ts  # GET /api/stories/[id]/analysis
├── components/
│   ├── layout/   Header, Footer
│   ├── story/    StoryCard, SourceCard, AIHighlightsPanel
│   └── ui/       ToneBadge, SkeletonCard, CategoryPill
├── lib/
│   ├── newsapi.ts          # NewsAPI adapter + provider interface
│   ├── analysis-cache.ts   # In-memory TTL cache for AI analysis
│   └── mock-data.ts        # Rich mock stories for dev/fallback
└── types/index.ts          # Story, SourceArticle, AIAnalysis types
```

## Tech stack

- **Next.js 14+** — App Router, TypeScript, Server Components
- **Tailwind CSS** — custom palette (deep blue `#1E3A8A`, espresso `#5C4033`)
- **Framer Motion** — card animations, search overlay
- **Poppins** — loaded via `next/font/google`
- **Anthropic SDK** — server-side only, `claude-haiku-4-5` for fast analysis
- **NewsAPI.org** — primary news aggregation
