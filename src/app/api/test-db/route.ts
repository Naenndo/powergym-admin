import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conn = await connectDB();
    const dbName = conn.connection.db?.databaseName;
    const userCount = await User.countDocuments();
    const users = await User.find({}, { password: 0 }).limit(5);

    return Response.json({
      connected: true,
      database: dbName,
      userCount,
      users,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 30) + "...",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return Response.json({
      connected: false,
      error: message,
      hasMongoUri: !!process.env.MONGODB_URI,
    });
  }
}
