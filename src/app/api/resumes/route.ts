import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import dbConnect from "@/lib/mongoose";
import Resume from "@/models/Resume";
import { createResumeSchema } from "@/lib/validations/resume";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const resumes = await Resume.find({ userId: session.user.id })
      .sort({ lastEditedAt: -1 })
      .lean();

    return NextResponse.json(resumes);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createResumeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await dbConnect();
    const resume = await Resume.create({
      userId: session.user.id,
      title: parsed.data.title,
      templateId: parsed.data.templateId,
      data: parsed.data.data || {
        personalInfo: {
          fullName: session.user.name || "Your Name",
          email: session.user.email || "you@example.com",
        },
        education: [],
        experience: [],
        skills: [],
        projects: [],
        certifications: [],
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }
}
