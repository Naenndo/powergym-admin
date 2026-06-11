import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const payment = await Payment.findById(id).populate("member");
    if (!payment) {
      return Response.json({ error: "Pago no encontrado" }, { status: 404 });
    }
    return Response.json(payment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al buscar pago";
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
    const payment = await Payment.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate("member");
    if (!payment) {
      return Response.json({ error: "Pago no encontrado" }, { status: 404 });
    }
    return Response.json(payment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar pago";
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
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      return Response.json({ error: "Pago no encontrado" }, { status: 404 });
    }
    return Response.json({ message: "Pago eliminado correctamente" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al eliminar pago";
    return Response.json({ error: message }, { status: 500 });
  }
}
