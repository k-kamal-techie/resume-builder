import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.user.id)
    .select("anthropicApiKey aiModel")
    .lean() as { anthropicApiKey?: string; aiModel?: string } | null;

  return NextResponse.json({
    hasApiKey: !!user?.anthropicApiKey,
    aiModel: user?.aiModel || "claude-sonnet-4-6",
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { apiKey, aiModel } = await req.json();

  await dbConnect();

  const update: Record<string, string> = {};
  if (typeof apiKey === "string") {
    update.anthropicApiKey = apiKey; // empty string clears the key
  }
  if (aiModel === "claude-sonnet-4-6" || aiModel === "claude-opus-4-6") {
    update.aiModel = aiModel;
  }

  await User.findByIdAndUpdate(session.user.id, { $set: update });

  return NextResponse.json({ ok: true });
}
