import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    console.log("GET Plan ID:", id, "Type:", typeof id);
    
    // Try using native MongoDB driver
    const db = mongoose.connection.db;
    const plan = await db!.collection("Plans").findOne({ _id: new mongoose.Types.ObjectId(id) });
    console.log("Found plan:", plan ? plan.name : "NOT FOUND");
    
    if (!plan) {
      return Response.json({ error: "Plan not found" }, { status: 404 });
    }
    return Response.json(plan);
  } catch (error: any) {
    console.error("Error fetching plan:", error);
    return Response.json(
      { error: error.message || "Error fetching plan" },
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
    console.log("PUT Plan ID:", id, "Body:", body);
    
    // Try using native MongoDB driver
    const db = mongoose.connection.db;
    const result = await db!.collection("Plans").findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: body },
      { returnDocument: "after" }
    );
    console.log("Update result:", result ? result.name : "FAILED");
    
    if (!result) {
      return Response.json({ error: "Plan not found" }, { status: 404 });
    }
    return Response.json(result);
  } catch (error: any) {
    console.error("Error updating plan:", error);
    return Response.json(
      { error: error.message || "Error updating plan" },
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
    
    // Try using native MongoDB driver
    const db = mongoose.connection.db;
    const result = await db!.collection("Plans").findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
    
    if (!result) {
      return Response.json({ error: "Plan not found" }, { status: 404 });
    }
    return Response.json({ message: "Plan deleted" });
  } catch (error: any) {
    console.error("Error deleting plan:", error);
    return Response.json(
      { error: error.message || "Error deleting plan" },
      { status: 500 }
    );
  }
}
