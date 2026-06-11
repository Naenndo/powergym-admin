import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const db = mongoose.connection.db;
    const result = await db!.collection("Attendances").findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: body },
      { returnDocument: "after" }
    );
    if (!result) {
      return Response.json(
        { error: "Attendance not found" },
        { status: 404 }
      );
    }
    return Response.json(result);
  } catch (error: any) {
    console.error("Error updating attendance:", error);
    return Response.json(
      { error: error.message || "Error updating attendance" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const db = mongoose.connection.db;
    const result = await db!.collection("Attendances").findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
    if (!result) {
      return Response.json(
        { error: "Attendance not found" },
        { status: 404 }
      );
    }
    return Response.json({ message: "Attendance deleted" });
  } catch (error: any) {
    console.error("Error deleting attendance:", error);
    return Response.json(
      { error: error.message || "Error deleting attendance" },
      { status: 500 }
    );
  }
}
