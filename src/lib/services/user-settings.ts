import type { UserSettingsResponse } from "@/types/user-settings";

/**
 * Fetch current user's settings (token is masked).
 */
export async function fetchUserSettings(): Promise<UserSettingsResponse> {
  const res = await fetch("/api/user/settings");
  if (!res.ok) {
    throw new Error(`Failed to fetch settings (${res.status})`);
  }
  return res.json();
}

/**
 * Update user settings. Token is sent as plaintext (encrypted server-side).
 */
export async function updateUserSettings(params: {
  anthropicToken?: string;
  anthropicModel: string;
}): Promise<UserSettingsResponse> {
  const res = await fetch("/api/user/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Failed to update settings (${res.status})`);
  }
  return res.json();
}
