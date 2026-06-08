"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: number;
  durationType: string;
}

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  birthDate: string;
  gender: "male" | "female" | "other";
  plan: Plan;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "suspended";
  notes: string;
}

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dni: "",
  birthDate: "",
  gender: "male" as "male" | "female" | "other",
  plan: "",
  startDate: "",
  endDate: "",
  notes: "",
};

export default function SociosPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchMembers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/members?${params}`);
      const data = await res.json();
      setMembers(data);
    } catch {
      toast.error("Error al cargar socios");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();
      setPlans(data);
    } catch {}
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...form, plan: form.plan };

      if (editing) {
        const res = await fetch(`/api/members/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Socio actualizado");
      } else {
        const res = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Socio creado");
      }

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      fetchMembers();
    } catch {
      toast.error(editing ? "Error al actualizar" : "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (member: Member) => {
    setEditing(member);
    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      dni: member.dni,
      birthDate: member.birthDate.split("T")[0],
      gender: member.gender,
      plan: member.plan?._id || "",
      startDate: member.startDate.split("T")[0],
      endDate: member.endDate.split("T")[0],
      notes: member.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este socio?")) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Socio eliminado");
      fetchMembers();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "active" | "inactive" | "suspended"
  ) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Estado actualizado");
      fetchMembers();
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const openCreateDialog = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const statusBadge = (status: string) => {
    const classes: Record<string, string> = {
      active: "badge-active",
      inactive: "badge-inactive",
      suspended: "badge-suspended",
    };
    const labels: Record<string, string> = {
      active: "Activo",
      inactive: "Inactivo",
      suspended: "Suspendido",
    };
    return <span className={classes[status]}>{labels[status]}</span>;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-primary to-accent",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Socios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los miembros del gimnasio
          </p>
        </div>
        <button onClick={openCreateDialog} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo Socio
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-4 flex gap-4">
        <div className="flex-1 relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, email o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-dark px-4 py-2.5 text-sm min-w-[140px]"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="suspended">Suspendidos</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="bg-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Lista de Socios</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {members.length} socios encontrados
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <svg
                className="animate-spin size-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Cargando socios...
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-8 text-primary"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-muted-foreground mb-4">No hay socios registrados</p>
            <button onClick={openCreateDialog} className="btn-secondary px-4 py-2 text-sm">
              Crear primer socio
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Socio</th>
                  <th>Contacto</th>
                  <th>Plan</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(members ?? []).map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(member.firstName)} flex items-center justify-center text-xs font-bold text-white`}
                        >
                          {getInitials(member.firstName, member.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            DNI: {member.dni}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm">{member.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.phone}
                      </p>
                    </td>
                    <td>
                      <p className="text-sm font-medium">
                        {member.plan?.name || "Sin plan"}
                      </p>
                      {member.plan && (
                        <p className="text-xs text-muted-foreground">
                          ${member.plan.price.toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td>
                      <p className="text-sm">
                        {new Date(member.endDate).toLocaleDateString("es-ES")}
                      </p>
                      {new Date(member.endDate) < new Date() && (
                        <span className="badge-overdue text-[10px] mt-1 inline-block">
                          Vencido
                        </span>
                      )}
                    </td>
                    <td>{statusBadge(member.status)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={member.status}
                          onChange={(e) =>
                            handleStatusChange(
                              member._id,
                              e.target.value as "active" | "inactive" | "suspended"
                            )
                          }
                          className="input-dark px-2 py-1.5 text-xs rounded-lg"
                        >
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                          <option value="suspended">Suspendido</option>
                        </select>
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-white transition-all"
                          title="Editar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="size-4"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                          title="Eliminar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="size-4"
                          >
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="dialog-dark max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {editing ? "Editar Socio" : "Nuevo Socio"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editing
                ? "Modifica los datos del socio"
                : "Completa el formulario para registrar un nuevo socio"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  className="input-dark w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Apellido
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  className="input-dark w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="input-dark w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="input-dark w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  DNI
                </label>
                <input
                  type="text"
                  value={form.dni}
                  onChange={(e) => setForm({ ...form, dni: e.target.value })}
                  className="input-dark w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) =>
                    setForm({ ...form, birthDate: e.target.value })
                  }
                  className="input-dark w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Género
                </label>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gender: e.target.value as "male" | "female" | "other",
                    })
                  }
                  className="input-dark w-full px-4 py-2.5 text-sm"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Plan
                </label>
                <select
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value ?? "" })}
                  className="input-dark w-full px-4 py-2.5 text-sm"
                >
                  <option value="">Seleccionar plan</option>
                  {(plans ?? []).map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} - ${plan.price}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="input-dark w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  className="input-dark w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Notas
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-dark w-full px-4 py-2.5 text-sm"
                placeholder="Observaciones adicionales..."
              />
            </div>

            <DialogFooter className="gap-3 pt-4">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="btn-secondary px-5 py-2.5 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                {saving ? "Guardando..." : editing ? "Actualizar" : "Crear"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
