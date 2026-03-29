import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { streamMessage } from "@/lib/anthropic";
import dbConnect from "@/lib/mongoose";
import ChatHistory from "@/models/ChatHistory";

const SYSTEM_PROMPT = `You are an expert professional resume writer and career coach. You help users craft compelling, ATS-friendly resume content.

Your capabilities:
- Generate professional bullet points from rough descriptions of work experience
- Write compelling professional summaries
- Suggest improvements to existing resume content
- Use strong action verbs and quantify achievements where possible
- Follow best practices: concise, impactful, results-oriented language

When the user describes their work or projects, transform it into polished resume-ready content. Always maintain a professional tone and focus on measurable impact.

Format your responses in clear sections when providing multiple pieces of content. Use bullet points for experience highlights.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Save chat message to history (fire and forget)
    dbConnect().then(() => {
      ChatHistory.findOneAndUpdate(
        { resumeId, userId: session.user!.id },
        {
          $push: {
            messages: { role: "user", content: message, timestamp: new Date() },
          },
        },
        { upsert: true }
      ).catch(console.error);
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
