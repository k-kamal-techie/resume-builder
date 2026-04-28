import type {
  KnowledgeBaseData,
  IKnowledgeBase,
  KBTimelineEntry,
  KBSkill,
  KBProject,
  KBAchievement,
  KBMetric,
} from "@/types/knowledge-base";

const URL_RE = /^https?:\/\/[^\s]+$/i;

const VALID_TIMELINE_TYPES: ReadonlyArray<KBTimelineEntry["type"]> = [
  "role",
  "education",
  "certification",
  "achievement",
  "volunteer",
];

function cleanUrl(v: unknown): string {
  if (typeof v !== "string") return "";
  const trimmed = v.trim();
  if (!trimmed) return "";
  return URL_RE.test(trimmed) ? trimmed : "";
}

function cleanString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed || undefined;
}

function nonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed || null;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim() !== "");
}

function asMetricArray(v: unknown): KBMetric[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((m) => {
      if (!m || typeof m !== "object") return null;
      const obj = m as Record<string, unknown>;
      const label = nonEmptyString(obj.label);
      const value = nonEmptyString(obj.value);
      if (!label || !value) return null;
      return { label, value };
    })
    .filter((m): m is KBMetric => m !== null);
}

/**
 * Sanitize AI-emitted KB payload before posting to the validation endpoint.
 * The AI sometimes emits arrays of strings (instead of objects), null/missing
 * URL fields, or entries with missing required fields. Coerce, fill defaults,
 * and drop entries that can't be repaired so the whole update doesn't fail.
 */
export function sanitizeKBData(data: KnowledgeBaseData): KnowledgeBaseData {
  const profile = data.profile ?? ({} as KnowledgeBaseData["profile"]);

  const timeline: KBTimelineEntry[] = (Array.isArray(data.timeline) ? data.timeline : [])
    .map((raw): KBTimelineEntry | null => {
      if (!raw || typeof raw !== "object") return null;
      const t = raw as Partial<KBTimelineEntry> & Record<string, unknown>;
      const title = nonEmptyString(t.title);
      const organization = nonEmptyString(t.organization);
      const startDate = nonEmptyString(t.startDate);
      if (!title || !organization || !startDate) return null;
      const type: KBTimelineEntry["type"] = VALID_TIMELINE_TYPES.includes(
        t.type as KBTimelineEntry["type"],
      )
        ? (t.type as KBTimelineEntry["type"])
        : "role";
      return {
        type,
        title,
        organization,
        location: cleanString(t.location),
        startDate,
        endDate: cleanString(t.endDate),
        current: Boolean(t.current),
        description: cleanString(t.description),
        highlights: asStringArray(t.highlights),
        skills: asStringArray(t.skills),
        metrics: asMetricArray(t.metrics),
        tags: asStringArray(t.tags),
      };
    })
    .filter((t): t is KBTimelineEntry => t !== null);

  const skills: KBSkill[] = (Array.isArray(data.skills) ? data.skills : [])
    .map((raw): KBSkill | null => {
      if (!raw || typeof raw !== "object") return null;
      const s = raw as Partial<KBSkill> & Record<string, unknown>;
      const name = nonEmptyString(s.name);
      const category = nonEmptyString(s.category);
      if (!name || !category) return null;
      const profRaw = Number(s.proficiency);
      const proficiency = Number.isFinite(profRaw)
        ? Math.max(0, Math.min(100, profRaw))
        : 50;
      const yoeRaw = Number(s.yearsOfExperience);
      return {
        name,
        category,
        proficiency,
        yearsOfExperience:
          s.yearsOfExperience !== undefined && Number.isFinite(yoeRaw)
            ? yoeRaw
            : undefined,
        tags: asStringArray(s.tags),
      };
    })
    .filter((s): s is KBSkill => s !== null);

  const projects: KBProject[] = (Array.isArray(data.projects) ? data.projects : [])
    .map((raw): KBProject | null => {
      if (!raw || typeof raw !== "object") return null;
      const p = raw as Partial<KBProject> & Record<string, unknown>;
      const name = nonEmptyString(p.name);
      const description = nonEmptyString(p.description);
      if (!name || !description) return null;
      return {
        name,
        description,
        role: cleanString(p.role),
        technologies: asStringArray(p.technologies),
        url: cleanUrl(p.url),
        startDate: cleanString(p.startDate),
        endDate: cleanString(p.endDate),
        highlights: asStringArray(p.highlights),
        metrics: asMetricArray(p.metrics),
        tags: asStringArray(p.tags),
      };
    })
    .filter((p): p is KBProject => p !== null);

  const achievements: KBAchievement[] = (Array.isArray(data.achievements) ? data.achievements : [])
    .map((raw): KBAchievement | null => {
      if (!raw || typeof raw !== "object") return null;
      const a = raw as Partial<KBAchievement> & Record<string, unknown>;
      const title = nonEmptyString(a.title);
      if (!title) return null;
      return {
        title,
        description: cleanString(a.description),
        date: cleanString(a.date),
        issuer: cleanString(a.issuer),
        url: cleanUrl(a.url),
        tags: asStringArray(a.tags),
      };
    })
    .filter((a): a is KBAchievement => a !== null);

  return {
    profile: {
      fullName: nonEmptyString(profile.fullName) ?? "Your Name",
      headline: typeof profile.headline === "string" ? profile.headline : "",
      email: nonEmptyString(profile.email) ?? "",
      phone: cleanString(profile.phone),
      location: cleanString(profile.location),
      website: cleanUrl(profile.website),
      linkedin: cleanUrl(profile.linkedin),
      github: cleanUrl(profile.github),
      bio: cleanString(profile.bio),
    },
    timeline,
    skills,
    projects,
    achievements,
  };
}

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
  const sanitized = sanitizeKBData(data);
  const res = await fetch("/api/knowledge-base", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sanitized),
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      if (body?.details) detail = ` — ${JSON.stringify(body.details)}`;
      else if (body?.error) detail = ` — ${body.error}`;
    } catch { /* response not JSON */ }
    throw new Error(`Failed to update knowledge base (${res.status})${detail}`);
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
