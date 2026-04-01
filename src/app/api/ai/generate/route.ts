import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { sendMessage } from "@/lib/anthropic";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { extractJSON } from "@/lib/json-extract";

const SYSTEM_PROMPT = `You are an expert resume content generator. Generate professional, ATS-friendly resume content based on the user's input.

Rules:
- Use strong action verbs (Led, Developed, Implemented, Optimized, etc.)
- Quantify achievements with numbers, percentages, or metrics when possible
- Keep bullet points concise (1-2 lines each)
- Focus on impact and results, not just responsibilities
- Use industry-standard terminology

Return your response as valid JSON matching the requested format.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(`${session.user.id}:generate`, { limit: 10, windowSeconds: 60 });
    if (!rl.allowed) return rateLimitResponse(rl);

    const { type, input, context } = await req.json();
    if (!type || !input) {
      return NextResponse.json(
        { error: "Type and input are required" },
        { status: 400 }
      );
    }

    let prompt = "";
    switch (type) {
      case "bullets":
        prompt = `Generate 3-5 professional resume bullet points for this experience:\n\n${input}\n\nReturn as JSON: { "bullets": ["bullet1", "bullet2", ...] }`;
        break;
      case "summary":
        prompt = `Write a professional summary (2-3 sentences) for someone with this background:\n\n${input}\n\nReturn as JSON: { "summary": "..." }`;
        break;
      case "improve":
        prompt = `Improve this resume content to be more impactful and ATS-friendly:\n\n${input}\n\nReturn as JSON: { "improved": "..." }`;
        break;
      case "skills":
        prompt = `Based on this experience, suggest relevant technical and soft skills categorized:\n\n${input}\n\nReturn as JSON: { "skills": [{ "category": "...", "items": ["..."] }] }`;
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (context) {
      prompt += `\n\nAdditional context about the resume:\n${context}`;
    }

    const response = await sendMessage({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0]?.text || "";
    const parsed = extractJSON(content);
    if (parsed) {
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
