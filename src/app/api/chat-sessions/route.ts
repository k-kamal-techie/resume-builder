import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import dbConnect from "@/lib/mongoose";
import ChatHistory from "@/models/ChatHistory";

// GET — List all chat sessions for a resume
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumeId = req.nextUrl.searchParams.get("resumeId");
    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
    }

    await dbConnect();
    const sessions = await ChatHistory.find({
      resumeId,
      userId: session.user.id,
    })
      .select("_id title createdAt updatedAt messages")
      .sort({ updatedAt: -1 })
      .lean()
      .then((docs) =>
        docs.map((d) => ({
          _id: d._id,
          title: d.title,
          messageCount: d.messages.length,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        }))
      );

    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}

// POST — Create a new chat session
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, title } = await req.json();
    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
    }

    await dbConnect();
    const chatSession = await ChatHistory.create({
      resumeId,
      userId: session.user.id,
      title: title || "New Chat",
      messages: [],
    });

    return NextResponse.json(chatSession, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}
