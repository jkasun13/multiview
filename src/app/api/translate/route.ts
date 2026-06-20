import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In-memory cache so we don't re-translate the same story
const cache = new Map<string, TranslationResult>();

interface SourceInput {
  id: string;
  outlet: string;
  headline: string;
  snippet: string;
}

interface TranslationResult {
  title: string;
  summary: string;
  sources: { id: string; headline: string; snippet: string }[];
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Translation unavailable — ANTHROPIC_API_KEY not configured" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body?.storyId || !body?.title || !body?.summary || !Array.isArray(body?.sources)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { storyId, title, summary, sources } = body as {
    storyId: string;
    title: string;
    summary: string;
    sources: SourceInput[];
  };

  // Return cached result if available
  if (cache.has(storyId)) {
    return NextResponse.json(cache.get(storyId));
  }

  const prompt = `Translate the following news story content into Sinhala (සිංහල script). Rules:
- Keep proper nouns (person names, organisation names, country names) in their original English form
- Keep numbers, percentages, and currency values unchanged
- Return ONLY valid JSON, no other text
- Match the exact JSON structure provided

Input JSON:
${JSON.stringify({ title, summary, sources: sources.map((s) => ({ id: s.id, headline: s.headline, snippet: s.snippet })) }, null, 2)}

Return JSON in this exact structure:
{
  "title": "<Sinhala translation>",
  "summary": "<Sinhala translation>",
  "sources": [
    { "id": "<same id>", "headline": "<Sinhala translation>", "snippet": "<Sinhala translation>" }
  ]
}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Strip markdown code fences if Claude wrapped the JSON
  const jsonText = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  let result: TranslationResult;
  try {
    result = JSON.parse(jsonText);
  } catch {
    return NextResponse.json({ error: "Translation parsing failed" }, { status: 500 });
  }

  cache.set(storyId, result);
  return NextResponse.json(result);
}
