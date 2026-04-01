import dbConnect from "@/lib/mongoose";
import UserSettings from "@/models/UserSettings";
import { decrypt } from "@/lib/encryption";

export interface UserAnthropicConfig {
  token: string;
  model: string;
}

export class NoTokenConfiguredError extends Error {
  constructor() {
    super("NO_API_TOKEN_CONFIGURED");
    this.name = "NoTokenConfiguredError";
  }
}

/**
 * Fetch and decrypt the user's Anthropic API credentials.
 * Falls back to env vars if no user settings exist.
 * Throws NoTokenConfiguredError if neither source provides a token.
 */
export async function getUserAnthropicConfig(userId: string): Promise<UserAnthropicConfig> {
  await dbConnect();
  const settings = await UserSettings.findOne({ userId }).lean();

  if (settings?.anthropicToken) {
    return {
      token: decrypt(settings.anthropicToken),
      model: settings.anthropicModel || "claude-sonnet-4-6",
    };
  }

  // Fallback to environment variables
  const envToken = process.env.ANTHROPIC_OAUTH_TOKEN;
  if (envToken) {
    return {
      token: envToken,
      model: process.env.ANTHROPIC_MODEL || "claude-opus-4-6",
    };
  }

  throw new NoTokenConfiguredError();
}
