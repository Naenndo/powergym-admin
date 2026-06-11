import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const plan = await Plan.findById(id);
    if (!plan) {
      return Response.json({ error: "Plan no encontrado" }, { status: 404 });
    }
    return Response.json(plan);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al buscar plan";
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
    const plan = await Plan.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return Response.json({ error: "Plan no encontrado" }, { status: 404 });
    }
    return Response.json(plan);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar plan";
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
    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) {
      return Response.json({ error: "Plan no encontrado" }, { status: 404 });
    }
    return Response.json({ message: "Plan eliminado correctamente" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al eliminar plan";
    return Response.json({ error: message }, { status: 500 });
  }
}
