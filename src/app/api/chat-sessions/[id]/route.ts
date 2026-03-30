import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import dbConnect from "@/lib/mongoose";
import ChatHistory from "@/models/ChatHistory";

// GET — Fetch a single chat session with messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    const chatSession = await ChatHistory.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!chatSession) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(chatSession);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch chat session" },
      { status: 500 }
    );
  }
}

// PUT — Save messages to a chat session
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { messages, title } = await req.json();

    await dbConnect();
    const update: Record<string, unknown> = {};
    if (messages) update.messages = messages;
    if (title) update.title = title;

    const chatSession = await ChatHistory.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      update,
      { new: true }
    ).lean();

    if (!chatSession) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(chatSession);
  } catch {
    return NextResponse.json(
      { error: "Failed to update chat session" },
      { status: 500 }
    );
  }
}

// DELETE — Delete a chat session
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    await ChatHistory.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete chat session" },
      { status: 500 }
    );
  }
}
