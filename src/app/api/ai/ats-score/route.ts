import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { sendMessage } from "@/lib/anthropic";
import { getUserAISettings } from "@/lib/getUserAISettings";

const SYSTEM_PROMPT = `You are an ATS (Applicant Tracking System) expert. You analyze resumes against job descriptions and provide detailed compatibility scores.

Score categories (0-100 each):
- keywordMatch: How well resume keywords match the job description
- skillsAlignment: How well the candidate's skills match requirements
- formatCompatibility: How ATS-friendly the resume format/content structure is
- contentRelevance: How relevant the experience and projects are to the role

Provide actionable suggestions for improvement. Return valid JSON.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobDescription, resumeData } = await req.json();
    if (!jobDescription || !resumeData) {
      return NextResponse.json(
        { error: "Job description and resume data are required" },
        { status: 400 }
      );
    }

    const prompt = `Score this resume against the job description for ATS compatibility:

JOB DESCRIPTION:
${jobDescription}

RESUME:
${JSON.stringify(resumeData, null, 2)}

Return as JSON:
{
  "overall": <0-100>,
  "keywordMatch": <0-100>,
  "skillsAlignment": <0-100>,
  "formatCompatibility": <0-100>,
  "contentRelevance": <0-100>,
  "suggestions": ["actionable suggestion 1", "..."],
  "missingKeywords": ["keyword1", "..."],
  "strongPoints": ["strength1", "..."]
}`;

    const aiSettings = await getUserAISettings(session.user.id);

    const response = await sendMessage({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      apiKey: aiSettings.apiKey,
      model: aiSettings.model,
    });

    const content = response.content[0]?.text || "";

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      }
    } catch {
      // fallback
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI ATS score error:", error);
    return NextResponse.json(
      { error: "Failed to score resume" },
      { status: 500 }
    );
  }
}
