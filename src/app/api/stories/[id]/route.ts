import { NextRequest, NextResponse } from "next/server";
import { getStoryById } from "@/lib/db";
import { MOCK_STORIES } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try DB first
  const dbStory = await getStoryById(id);
  if (dbStory) return NextResponse.json(dbStory);

  // Fall back to mock data
  const mock = MOCK_STORIES.find((s) => s.id === id);
  if (mock) return NextResponse.json(mock);

  return NextResponse.json({ error: "Story not found" }, { status: 404 });
}
