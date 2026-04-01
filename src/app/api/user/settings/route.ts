import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import dbConnect from "@/lib/mongoose";
import UserSettings from "@/models/UserSettings";
import { encrypt, decrypt } from "@/lib/encryption";
import { updateUserSettingsSchema } from "@/lib/validations/user-settings";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const settings = await UserSettings.findOne({ userId: session.user.id }).lean();

    if (!settings || !settings.anthropicToken) {
      return NextResponse.json({
        hasToken: false,
        anthropicModel: settings?.anthropicModel || "claude-sonnet-4-6",
        tokenPreview: "",
      });
    }

    let tokenPreview = "";
    try {
      const decrypted = decrypt(settings.anthropicToken);
      tokenPreview =
        decrypted.length > 4 ? "..." + decrypted.slice(-4) : "****";
    } catch {
      tokenPreview = "(invalid)";
    }

    return NextResponse.json({
      hasToken: true,
      anthropicModel: settings.anthropicModel,
      tokenPreview,
    });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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
    const parsed = updateUserSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await dbConnect();

    const update: Record<string, unknown> = {
      anthropicModel: parsed.data.anthropicModel,
    };

    // Only update token if provided (allows changing model without re-entering token)
    if (parsed.data.anthropicToken !== undefined) {
      update.anthropicToken = parsed.data.anthropicToken
        ? encrypt(parsed.data.anthropicToken)
        : "";
    }

    await UserSettings.findOneAndUpdate(
      { userId: session.user.id },
      update,
      { upsert: true, new: true }
    );

    let tokenPreview = "";
    if (parsed.data.anthropicToken) {
      tokenPreview =
        parsed.data.anthropicToken.length > 4
          ? "..." + parsed.data.anthropicToken.slice(-4)
          : "****";
    }

    return NextResponse.json({
      hasToken: !!parsed.data.anthropicToken,
      anthropicModel: parsed.data.anthropicModel,
      tokenPreview,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
