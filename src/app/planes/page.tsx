"use client";

import { useEffect, useState } from "react";
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
  description: string;
  price: number;
  duration: number;
  durationType: "days" | "months";
  features: string[];
  active: boolean;
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  duration: "",
  durationType: "months" as "days" | "months",
  features: "",
};

export default function PlanesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();
      setPlans(data);
    } catch {
      toast.error("Error al cargar planes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        duration: parseInt(form.duration),
        features: form.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      };

      if (editing) {
        const res = await fetch(`/api/plans/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Plan actualizado");
      } else {
        const res = await fetch("/api/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Plan creado");
      }

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      fetchPlans();
    } catch {
      toast.error(editing ? "Error al actualizar" : "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      durationType: plan.durationType,
      features: plan.features.join("\n"),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este plan?")) return;
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Plan eliminado");
      fetchPlans();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (!res.ok) throw new Error();
      toast.success(active ? "Plan desactivado" : "Plan activado");
      fetchPlans();
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const openCreateDialog = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const planIcons = [
    <svg key="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-8"><path d="m6.5 6.5 11 11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" /></svg>,
    <svg key="2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    <svg key="3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Planes</h1>
          <p className="text-muted-foreground mt-1">
            Administra los planes de membresía
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
          Nuevo Plan
        </button>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-8 text-primary"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <p className="text-muted-foreground mb-4">No hay planes creados</p>
          <button onClick={openCreateDialog} className="btn-secondary px-4 py-2 text-sm">
            Crear primer plan
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(plans ?? []).map((plan, index) => (
            <div
              key={plan._id}
              className={`card-hover bg-card rounded-2xl p-6 relative overflow-hidden ${
                !plan.active ? "opacity-60" : ""
              }`}
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary" />

              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {planIcons[index % planIcons.length]}
                </div>
                <span
                  className={plan.active ? "badge-active" : "badge-inactive"}
                >
                  {plan.active ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-bold text-white">
                  ${plan.price.toLocaleString()}
                </span>
                <span className="text-muted-foreground text-sm">
                  /{plan.duration}{" "}
                  {plan.durationType === "months" ? "meses" : "días"}
                </span>
              </div>

              {/* Features */}
              {plan.features.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {(plan.features ?? []).map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-4 text-primary shrink-0"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => handleEdit(plan)}
                  className="btn-secondary flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2"
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
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(plan._id, plan.active)}
                  className={`px-3 py-2 text-sm rounded-xl font-medium transition-all ${
                    plan.active
                      ? "bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1]"
                      : "btn-primary"
                  }`}
                >
                  {plan.active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
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
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="dialog-dark max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {editing ? "Editar Plan" : "Nuevo Plan"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editing
                ? "Modifica los datos del plan"
                : "Crea un nuevo plan de membresía"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Nombre del Plan
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-dark w-full px-4 py-2.5 text-sm"
                placeholder="Ej: Plan Mensual"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="input-dark w-full px-4 py-2.5 text-sm resize-none"
                placeholder="Describe el plan..."
                required
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Precio ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input-dark w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Duración
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  className="input-dark w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Tipo
                </label>
                <select
                  value={form.durationType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      durationType: e.target.value as "days" | "months",
                    })
                  }
                  className="input-dark w-full px-4 py-2.5 text-sm"
                >
                  <option value="months">Meses</option>
                  <option value="days">Días</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Características (una por línea)
              </label>
              <textarea
                value={form.features}
                onChange={(e) =>
                  setForm({ ...form, features: e.target.value })
                }
                className="input-dark w-full px-4 py-2.5 text-sm resize-none"
                placeholder={"Acceso a sala de pesas\nClases grupales\nEntrenador personal"}
                rows={4}
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
