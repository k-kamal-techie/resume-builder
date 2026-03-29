export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  description?: string;
}

export interface Experience {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  highlights: string[];
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
  highlights: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  url?: string;
  credentialId?: string;
}

export interface CustomSection {
  title: string;
  items: { heading: string; description: string; date?: string }[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  customSections?: CustomSection[];
}

export type TemplateId = "classic" | "modern" | "minimal";

export interface IResume {
  _id: string;
  userId: string;
  title: string;
  templateId: TemplateId;
  data: ResumeData;
  isPublic: boolean;
  lastEditedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
