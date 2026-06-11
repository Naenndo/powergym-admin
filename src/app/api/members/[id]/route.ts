import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const member = await Member.findById(id).populate("plan");
    if (!member) {
      return Response.json({ error: "Socio no encontrado" }, { status: 404 });
    }
    return Response.json(member);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al buscar socio";
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
    const member = await Member.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate("plan");
    if (!member) {
      return Response.json({ error: "Socio no encontrado" }, { status: 404 });
    }
    return Response.json(member);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar socio";
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
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      return Response.json({ error: "Socio no encontrado" }, { status: 404 });
    }
    return Response.json({ message: "Socio eliminado correctamente" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al eliminar socio";
    return Response.json({ error: message }, { status: 500 });
  }
}
