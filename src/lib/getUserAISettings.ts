import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export interface UserAISettings {
  apiKey?: string;
  model: string;
}

export async function getUserAISettings(userId: string): Promise<UserAISettings> {
  await dbConnect();
  const user = await User.findById(userId)
    .select("anthropicApiKey aiModel")
    .lean() as { anthropicApiKey?: string; aiModel?: string } | null;

  return {
    apiKey: user?.anthropicApiKey || undefined,
    model: user?.aiModel || "claude-sonnet-4-6",
  };
}
