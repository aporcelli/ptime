"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, X, CheckSquare, CheckCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { createTareaAction, toggleTareaAction } from "@/app/actions/tasks";
import type { Tarea } from "@/types/entities";

export default function TareasAdmin({ tareas }: { tareas: Tarea[] }) {
  const router  = useRouter();
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk]         = useState(false);
  const [error, setError]   = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [nombre, setNombre]     = useState("");
  const [categoria, setCategoria] = useState("");

  async function handleSave() {
    if (!nombre.trim()) return;
    setSaving(true); setError("");
    const res = await createTareaAction({ nombre, categoria: categoria || undefined, activa: true });
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setOk(true);
    setTimeout(() => { setOpen(false); setOk(false); setNombre(""); setCategoria(""); router.refresh(); }, 900);
  }

  async function handleToggle(id: string, activa: boolean) {
    setToggling(id);
    await toggleTareaAction(id, !activa);
    setToggling(null);
    router.refresh();
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600";

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Tareas</h1>
          <p className="text-slate-500 mt-1">{tareas.length} tareas registradas</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Nueva tarea
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {tareas.length === 0 ? (
          <div className="p-12 text-center">
            <CheckSquare size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay tareas aún.</p>
            <button onClick={() => setOpen(true)} className="text-brand-600 text-sm font-medium mt-2 hover:underline">Crear la primera →</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {["Nombre","Categoría","Estado",""].map((h) => (
                <th key={h} className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {tareas.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-ink">{t.nombre}</td>
                  <td className="p-3 text-slate-500">{t.categoria ?? "—"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.activa ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {t.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleToggle(t.id, t.activa)}
                      disabled={toggling === t.id}
                      className="text-slate-400 hover:text-brand-600 transition-colors disabled:opacity-50"
                      title={t.activa ? "Desactivar" : "Activar"}>
                      {toggling === t.id
                        ? <Loader2 size={16} className="animate-spin" />
                        : t.activa ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-lg text-ink">Nueva tarea</h2>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">Nombre *</label>
                  <input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Desarrollo Backend" onKeyDown={(e) => e.key === "Enter" && handleSave()} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">Categoría (opcional)</label>
                  <input className={inputCls} value={categoria} onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ej: Técnico, Diseño, Gestión" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={handleSave} disabled={saving || ok || !nombre.trim()}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {ok     && <CheckCircle size={15} />}
                  {ok ? "¡Guardada!" : saving ? "Guardando…" : "Crear tarea"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
