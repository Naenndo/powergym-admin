import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Member from "@/models/Member";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const attendance = await Attendance.findById(id).populate("member");
    if (!attendance) {
      return Response.json({ error: "Asistencia no encontrada" }, { status: 404 });
    }
    return Response.json(attendance);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al buscar asistencia";
    return Response.json({ error: message }, { status: 500 });
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
    const attendance = await Attendance.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate("member");
    if (!attendance) {
      return Response.json({ error: "Asistencia no encontrada" }, { status: 404 });
    }
    return Response.json(attendance);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar asistencia";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return Response.json({ error: "Asistencia no encontrada" }, { status: 404 });
    }
    return Response.json({ message: "Asistencia eliminada correctamente" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al eliminar asistencia";
    return Response.json({ error: message }, { status: 500 });
  }
}
