import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  member: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    checkIn: { type: Date, required: true, default: Date.now },
    checkOut: { type: Date, default: null },
  },
  { timestamps: true }
);

AttendanceSchema.index({ member: 1, checkIn: -1 });
AttendanceSchema.index({ checkIn: 1 });

export default mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema, "Attendances");
