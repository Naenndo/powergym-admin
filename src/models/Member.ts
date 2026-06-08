import mongoose, { Schema, Document } from "mongoose";

export interface IMember extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  birthDate: Date;
  gender: "male" | "female" | "other";
  plan: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: "active" | "inactive" | "suspended";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    dni: { type: String, required: true, trim: true, unique: true },
    birthDate: { type: Date, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Member ||
  mongoose.model<IMember>("Member", MemberSchema, "Members");
