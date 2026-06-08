import mongoose, { Schema, Document } from "mongoose";

export interface IPlan extends Document {
  name: string;
  description: string;
  price: number;
  duration: number;
  durationType: "days" | "months";
  features: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    durationType: {
      type: String,
      enum: ["days", "months"],
      default: "months",
    },
    features: [{ type: String, trim: true }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model<IPlan>("Plan", PlanSchema, "Plans");
