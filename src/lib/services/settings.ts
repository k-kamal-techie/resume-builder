export interface AISettings {
  hasApiKey: boolean;
  aiModel: string;
}

export async function getAISettings(): Promise<AISettings> {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function saveAISettings(settings: {
  apiKey?: string;
  aiModel?: string;
}): Promise<void> {
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to save settings");
}
