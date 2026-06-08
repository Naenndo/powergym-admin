import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  member: mongoose.Types.ObjectId;
  amount: number;
  method: "cash" | "card" | "transfer" | "other";
  concept: string;
  date: Date;
  status: "paid" | "pending" | "overdue";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["cash", "card", "transfer", "other"],
      default: "cash",
    },
    concept: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "paid",
    },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema, "Payments");
