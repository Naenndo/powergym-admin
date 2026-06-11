import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
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
    const payment = await db!.collection("Payments").findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!payment) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }
    return Response.json(payment);
  } catch (error: any) {
    console.error("Error fetching payment:", error);
    return Response.json(
      { error: error.message || "Error fetching payment" },
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
    const result = await db!.collection("Payments").findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: body },
      { returnDocument: "after" }
    );
    if (!result) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }
    return Response.json(result);
  } catch (error: any) {
    console.error("Error updating payment:", error);
    return Response.json(
      { error: error.message || "Error updating payment" },
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
    const result = await db!.collection("Payments").findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
    if (!result) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }
    return Response.json({ message: "Payment deleted" });
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    return Response.json(
      { error: error.message || "Error deleting payment" },
      { status: 500 }
    );
  }
}
