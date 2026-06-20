import { NextRequest, NextResponse } from "next/server";
import { MOCK_STORIES, MOCK_ANALYSIS } from "@/lib/mock-data";
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/analysis-cache";
import type { AIAnalysis, Story } from "@/types";

async function findStory(id: string): Promise<Story | null> {
  // First check mock data
  const mock = MOCK_STORIES.find((s) => s.id === id);
  if (mock) return mock;
  return null;
}

async function generateAnalysis(story: Story): Promise<AIAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey });

  const sourceSummaries = story.sources
    .map(
      (s, i) =>
        `Source ${i + 1} — ${s.outlet}:\nHeadline: "${s.headline}"\nSnippet: "${s.snippet}"\nTone: ${s.tone}`
    )
    .join("\n\n");

  const prompt = `You are a journalism analyst. Given the following news coverage of the same story from multiple outlets, produce a structured analysis.

Story: "${story.title}"

${sourceSummaries}

Return ONLY a valid JSON object with exactly these three keys:
{
  "agree": ["bullet 1", "bullet 2", ...],
  "differ": [{"outlet": "Outlet Name", "angle": "their specific angle or framing"}, ...],
  "missingContext": ["bullet 1", "bullet 2", ...]
}

Rules:
- "agree": 2-4 factual points all sources confirm
- "differ": one entry per source that has a notably distinct angle/framing (skip sources with purely neutral/generic framing)
- "missingContext": 2-4 important facts, context, or perspectives absent from all/most coverage
- Be specific, name outlets when relevant, avoid vague generalities
- Return only the JSON object, no prose, no markdown code fences`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Strip any accidental markdown code fences
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

  // Check cache first
  const cached = getCachedAnalysis(id);
  if (cached) {
    return NextResponse.json(cached);
  }

  // Check mock analysis
  if (MOCK_ANALYSIS[id]) {
    setCachedAnalysis(id, MOCK_ANALYSIS[id]);
    return NextResponse.json(MOCK_ANALYSIS[id]);
  }

  // Find the story
  const story = await findStory(id);
  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  try {
    const analysis = await generateAnalysis(story);
    setCachedAnalysis(id, analysis);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Analysis generation error:", err);
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
