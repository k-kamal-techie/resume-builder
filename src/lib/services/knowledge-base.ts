import type { KnowledgeBaseData, IKnowledgeBase } from "@/types/knowledge-base";

/**
 * Fetch the current user's knowledge base.
 * Auto-creates an empty KB if none exists.
 */
export async function fetchKnowledgeBase(): Promise<IKnowledgeBase> {
  const res = await fetch("/api/knowledge-base");
  if (!res.ok) {
    throw new Error(`Failed to fetch knowledge base (${res.status})`);
  }
  return res.json();
}

/**
 * Update the current user's knowledge base.
 * Returns the updated KB document.
 */
export async function updateKnowledgeBase(
  data: KnowledgeBaseData
): Promise<IKnowledgeBase> {
  const res = await fetch("/api/knowledge-base", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to update knowledge base (${res.status})`);
  }
  return res.json();
}

/**
 * Extract only the data fields from a full KB document (strip _id, userId, timestamps).
 */
export function extractKBData(kb: IKnowledgeBase): KnowledgeBaseData {
  return {
    profile: kb.profile,
    timeline: kb.timeline,
    skills: kb.skills,
    projects: kb.projects,
    achievements: kb.achievements,
  };
}
