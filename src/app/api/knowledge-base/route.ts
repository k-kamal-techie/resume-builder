import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import dbConnect from "@/lib/mongoose";
import KnowledgeBase from "@/models/KnowledgeBase";
import { knowledgeBaseSchema } from "@/lib/validations/knowledge-base";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    let kb = await KnowledgeBase.findOne({ userId: session.user.id }).lean();

    // Auto-create empty KB if none exists
    if (!kb) {
      kb = await KnowledgeBase.create({
        userId: session.user.id,
        profile: {
          fullName: session.user.name || "Your Name",
          headline: "",
          email: session.user.email || "",
        },
        timeline: [],
        skills: [],
        projects: [],
        achievements: [],
      });
      kb = kb.toObject();
    }

    return NextResponse.json(kb);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch knowledge base" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = knowledgeBaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await dbConnect();
    const kb = await KnowledgeBase.findOneAndUpdate(
      { userId: session.user.id },
      { ...parsed.data },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json(kb);
  } catch {
    return NextResponse.json(
      { error: "Failed to update knowledge base" },
      { status: 500 }
    );
  }
}
