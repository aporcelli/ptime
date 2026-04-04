"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, X, CheckSquare, CheckCircle, ToggleLeft, ToggleRight, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { createTareaAction, toggleTareaAction, updateTareaAction, deleteTareaAction } from "@/app/actions/tasks";
import type { Tarea } from "@/types/entities";

export default function TareasAdmin({ tareas }: { tareas: Tarea[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tarea | null>(null);
  const [deleting, setDeleting] = useState<Tarea | null>(null);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");

  function openCreate() {
    setEditing(null);
    setNombre(""); setCategoria(""); setError("");
    setOpen(true);
  }

  function openEdit(t: Tarea) {
    setEditing(t);
    setNombre(t.nombre);
    setCategoria(t.categoria ?? "");
    setError("");
    setOpen(true);
  }

  async function handleSave() {
    if (!nombre.trim()) return;
    setSaving(true); setError("");
    if (editing) {
      const res = await updateTareaAction(editing.id, { nombre, categoria: categoria || undefined });
      setSaving(false);
      if (!res.success) { setError(res.error); return; }
    } else {
      const res = await createTareaAction({ nombre, categoria: categoria || undefined, activa: true });
      setSaving(false);
      if (!res.success) { setError(res.error); return; }
    }
    setOk(true);
    setTimeout(() => { setOpen(false); setOk(false); setNombre(""); setCategoria(""); setEditing(null); router.refresh(); }, 700);
  }

  async function handleToggle(id: string, activa: boolean) {
    setToggling(id);
    await toggleTareaAction(id, !activa);
    setToggling(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true); setError("");
    const res = await deleteTareaAction(deleting.id);
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-heading">Tareas</h1>
          <p className="text-sub mt-1">{tareas.length} tareas registradas</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Nueva tarea
        </button>
      </div>

      <div className="table-container">
        {tareas.length === 0 ? (
          <div className="p-12 text-center">
            <CheckSquare size={32} className="text-faint mx-auto mb-3" />
            <p className="text-sub text-sm">No hay tareas aún.</p>
            <button onClick={openCreate} className="text-brand-600 text-sm font-medium mt-2 hover:underline">Crear la primera →</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="table-head">
              {["Nombre", "Categoría", "Estado", "", ""].map((h, i) => (
                <th key={i} className="p-3 text-xs font-semibold uppercase tracking-wide text-left"
                  style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {tareas.map((t) => (
                <tr key={t.id} className="table-row">
                  <td className="p-3 font-medium text-heading">{t.nombre}</td>
                  <td className="p-3 text-sub">{t.categoria ?? "—"}</td>
                  <td className="p-3">
                    <span className={`badge ${t.activa ? "badge-green" : "badge-slate"}`}>
                      {t.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleToggle(t.id, t.activa)}
                      disabled={toggling === t.id}
                      className="text-sub hover:text-brand-600 transition-colors disabled:opacity-50"
                      title={t.activa ? "Desactivar" : "Activar"}>
                      {toggling === t.id
                        ? <Loader2 size={16} className="animate-spin" />
                        : t.activa ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-sub hover:text-brand-600 transition-colors" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleting(t)} className="p-1.5 rounded-lg text-sub hover:text-red-500 transition-colors" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
              className="modal-panel max-w-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-lg text-heading">{editing ? "Editar tarea" : "Nueva tarea"}</h2>
                <button onClick={() => setOpen(false)} className="text-sub hover:text-heading"><X size={18} /></button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-sub">Nombre *</label>
                  <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Desarrollo Backend" onKeyDown={(e) => e.key === "Enter" && handleSave()} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-sub">Categoría (opcional)</label>
                  <input className="input-field" value={categoria} onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ej: Técnico, Diseño, Gestión" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={handleSave} disabled={saving || ok || !nombre.trim()}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {ok && <CheckCircle size={15} />}
                  {ok ? "¡Guardada!" : saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear tarea"}
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
                  <h2 className="font-semibold text-heading">Eliminar tarea</h2>
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
