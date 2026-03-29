import mongoose, { Schema, Document, Types } from "mongoose";

const PersonalInfoSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    location: String,
    website: String,
    linkedin: String,
    github: String,
    summary: String,
  },
  { _id: false }
);

const EducationSchema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: String,
    startDate: { type: String, required: true },
    endDate: String,
    gpa: String,
    description: String,
  },
  { _id: false }
);

const ExperienceSchema = new Schema(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: String,
    startDate: { type: String, required: true },
    endDate: String,
    current: { type: Boolean, default: false },
    highlights: [String],
  },
  { _id: false }
);

const SkillSchema = new Schema(
  {
    category: { type: String, required: true },
    items: [String],
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [String],
    url: String,
    startDate: String,
    endDate: String,
    highlights: [String],
  },
  { _id: false }
);

const CertificationSchema = new Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String, required: true },
    url: String,
    credentialId: String,
  },
  { _id: false }
);

const CustomSectionItemSchema = new Schema(
  {
    heading: { type: String, required: true },
    description: { type: String, required: true },
    date: String,
  },
  { _id: false }
);

const CustomSectionSchema = new Schema(
  {
    title: { type: String, required: true },
    items: [CustomSectionItemSchema],
  },
  { _id: false }
);

const ResumeDataSchema = new Schema(
  {
    personalInfo: { type: PersonalInfoSchema, required: true },
    education: [EducationSchema],
    experience: [ExperienceSchema],
    skills: [SkillSchema],
    projects: [ProjectSchema],
    certifications: [CertificationSchema],
    customSections: [CustomSectionSchema],
  },
  { _id: false }
);

export interface IResumeDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  templateId: string;
  data: {
    personalInfo: {
      fullName: string;
      email: string;
      phone?: string;
      location?: string;
      website?: string;
      linkedin?: string;
      github?: string;
      summary?: string;
    };
    education: Array<{
      institution: string;
      degree: string;
      fieldOfStudy?: string;
      startDate: string;
      endDate?: string;
      gpa?: string;
      description?: string;
    }>;
    experience: Array<{
      company: string;
      position: string;
      location?: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      highlights: string[];
    }>;
    skills: Array<{
      category: string;
      items: string[];
    }>;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      url?: string;
      startDate?: string;
      endDate?: string;
      highlights: string[];
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      url?: string;
      credentialId?: string;
    }>;
    customSections?: Array<{
      title: string;
      items: Array<{ heading: string; description: string; date?: string }>;
    }>;
  };
  isPublic: boolean;
  lastEditedAt: Date;
}

const ResumeSchema = new Schema<IResumeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, default: "Untitled Resume" },
    templateId: {
      type: String,
      required: true,
      default: "classic",
      enum: ["classic", "modern", "minimal"],
    },
    data: { type: ResumeDataSchema, required: true },
    isPublic: { type: Boolean, default: false },
    lastEditedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Resume ||
  mongoose.model<IResumeDocument>("Resume", ResumeSchema);
