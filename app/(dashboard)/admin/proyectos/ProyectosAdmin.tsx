"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, X, FolderKanban, CheckCircle, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { createProyectoAction, updateProyectoAction, deleteProyectoAction } from "@/app/actions/projects";
import type { Proyecto, Cliente } from "@/types/entities";
import { PresupuestoBar } from "@/components/admin/PresupuestoBar";

interface Props { proyectos: Proyecto[]; clientes: Cliente[]; }

const ESTADO_BADGE: Record<string, string> = {
  activo: "badge badge-green",
  pausado: "badge badge-amber",
  cerrado: "badge badge-slate",
};

const defaultForm = {
  nombre: "", cliente_id: "", presupuesto_horas: "",
  precio_base: "35", precio_alto: "45", umbral_precio_alto: "20", estado: "activo",
};

export default function ProyectosAdmin({ proyectos, clientes }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Proyecto | null>(null);
  const [deleting, setDeleting] = useState<Proyecto | null>(null);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(defaultForm);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  function openCreate() {
    setEditing(null);
    setForm(defaultForm);
    setError("");
    setOpen(true);
  }

  function openEdit(p: Proyecto) {
    setEditing(p);
    setForm({
      nombre: p.nombre, cliente_id: p.cliente_id,
      presupuesto_horas: p.presupuesto_horas?.toString() ?? "",
      precio_base: p.precio_base.toString(), precio_alto: p.precio_alto.toString(),
      umbral_precio_alto: p.umbral_precio_alto.toString(), estado: p.estado,
    });
    setError("");
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true); setError("");
    const payload = {
      ...form,
      presupuesto_horas: form.presupuesto_horas ? Number(form.presupuesto_horas) : undefined,
      precio_base: Number(form.precio_base),
      precio_alto: Number(form.precio_alto),
      umbral_precio_alto: Number(form.umbral_precio_alto),
    };
    if (editing) {
      const res = await updateProyectoAction(editing.id, payload);
      setSaving(false);
      if (!res.success) { setError(res.error); return; }
    } else {
      const res = await createProyectoAction(payload);
      setSaving(false);
      if (!res.success) { setError(res.error); return; }
    }
    setOk(true);
    setTimeout(() => { setOpen(false); setOk(false); setEditing(null); router.refresh(); }, 700);
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true); setError("");
    const res = await deleteProyectoAction(deleting.id);
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-on-surface tracking-tight">Proyectos</h1>
          <p className="text-on-surface-variant mt-1">{proyectos.length} proyectos registrados</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-fixed hover:bg-secondary text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Nuevo proyecto
        </button>
      </div>

      <div className="bg-surface-lowest rounded-xl overflow-hidden shadow-ambient">
        {proyectos.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban size={32} className="text-on-surface-variant mx-auto mb-3" />
            <p className="text-on-surface-variant text-sm">No hay proyectos aún.</p>
            <button onClick={openCreate} className="text-primary-fixed text-sm font-medium mt-2 hover:underline">Crear el primero →</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-high">
                {["Nombre", "Cliente", "Presupuesto", "$/h base", "$/h alto", "Estado", ""].map((h) => (
                  <th key={h} className="p-3 text-xs font-semibold uppercase tracking-wide text-left text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p, i) => {
                const cliente = clientes.find((c) => c.id === p.cliente_id);
                return (
                  <tr key={p.id} className={`transition-colors hover:bg-surface-low ${i % 2 === 0 ? "bg-surface-lowest" : "bg-surface-low"}`}>
                    <td className="p-3 font-medium text-on-surface">{p.nombre}</td>
                    <td className="p-3 text-on-surface-variant">{cliente?.nombre ?? "—"}</td>
                    <td className="p-3 min-w-[160px]">
                      {p.presupuesto_horas ? (
                        <PresupuestoBar
                          horasRegistradas={p.horas_acumuladas}
                          presupuestoHoras={p.presupuesto_horas}
                        />
                      ) : (
                        <span className="font-mono text-on-surface-variant text-xs">{p.horas_acumuladas}h acum.</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-on-surface-variant">${p.precio_base}</td>
                    <td className="p-3 font-mono text-on-surface-variant">${p.precio_alto}</td>
                    <td className="p-3"><span className={ESTADO_BADGE[p.estado] ?? "badge badge-slate"}>{p.estado}</span></td>
                    <td className="p-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary-fixed transition-colors" title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleting(p)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-500 transition-colors" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Create/Edit */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="modal-panel max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-lg text-heading">{editing ? "Editar proyecto" : "Nuevo proyecto"}</h2>
                <button onClick={() => setOpen(false)} className="text-sub hover:text-heading"><X size={18} /></button>
              </div>

              <div className="flex flex-col gap-4">
                <Field label="Nombre del proyecto *">
                  <input className="input-field" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: Rediseño web 2026" />
                </Field>
                <Field label="Cliente">
                  <select className="input-field" value={form.cliente_id} onChange={(e) => set("cliente_id", e.target.value)}>
                    <option value="">Sin cliente asignado</option>
                    {clientes.filter((c) => c.activo).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="$/h base">
                    <input type="number" className="input-field" value={form.precio_base} onChange={(e) => set("precio_base", e.target.value)} />
                  </Field>
                  <Field label="$/h alto">
                    <input type="number" className="input-field" value={form.precio_alto} onChange={(e) => set("precio_alto", e.target.value)} />
                  </Field>
                  <Field label="Umbral (h)">
                    <input type="number" className="input-field" value={form.umbral_precio_alto} onChange={(e) => set("umbral_precio_alto", e.target.value)} />
                  </Field>
                </div>
                <Field label="Presupuesto de horas (opcional)">
                  <input type="number" className="input-field" value={form.presupuesto_horas} onChange={(e) => set("presupuesto_horas", e.target.value)} placeholder="Ej: 100" />
                </Field>
                <Field label="Estado">
                  <select className="input-field" value={form.estado} onChange={(e) => set("estado", e.target.value)}>
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </Field>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button onClick={handleSave} disabled={saving || ok || !form.nombre.trim()}
                  className="w-full bg-primary-fixed hover:bg-secondary disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors mt-1">
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {ok && <CheckCircle size={15} />}
                  {ok ? "¡Guardado!" : saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear proyecto"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Delete */}
      <AnimatePresence>
        {deleting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleting(null)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="modal-panel max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-heading">Eliminar proyecto</h2>
                  <p className="text-sm text-sub">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p className="text-sm text-sub mb-5">
                ¿Eliminar <strong className="text-heading">{deleting.nombre}</strong>?
              </p>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setDeleting(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border text-heading transition-colors"
                  style={{ borderColor: "var(--border-default)" }}>Cancelar</button>
                <button onClick={handleDelete} disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                  {saving && <Loader2 size={15} className="animate-spin" />} Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sub">{label}</label>{children}</div>;
}
