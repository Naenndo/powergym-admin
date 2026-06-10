import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://TU_USUARIO:TU_PASSWORD@TU_CLUSTER.mongodb.net/powergym?retryWrites=true&w=majority";

async function seed() {
  console.log("Conectando a MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Conectado exitosamente");

  const db = mongoose.connection.db!;

  // Limpiar colecciones existentes
  console.log("Limpiando colecciones...");
  await db.collection("Users").deleteMany({});
  await db.collection("Plans").deleteMany({});
  await db.collection("Members").deleteMany({});
  await db.collection("Payments").deleteMany({});
  await db.collection("Attendances").deleteMany({});

  // Crear usuario demo
  console.log("Creando usuario demo...");
  const hashedPassword = await bcrypt.hash("Demo1234", 12);
  const userResult = await db.collection("Users").insertOne({
    email: "demo@demo.com",
    password: hashedPassword,
    name: "Administrador Demo",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("  Usuario demo creado: demo@demo.com / Demo1234");

  // Crear planes
  console.log("Creando planes...");
  const plansResult = await db.collection("Plans").insertMany([
    {
      name: "Básico",
      description: "Acceso a sala de pesas y cardio",
      price: 500,
      duration: 1,
      durationType: "months",
      features: ["Sala de pesas", "Área de cardio", "Lockers"],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Premium",
      description: "Acceso completo a todas las instalaciones",
      price: 900,
      duration: 1,
      durationType: "months",
      features: [
        "Sala de pesas",
        "Área de cardio",
        "Clases grupales",
        "Alberca",
        "Lockers",
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "VIP",
      description: "Todo incluido con servicios premium",
      price: 1500,
      duration: 1,
      durationType: "months",
      features: [
        "Sala de pesas",
        "Área de cardio",
        "Clases grupales",
        "Alberca",
        "Nutriólogo",
        "Estacionamiento",
        "Toallas",
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const planIds = Object.values(plansResult.insertedIds);
  console.log("  3 planes creados");

  // Crear socios de ejemplo
  console.log("Creando socios de ejemplo...");
  const membersResult = await db.collection("Members").insertMany([
    {
      firstName: "Juan",
      lastName: "Pérez García",
      email: "juan@demo.com",
      phone: "3331234567",
      dni: "12345678",
      birthDate: new Date("1995-05-15"),
      gender: "male",
      plan: planIds[1], // Premium
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "active",
      notes: "Socio desde 2024",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      firstName: "María",
      lastName: "López Hernández",
      email: "maria@demo.com",
      phone: "3339876543",
      dni: "87654321",
      birthDate: new Date("1998-08-22"),
      gender: "female",
      plan: planIds[0], // Básico
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "active",
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      firstName: "Carlos",
      lastName: "Ramírez Torres",
      email: "carlos@demo.com",
      phone: "3335551234",
      dni: "11223344",
      birthDate: new Date("1990-12-03"),
      gender: "male",
      plan: planIds[2], // VIP
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "active",
      notes: "Cliente frecuente",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const memberIds = Object.values(membersResult.insertedIds);
  console.log("  3 socios de ejemplo creados");

  // Crear pagos
  console.log("Creando pagos de ejemplo...");
  await db.collection("Payments").insertMany([
    {
      member: memberIds[0],
      amount: 900,
      method: "card",
      concept: "Mensualidad Premium - Junio 2026",
      date: new Date(),
      status: "paid",
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      member: memberIds[1],
      amount: 500,
      method: "cash",
      concept: "Mensualidad Básico - Junio 2026",
      date: new Date(),
      status: "paid",
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      member: memberIds[2],
      amount: 1500,
      method: "transfer",
      concept: "Mensualidad VIP - Junio 2026",
      date: new Date(),
      status: "paid",
      notes: "Transferencia bancaria",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("  3 pagos de ejemplo creados");

  // Crear asistencias de ejemplo
  console.log("Creando asistencias de ejemplo...");
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  await db.collection("Attendances").insertMany([
    {
      member: memberIds[0],
      checkIn: today,
      checkOut: new Date(today.getTime() + 2 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      member: memberIds[1],
      checkIn: new Date(today.getTime() + 30 * 60 * 1000),
      checkOut: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("  2 asistencias de ejemplo creadas");

  console.log("\nSeed completado exitosamente!");
  console.log("Credenciales de demo: demo@demo.com / Demo1234");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
