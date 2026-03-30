import type { ResumeData } from "@/types/resume";

/**
 * Send a streaming chat message to the AI.
 * Returns the raw Response for SSE streaming.
 */
export async function sendChatMessage(params: {
  message: string;
  resumeId: string;
  history: Array<{ role: string; content: string }>;
}): Promise<Response> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`AI chat error (${res.status}): ${errBody.slice(0, 200)}`);
  }
  return res;
}

/**
 * Tailor a resume to a job description.
 */
export async function tailorResume(params: {
  jobDescription: string;
  resumeData: ResumeData;
}): Promise<Record<string, unknown>> {
  const res = await fetch("/api/ai/tailor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Tailor request failed (${res.status})`);
  }
  return res.json();
}

/**
 * Get ATS compatibility score for a resume.
 */
export async function getAtsScore(params: {
  jobDescription: string;
  resumeData: ResumeData;
}): Promise<Record<string, unknown>> {
  const res = await fetch("/api/ai/ats-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`ATS score request failed (${res.status})`);
  }
  return res.json();
}

/**
 * Generate resume content (bullets, summary, improvements, skills).
 */
export async function generateContent(params: {
  type: "bullets" | "summary" | "improve" | "skills";
  input: string;
  context?: string;
}): Promise<Record<string, unknown>> {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Generate request failed (${res.status})`);
  }
  return res.json();
}
