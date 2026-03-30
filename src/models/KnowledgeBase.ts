import mongoose, { Schema, Document, Types } from "mongoose";

const MetricSchema = new Schema(
  { label: { type: String, required: true }, value: { type: String, required: true } },
  { _id: false }
);

const ProfileSchema = new Schema(
  {
    fullName: { type: String, required: true },
    headline: { type: String, default: "" },
    email: { type: String, required: true },
    phone: String,
    location: String,
    website: String,
    linkedin: String,
    github: String,
    bio: String,
  },
  { _id: false }
);

const TimelineEntrySchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["role", "education", "certification", "achievement", "volunteer"],
    },
    title: { type: String, required: true },
    organization: { type: String, required: true },
    location: String,
    startDate: { type: String, required: true },
    endDate: String,
    current: { type: Boolean, default: false },
    description: String,
    highlights: [String],
    skills: [String],
    metrics: [MetricSchema],
    tags: [String],
  },
  { _id: false }
);

const SkillSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    proficiency: { type: Number, default: 50, min: 0, max: 100 },
    yearsOfExperience: Number,
    tags: [String],
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    role: String,
    technologies: [String],
    url: String,
    startDate: String,
    endDate: String,
    highlights: [String],
    metrics: [MetricSchema],
    tags: [String],
  },
  { _id: false }
);

const AchievementSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: String,
    issuer: String,
    url: String,
    tags: [String],
  },
  { _id: false }
);

export interface IKnowledgeBaseDocument extends Document {
  userId: Types.ObjectId;
  profile: {
    fullName: string;
    headline: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    bio?: string;
  };
  timeline: Array<{
    type: string;
    title: string;
    organization: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
    highlights: string[];
    skills: string[];
    metrics: Array<{ label: string; value: string }>;
    tags: string[];
  }>;
  skills: Array<{
    name: string;
    category: string;
    proficiency: number;
    yearsOfExperience?: number;
    tags: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    role?: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
    highlights: string[];
    metrics: Array<{ label: string; value: string }>;
    tags: string[];
  }>;
  achievements: Array<{
    title: string;
    description?: string;
    date?: string;
    issuer?: string;
    url?: string;
    tags: string[];
  }>;
}

const KnowledgeBaseSchema = new Schema<IKnowledgeBaseDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    profile: { type: ProfileSchema, required: true },
    timeline: [TimelineEntrySchema],
    skills: [SkillSchema],
    projects: [ProjectSchema],
    achievements: [AchievementSchema],
  },
  { timestamps: true }
);

export default mongoose.models.KnowledgeBase ||
  mongoose.model<IKnowledgeBaseDocument>("KnowledgeBase", KnowledgeBaseSchema);
