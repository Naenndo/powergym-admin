import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const user = await User.findOne({ email: "demo@demo.com" });

    if (!user) {
      return Response.json({ found: false, message: "Usuario no encontrado" });
    }

    const testPassword = "Demo1234";
    const isMatch = await bcrypt.compare(testPassword, user.password);

    return Response.json({
      found: true,
      email: user.email,
      passwordHash: user.password.substring(0, 20) + "...",
      passwordValid: isMatch,
      testPassword,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return Response.json({ error: message });
  }
}
