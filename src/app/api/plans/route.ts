import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const plans = await Plan.find().sort({ price: 1 });
    return Response.json(plans);
  } catch (error: any) {
    console.error("Error fetching plans:", error);
    return Response.json(
      { error: error.message || "Error fetching plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const plan = await Plan.create(body);
    return Response.json(plan, { status: 201 });
  } catch (error: any) {
    console.error("Error creating plan:", error);
    return Response.json(
      { error: error.message || "Error creating plan" },
      { status: 500 }
    );
  }
}
