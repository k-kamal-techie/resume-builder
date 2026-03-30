export interface KBMetric {
  label: string;
  value: string;
}

export interface KBProfile {
  fullName: string;
  headline: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  bio?: string;
}

export interface KBTimelineEntry {
  type: "role" | "education" | "certification" | "achievement" | "volunteer";
  title: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  highlights: string[];
  skills: string[];
  metrics: KBMetric[];
  tags: string[];
}

export interface KBSkill {
  name: string;
  category: string;
  proficiency: number;
  yearsOfExperience?: number;
  tags: string[];
}

export interface KBProject {
  name: string;
  description: string;
  role?: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
  highlights: string[];
  metrics: KBMetric[];
  tags: string[];
}

export interface KBAchievement {
  title: string;
  description?: string;
  date?: string;
  issuer?: string;
  url?: string;
  tags: string[];
}

export interface KnowledgeBaseData {
  profile: KBProfile;
  timeline: KBTimelineEntry[];
  skills: KBSkill[];
  projects: KBProject[];
  achievements: KBAchievement[];
}

export interface IKnowledgeBase extends KnowledgeBaseData {
  _id: string;
  userId: string;
  updatedAt: string;
  createdAt: string;
}
