import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  anthropicApiKey?: string;
  aiModel?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date },
    image: { type: String },
    anthropicApiKey: { type: String, select: false }, // excluded from default queries
    aiModel: { type: String, default: "claude-sonnet-4-6" },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
