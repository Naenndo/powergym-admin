import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import Plan from "@/models/Plan";
import mongoose from "mongoose";

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

    const updateData: Record<string, unknown> = {};
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.dni !== undefined) updateData.dni = body.dni;
    if (body.birthDate !== undefined) updateData.birthDate = body.birthDate;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.endDate !== undefined) updateData.endDate = body.endDate;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    if (body.plan && body.plan !== "" && mongoose.Types.ObjectId.isValid(body.plan)) {
      updateData.plan = new mongoose.Types.ObjectId(body.plan);
    }

    const member = await Member.findByIdAndUpdate(id, updateData, {
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
