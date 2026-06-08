import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const db = mongoose.connection.db;
    const member = await db!.collection("Members").findOne({ _id: id as any });
    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }
    return Response.json(member);
  } catch (error: any) {
    console.error("Error fetching member:", error);
    return Response.json(
      { error: error.message || "Error fetching member" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const db = mongoose.connection.db;
    const result = await db!.collection("Members").findOneAndUpdate(
      { _id: id as any },
      { $set: body },
      { returnDocument: "after" }
    );
    if (!result) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }
    return Response.json(result);
  } catch (error: any) {
    console.error("Error updating member:", error);
    return Response.json(
      { error: error.message || "Error updating member" },
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
    const result = await db!.collection("Members").findOneAndDelete({ _id: id as any });
    if (!result) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }
    return Response.json({ message: "Member deleted" });
  } catch (error: any) {
    console.error("Error deleting member:", error);
    return Response.json(
      { error: error.message || "Error deleting member" },
      { status: 500 }
    );
  }
}
