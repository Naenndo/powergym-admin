import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Member from "@/models/Member";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const memberId = searchParams.get("member");

    const filter: Record<string, unknown> = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (memberId) {
      filter.member = memberId;
    }

    const payments = await Payment.find(filter)
      .populate("member")
      .sort({ date: -1 });
    return Response.json(payments);
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return Response.json(
      { error: error.message || "Error fetching payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const payment = await Payment.create(body);
    const populated = await payment.populate("member");
    return Response.json(populated, { status: 201 });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return Response.json(
      { error: error.message || "Error creating payment" },
      { status: 500 }
    );
  }
}
