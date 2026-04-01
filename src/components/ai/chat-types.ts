import type { ResumeData } from "@/types/resume";
import type { KnowledgeBaseData } from "@/types/knowledge-base";
import { LuBriefcase, LuStar, LuZap, LuUser, LuCheck } from "react-icons/lu";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  appliedData?: boolean;
  appliedKB?: boolean;
  timestamp?: string;
}

export interface ChatPanelProps {
  resumeId: string;
  resumeData: ResumeData;
  knowledgeBase?: KnowledgeBaseData | null;
  jobDescription?: string;
  onApplyResumeData: (data: ResumeData) => void;
  onApplyKBData?: (data: KnowledgeBaseData) => void;
  onSave?: () => void;
  onUpdateJD?: (jd: string) => void;
  initialJd?: string;
}

export const slashCommands = [
  { command: "/tailor",  description: "Tailor resume to saved job description", icon: LuBriefcase },
  { command: "/ats",     description: "Get ATS compatibility score against JD",  icon: LuStar },
  { command: "/improve", description: "Improve bullets with action verbs",        icon: LuZap },
  { command: "/summary", description: "Generate a professional summary",          icon: LuUser },
  { command: "/save",    description: "Save the current resume",                  icon: LuCheck },
  { command: "/jd",      description: "Set or update the job description",        icon: LuBriefcase },
];
