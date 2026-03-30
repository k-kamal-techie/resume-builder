import type { ResumeData, TemplateId, IResume } from "@/types/resume";

/**
 * Fetch all resumes for the current user.
 */
export async function fetchResumes(): Promise<IResume[]> {
  const res = await fetch("/api/resumes");
  if (!res.ok) {
    throw new Error(`Failed to fetch resumes (${res.status})`);
  }
  return res.json();
}

/**
 * Fetch a single resume by ID.
 * Returns null if not found or unauthorized.
 */
export async function fetchResume(id: string): Promise<IResume | null> {
  const res = await fetch(`/api/resumes/${id}`);
  if (!res.ok) return null;
  return res.json();
}

/**
 * Create a new resume.
 */
export async function createResume(params: {
  title: string;
  templateId: TemplateId;
}): Promise<IResume> {
  const res = await fetch("/api/resumes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `Failed to create resume (${res.status})`);
  }
  return res.json();
}

/**
 * Update a resume's title, template, or data.
 */
export async function updateResume(
  id: string,
  params: {
    title?: string;
    templateId?: TemplateId;
    data?: ResumeData;
    jobDescription?: string;
  }
): Promise<IResume> {
  const res = await fetch(`/api/resumes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error || `Failed to update resume (${res.status})`);
  }
  return res.json();
}

/**
 * Delete a resume by ID.
 */
export async function deleteResume(id: string): Promise<void> {
  const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Failed to delete resume (${res.status})`);
  }
}
