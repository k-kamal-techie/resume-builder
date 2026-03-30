import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  summary: z.string().optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  description: z.string().optional(),
});

export const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  highlights: z.array(z.string()).default([]),
});

export const skillSchema = z.object({
  category: z.string().min(1, "Category is required"),
  items: z.array(z.string()).min(1, "At least one skill is required"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  technologies: z.array(z.string()).default([]),
  url: z.string().url().optional().or(z.literal("")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

export const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  date: z.string().min(1, "Date is required"),
  url: z.string().url().optional().or(z.literal("")),
  credentialId: z.string().optional(),
});

export const resumeDataSchema = z.object({
  personalInfo: personalInfoSchema,
  education: z.array(educationSchema).default([]),
  experience: z.array(experienceSchema).default([]),
  skills: z.array(skillSchema).default([]),
  projects: z.array(projectSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
});

export const createResumeSchema = z.object({
  title: z.string().min(1, "Title is required").default("Untitled Resume"),
  templateId: z.enum(["classic", "modern", "minimal"]).default("classic"),
  data: resumeDataSchema.optional(),
});

// Lenient schema for updates — accepts AI-generated data with any shape
export const updateResumeSchema = z.object({
  title: z.string().min(1).optional(),
  templateId: z.enum(["classic", "modern", "minimal"]).optional(),
  data: z.any().optional(),
  jobDescription: z.string().optional(),
  isPublic: z.boolean().optional(),
});
