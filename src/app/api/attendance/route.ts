import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("member");
    const today = searchParams.get("today");

    const filter: Record<string, unknown> = {};

    if (memberId) {
      filter.member = memberId;
    }

    if (today === "true") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      filter.checkIn = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendances = await Attendance.find(filter)
      .populate("member")
      .sort({ checkIn: -1 });
    return Response.json(attendances);
  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return Response.json(
      { error: error.message || "Error fetching attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const attendance = await Attendance.create(body);
    const populated = await attendance.populate("member");
    return Response.json(populated, { status: 201 });
  } catch (error: any) {
    console.error("Error creating attendance:", error);
    return Response.json(
      { error: error.message || "Error creating attendance" },
      { status: 500 }
    );
  }
}
