import type { ResumeData } from "@/types/resume";
import type { KnowledgeBaseData } from "@/types/knowledge-base";

export function extractResumeUpdate(content: string): ResumeData | null {
  const m = content.match(/```(?:resume-json|json)\s*([\s\S]*?)```/);
  if (!m) return null;
  try {
    const p = JSON.parse(m[1]);
    if (p?.personalInfo) return p as ResumeData;
  } catch { /* invalid */ }
  return null;
}

export function extractKBUpdate(content: string): KnowledgeBaseData | null {
  const m = content.match(/```kb-json\s*([\s\S]*?)```/);
  if (!m) return null;
  try {
    const p = JSON.parse(m[1]);
    if (p?.profile) return p as KnowledgeBaseData;
  } catch { /* invalid */ }
  return null;
}

export function formatTime(ts?: string) {
  if (!ts) return "";
  try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

export function formatDate(ts: string) {
  try {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}

export function formatTailorResult(result: Record<string, unknown>): string {
  if (result.content) return result.content as string;
  let text = `## Resume Tailoring Results\n\n**Match Score:** ${result.matchScore}/100\n\n`;
  if (result.tailoredSummary) text += `### Tailored Summary\n${result.tailoredSummary}\n\n`;
  if (Array.isArray(result.suggestions)) {
    text += `### Suggestions\n`;
    for (const s of result.suggestions as Array<{ section: string; suggested: string; reason: string }>)
      text += `- **${s.section}**: ${s.suggested} _(${s.reason})_\n`;
  }
  if (Array.isArray(result.missingKeywords) && result.missingKeywords.length)
    text += `\n### Missing Keywords\n${(result.missingKeywords as string[]).join(", ")}`;
  return text;
}

export function formatAtsResult(result: Record<string, unknown>): string {
  if (result.content) return result.content as string;
  let text = `## ATS Compatibility Score\n\n**Overall: ${result.overall}/100**\n\n`;
  text += `| Category | Score |\n|---|---|\n`;
  text += `| Keyword Match | ${result.keywordMatch}/100 |\n`;
  text += `| Skills Alignment | ${result.skillsAlignment}/100 |\n`;
  text += `| Format | ${result.formatCompatibility}/100 |\n`;
  text += `| Content Relevance | ${result.contentRelevance}/100 |\n\n`;
  if (Array.isArray(result.suggestions)) {
    text += `### Improvements\n`;
    for (const s of result.suggestions as string[]) text += `- ${s}\n`;
  }
  if (Array.isArray(result.missingKeywords) && result.missingKeywords.length)
    text += `\n### Missing Keywords\n${(result.missingKeywords as string[]).join(", ")}`;
  return text;
}
