import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { dni: { $regex: search, $options: "i" } },
      ];
    }

    const members = await Member.find(filter)
      .populate("plan")
      .sort({ createdAt: -1 });
    return Response.json(members);
  } catch (error: any) {
    console.error("Error fetching members:", error);
    return Response.json(
      { error: error.message || "Error fetching members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const member = await Member.create(body);
    const populated = await member.populate("plan");
    return Response.json(populated, { status: 201 });
  } catch (error: any) {
    console.error("Error creating member:", error);
    return Response.json(
      { error: error.message || "Error creating member" },
      { status: 500 }
    );
  }
}
