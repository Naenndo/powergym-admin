"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface Stats {
  totalMembers: number;
  activeMembers: number;
  totalPlans: number;
  monthlyRevenue: number;
  todayAttendance: number;
  recentPayments: Array<{
    _id: string;
    amount: number;
    concept: string;
    date: string;
    status: string;
    member: { firstName: string; lastName: string } | null;
  }>;
  expiringSoon: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    endDate: string;
    plan: { name: string } | null;
  }>;
}

const revenueData = [
  { name: "Ene", ingresos: 4200 },
  { name: "Feb", ingresos: 5100 },
  { name: "Mar", ingresos: 4800 },
  { name: "Abr", ingresos: 6200 },
  { name: "May", ingresos: 5900 },
  { name: "Jun", ingresos: 7100 },
  { name: "Jul", ingresos: 6800 },
  { name: "Ago", ingresos: 7500 },
  { name: "Sep", ingresos: 8200 },
  { name: "Oct", ingresos: 7800 },
  { name: "Nov", ingresos: 8500 },
  { name: "Dic", ingresos: 9200 },
];

const attendanceData = [
  { name: "Lun", asistencia: 45 },
  { name: "Mar", asistencia: 52 },
  { name: "Mié", asistencia: 48 },
  { name: "Jue", asistencia: 55 },
  { name: "Vie", asistencia: 62 },
  { name: "Sáb", asistencia: 38 },
  { name: "Dom", asistencia: 25 },
];

const newMembersData = [
  { name: "Ene", socios: 12 },
  { name: "Feb", socios: 18 },
  { name: "Mar", socios: 15 },
  { name: "Abr", socios: 22 },
  { name: "May", socios: 19 },
  { name: "Jun", socios: 28 },
  { name: "Jul", socios: 25 },
  { name: "Ago", socios: 30 },
  { name: "Sep", socios: 27 },
  { name: "Oct", socios: 32 },
  { name: "Nov", socios: 35 },
  { name: "Dic", socios: 28 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 border border-white/10">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-white">
          {payload[0].name === "ingresos"
            ? `$${payload[0].value.toLocaleString()}`
            : payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-card rounded-2xl" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-80 bg-card rounded-2xl" />
          <div className="h-80 bg-card rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const safeStats = {
    totalMembers: stats.totalMembers ?? 0,
    activeMembers: stats.activeMembers ?? 0,
    totalPlans: stats.totalPlans ?? 0,
    monthlyRevenue: stats.monthlyRevenue ?? 0,
    todayAttendance: stats.todayAttendance ?? 0,
    recentPayments: stats.recentPayments ?? [],
    expiringSoon: stats.expiringSoon ?? [],
  };

  const kpiCards = [
    {
      title: "Total Socios",
      value: safeStats.totalMembers,
      subtitle: `${safeStats.activeMembers} activos`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-6"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Membresías Activas",
      value: safeStats.activeMembers,
      subtitle: `${safeStats.totalPlans} planes disponibles`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-6"
        >
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Ingresos Mensuales",
      value: `$${safeStats.monthlyRevenue.toLocaleString()}`,
      subtitle: "Este mes",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-6"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: "Asistencia Hoy",
      value: safeStats.todayAttendance,
      subtitle: "Socios presentes",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-6"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      change: "+5%",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-blue p-8 neon-glow-strong">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent/30 blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium mb-2">
              Bienvenido de vuelta
            </p>
            <h1 className="text-3xl font-bold text-white mb-2">
              Panel de Control
            </h1>
            <p className="text-primary-foreground/70 max-w-md">
              Gestiona tu gimnasio de manera eficiente. Aquí tienes un resumen
              de la actividad reciente.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="size-16 text-white/80"
              >
                <path d="m6.5 6.5 11 11" />
                <path d="m21 21-1-1" />
                <path d="m3 3 1 1" />
                <path d="m18 22 4-4" />
                <path d="m2 6 4-4" />
                <path d="m3 10 7-7" />
                <path d="m14 21 7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, index) => (
          <div
            key={card.title}
            className="card-hover bg-card rounded-2xl p-6 relative overflow-hidden group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Top neon line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors duration-300">
                {card.icon}
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                  card.changeType === "positive"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {card.change}
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-medium mb-1">
              {card.title}
            </p>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Ingresos Mensuales
              </h3>
              <p className="text-sm text-muted-foreground">
                Últimos 12 meses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Ingresos</span>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#00B8FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00B8FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#00B8FF"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="bg-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Asistencia Semanal
              </h3>
              <p className="text-sm text-muted-foreground">Esta semana</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-xs text-muted-foreground">Asistencia</span>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="asistencia"
                  fill="#00D4FF"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* New Members Chart */}
        <div className="bg-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Nuevos Socios
              </h3>
              <p className="text-sm text-muted-foreground">Por mes</p>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={newMembersData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="socios"
                  fill="#0090D4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={25}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Pagos Recientes
              </h3>
              <p className="text-sm text-muted-foreground">Últimos 5 pagos</p>
            </div>
            <Link
              href="/pagos"
              className="text-xs text-primary hover:text-accent transition-colors font-medium"
            >
              Ver todos →
            </Link>
          </div>
          <div className="space-y-4">
            {safeStats.recentPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No hay pagos registrados
              </p>
            ) : (
              safeStats.recentPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-4 text-green-400"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {payment.member
                          ? `${payment.member.firstName} ${payment.member.lastName}`
                          : "Socio"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.concept}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-400">
                      +${payment.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Por Vencer
              </h3>
              <p className="text-sm text-muted-foreground">Próximos 7 días</p>
            </div>
            <Link
              href="/socios"
              className="text-xs text-primary hover:text-accent transition-colors font-medium"
            >
              Ver socios →
            </Link>
          </div>
          <div className="space-y-4">
            {safeStats.expiringSoon.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No hay membresías por vencer
              </p>
            ) : (
              safeStats.expiringSoon.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-4 text-red-400"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" x2="12" y1="9" y2="13" />
                        <line x1="12" x2="12.01" y1="17" y2="17" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.plan?.name || "Sin plan"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    {new Date(member.endDate).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
