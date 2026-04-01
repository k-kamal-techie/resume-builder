import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { streamMessage } from "@/lib/anthropic";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are an expert professional resume writer, career coach, and personal knowledge manager. You help users build and manage their professional profile and craft compelling, ATS-friendly resumes.

You have access to two data stores:
1. Knowledge Base (KB) — the user's complete professional profile (all skills, experiences, projects, achievements)
2. Current Resume — a specific resume being edited (a curated subset of the KB for a particular job)

Your capabilities:
- Generate professional bullet points with strong action verbs and quantified results
- Write compelling professional summaries
- Add, edit, or remove skills, experience, projects, and achievements
- Tailor resumes to specific job descriptions by selecting relevant items from the KB
- Ask clarifying questions to gather more details before making changes

When you make changes:
- To update the resume, output a complete JSON in a resume-json code block
- To update the knowledge base, output a complete JSON in a kb-json code block
- You can output both if updating both stores

Be conversational and agentic. Ask questions to understand the user's background. When adding new information, ask about details like dates, metrics, and impact before finalizing.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(`${session.user.id}:chat`, { limit: 15, windowSeconds: 60 });
    if (!rl.allowed) return rateLimitResponse(rl);

    const { message, resumeId, history } = await req.json();
    if (!message || !resumeId) {
      return NextResponse.json(
        { error: "Message and resumeId are required" },
        { status: 400 }
      );
    }

    const messages = [
      ...(history || []).map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await streamMessage({
      system: SYSTEM_PROMPT,
      messages,
    });

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    const message = error instanceof Error ? error.message : "Failed to process chat message";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
