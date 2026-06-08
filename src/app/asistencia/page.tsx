"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Attendance {
  _id: string;
  member: Member;
  checkIn: string;
  checkOut: string | null;
}

export default function AsistenciaPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState("");
  const [todayCount, setTodayCount] = useState(0);

  const fetchAttendances = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance?today=true");
      const data = await res.json();
      setAttendances(data);
      setTodayCount(data.length);
    } catch {
      toast.error("Error al cargar asistencia");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members?status=active");
      const data = await res.json();
      setMembers(data);
    } catch {}
  };

  useEffect(() => {
    fetchMembers();
    fetchAttendances();
  }, [fetchAttendances]);

  const handleCheckIn = async () => {
    if (!selectedMember) {
      toast.error("Selecciona un socio");
      return;
    }

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member: selectedMember,
          checkIn: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      toast.success("Check-in registrado");
      setSelectedMember("");
      fetchAttendances();
    } catch {
      toast.error("Error al registrar check-in");
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkOut: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Check-out registrado");
      fetchAttendances();
    } catch {
      toast.error("Error al registrar check-out");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    try {
      const res = await fetch(`/api/attendance/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Registro eliminado");
      fetchAttendances();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "En curso";
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const attendancePercent = members.length > 0
    ? Math.round((todayCount / members.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Asistencia</h1>
        <p className="text-muted-foreground mt-1">
          Control de entrada y salida del gimnasio
        </p>
      </div>

      {/* Check-in Card */}
      <div className="bg-card rounded-2xl p-6 relative overflow-hidden neon-glow">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="absolute inset-0 gradient-blue-soft opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="size-5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" x2="3" y1="12" y2="12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Registrar Entrada</h2>
              <p className="text-sm text-muted-foreground">Selecciona un socio para su check-in</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value ?? "")}
                className="input-dark w-full px-4 py-3 text-sm"
              >
                <option value="">Seleccionar socio...</option>
                {(members ?? []).map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleCheckIn} className="btn-primary px-6 py-3 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" x2="3" y1="12" y2="12" />
              </svg>
              Check-in
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="card-hover bg-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-green-500 to-emerald-500" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7 text-green-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Presentes Hoy</p>
              <p className="text-3xl font-bold text-white">{todayCount}</p>
            </div>
          </div>
        </div>

        <div className="card-hover bg-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7 text-primary">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Socios Activos</p>
              <p className="text-3xl font-bold text-white">{members.length}</p>
            </div>
          </div>
        </div>

        <div className="card-hover bg-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-primary" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7 text-accent">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Asistencia</p>
              <p className="text-3xl font-bold text-white">{attendancePercent}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">Ocupación del día</p>
          <p className="text-sm font-bold text-white">{todayCount}/{members.length}</p>
        </div>
        <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full gradient-blue transition-all duration-1000 ease-out"
            style={{ width: `${attendancePercent}%` }}
          />
        </div>
      </div>

      {/* Today's Attendance */}
      <div className="bg-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Asistencia de Hoy</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {todayCount} socios han ingresado hoy
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <svg className="animate-spin size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando registros...
            </div>
          </div>
        ) : attendances.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-8 text-primary">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-muted-foreground">No hay registros de asistencia hoy</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Socio</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Duración</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(attendances ?? []).map((att) => (
                  <tr key={att._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {att.member
                            ? `${att.member.firstName[0]}${att.member.lastName[0]}`
                            : "?"}
                        </div>
                        <p className="font-medium text-white">
                          {att.member
                            ? `${att.member.firstName} ${att.member.lastName}`
                            : "Socio eliminado"}
                        </p>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm">{formatTime(att.checkIn)}</p>
                    </td>
                    <td>
                      <p className="text-sm text-muted-foreground">
                        {att.checkOut ? formatTime(att.checkOut) : "---"}
                      </p>
                    </td>
                    <td>
                      <p className="text-sm">{getDuration(att.checkIn, att.checkOut)}</p>
                    </td>
                    <td>
                      {att.checkOut ? (
                        <span className="badge-inactive">Salió</span>
                      ) : (
                        <span className="badge-active">Presente</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        {!att.checkOut && (
                          <button
                            onClick={() => handleCheckOut(att._id)}
                            className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" x2="9" y1="12" y2="12" />
                            </svg>
                            Check-out
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(att._id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
