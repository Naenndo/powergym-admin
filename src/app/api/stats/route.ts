import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import Payment from "@/models/Payment";
import Attendance from "@/models/Attendance";
import Plan from "@/models/Plan";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalMembers,
      activeMembers,
      totalPlans,
      monthlyRevenue,
      todayAttendance,
      recentPayments,
      expiringSoon,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: "active" }),
      Plan.countDocuments({ active: true }),
      Payment.aggregate([
        {
          $match: {
            date: { $gte: startOfMonth },
            status: "paid",
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Attendance.countDocuments({
        checkIn: { $gte: startOfDay, $lte: endOfDay },
      }),
      Payment.find()
        .populate("member")
        .sort({ date: -1 })
        .limit(5),
      Member.find({
        status: "active",
        endDate: {
          $gte: now,
          $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      })
        .populate("plan")
        .limit(5),
    ]);

    return Response.json({
      totalMembers,
      activeMembers,
      totalPlans,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      todayAttendance,
      recentPayments,
      expiringSoon,
    });
  } catch {
    return Response.json(
      { error: "Error fetching stats" },
      { status: 500 }
    );
  }
}
