import { z } from "zod";

export const updateUserSettingsSchema = z.object({
  anthropicToken: z.string().optional(),
  anthropicModel: z.string().min(1).default("claude-sonnet-4-6"),
});
