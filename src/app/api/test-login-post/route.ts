import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const email = "demo@demo.com";
    const password = "Demo1234";

    // Paso 1: Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ step: "findUser", success: false, message: "Usuario no encontrado" });
    }

    // Paso 2: Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ step: "verifyPassword", success: false, message: "Contraseña incorrecta" });
    }

    // Paso 3: Generar JWT
    const JWT_SECRET = process.env.JWT_SECRET || "powergym-secret-key-2026";
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    return Response.json({
      step: "complete",
      success: true,
      message: "Login exitoso",
      user: { id: user._id, email: user.email, name: user.name },
      token: token.substring(0, 30) + "...",
      hasJwtSecret: !!process.env.JWT_SECRET,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return Response.json({ step: "error", success: false, error: message });
  }
}
