import { NextRequest, NextResponse } from "next/server";
import { MOCK_STORIES, MOCK_ANALYSIS } from "@/lib/mock-data";
import { getAnalysis, setAnalysis, getStoryById } from "@/lib/db";
import type { Story } from "@/types";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

async function findStory(id: string): Promise<Story | null> {
  // 1. DB (pipeline-stored stories)
  try {
    const dbStory = await getStoryById(id);
    if (dbStory) return dbStory;
  } catch {}
  // 2. Mock data
  return MOCK_STORIES.find((s) => s.id === id) ?? null;
}

async function generateAnalysis(story: Story) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const sourceSummaries = story.sources
    .map(
      (s, i) =>
        `Source ${i + 1} — ${s.outlet}:\nHeadline: "${s.headline}"\nSnippet: "${s.snippet}"\nTone: ${s.tone}`
    )
    .join("\n\n");

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a journalism analyst. Given coverage of the same story from multiple outlets, produce a structured analysis.

Story: "${story.title}"

${sourceSummaries}

Return ONLY valid JSON with exactly these three keys:
{
  "agree": ["bullet 1", "bullet 2"],
  "differ": [{"outlet": "Name", "angle": "their specific angle"}],
  "missingContext": ["bullet 1", "bullet 2"]
}

Rules:
- "agree": 2-4 factual points all sources confirm
- "differ": one entry per source with a notably distinct framing
- "missingContext": 2-4 facts/context absent from coverage
- Return only JSON, no markdown fences`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    agree: Array.isArray(parsed.agree) ? parsed.agree : [],
    differ: Array.isArray(parsed.differ) ? parsed.differ : [],
    missingContext: Array.isArray(parsed.missingContext) ? parsed.missingContext : [],
    generatedAt: new Date().toISOString(),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. DB cache
  try {
    const cached = await getAnalysis(id);
    if (cached) return NextResponse.json(cached);
  } catch {}

  // 2. Mock analysis
  if (MOCK_ANALYSIS[id]) {
    await setAnalysis(id, MOCK_ANALYSIS[id]).catch(() => {});
    return NextResponse.json(MOCK_ANALYSIS[id]);
  }

  // 3. Find story
  const story = await findStory(id);
  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  // 4. Generate fresh
  try {
    const analysis = await generateAnalysis(story);
    await setAnalysis(id, analysis).catch(() => {});
    return NextResponse.json(analysis);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate analysis";
    if (msg.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI analysis requires ANTHROPIC_API_KEY to be configured." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
