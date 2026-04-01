import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { sendMessage } from "@/lib/anthropic";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { extractJSON } from "@/lib/json-extract";
import { getUserAnthropicConfig, NoTokenConfiguredError } from "@/lib/user-anthropic-config";

const SYSTEM_PROMPT = `You are an expert resume tailoring specialist. You analyze job descriptions and modify resumes to better match the role while keeping content truthful.

Your task:
1. Analyze the job description for key requirements, skills, and keywords
2. Compare with the current resume content
3. Suggest specific modifications to better align the resume with the job
4. Identify missing keywords that should be incorporated
5. Prioritize sections and bullet points that are most relevant

Return your response as valid JSON.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let anthropicConfig;
    try {
      anthropicConfig = await getUserAnthropicConfig(session.user.id);
    } catch (err) {
      if (err instanceof NoTokenConfiguredError) {
        return NextResponse.json({ error: "NO_API_TOKEN_CONFIGURED" }, { status: 422 });
      }
      throw err;
    }

    const rl = checkRateLimit(`${session.user.id}:tailor`, { limit: 5, windowSeconds: 60 });
    if (!rl.allowed) return rateLimitResponse(rl);

    const { jobDescription, resumeData } = await req.json();
    if (!jobDescription || !resumeData) {
      return NextResponse.json(
        { error: "Job description and resume data are required" },
        { status: 400 }
      );
    }

    const prompt = `Analyze this job description and suggest how to tailor the resume:

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${JSON.stringify(resumeData, null, 2)}

Return as JSON:
{
  "matchScore": <0-100>,
  "suggestions": [
    { "section": "...", "current": "...", "suggested": "...", "reason": "..." }
  ],
  "missingKeywords": ["..."],
  "prioritySections": ["..."],
  "tailoredSummary": "..."
}`;

    const response = await sendMessage({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 8192,
      token: anthropicConfig.token,
      model: anthropicConfig.model,
    });

    const content = response.content[0]?.text || "";
    const parsed = extractJSON(content);
    if (parsed) {
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI tailor error:", error);
    return NextResponse.json(
      { error: "Failed to tailor resume" },
      { status: 500 }
    );
  }
}
