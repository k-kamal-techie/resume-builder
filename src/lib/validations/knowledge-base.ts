import { z } from "zod";

const metricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const profileSchema = z.object({
  fullName: z.string().min(1),
  headline: z.string().default(""),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
});

const timelineEntrySchema = z.object({
  type: z.enum(["role", "education", "certification", "achievement", "volunteer"]),
  title: z.string().min(1),
  organization: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  metrics: z.array(metricSchema).default([]),
  tags: z.array(z.string()).default([]),
});

const skillSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  proficiency: z.coerce.number().min(0).max(100).default(50),
  yearsOfExperience: z.coerce.number().optional(),
  tags: z.array(z.string()).default([]),
});

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  role: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  url: z.string().url().optional().or(z.literal("")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  metrics: z.array(metricSchema).default([]),
  tags: z.array(z.string()).default([]),
});

const achievementSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().optional(),
  issuer: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
});

export const knowledgeBaseSchema = z.object({
  profile: profileSchema,
  timeline: z.array(timelineEntrySchema).default([]),
  skills: z.array(skillSchema).default([]),
  projects: z.array(projectSchema).default([]),
  achievements: z.array(achievementSchema).default([]),
});

export const updateKnowledgeBaseSchema = knowledgeBaseSchema.partial();
