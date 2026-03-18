"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, X, FolderKanban, CheckCircle } from "lucide-react";
import { createProyectoAction } from "@/app/actions/projects";
import type { Proyecto, Cliente } from "@/types/entities";

interface Props { proyectos: Proyecto[]; clientes: Cliente[]; }

const ESTADO_COLORS: Record<string, string> = {
  activo:  "bg-green-100 text-green-700",
  pausado: "bg-amber-100 text-amber-700",
  cerrado: "bg-slate-100 text-slate-500",
};

export default function ProyectosAdmin({ proyectos, clientes }: Props) {
  const router   = useRouter();
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk]         = useState(false);
  const [error, setError]   = useState("");
  const [form, setForm]     = useState({
    nombre: "", cliente_id: "", presupuesto_horas: "",
    precio_base: "35", precio_alto: "45", umbral_precio_alto: "20", estado: "activo",
  });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSave() {
    setSaving(true); setError("");
    const res = await createProyectoAction({
      ...form,
      presupuesto_horas:  form.presupuesto_horas ? Number(form.presupuesto_horas) : undefined,
      precio_base:        Number(form.precio_base),
      precio_alto:        Number(form.precio_alto),
      umbral_precio_alto: Number(form.umbral_precio_alto),
    });
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setOk(true);
    setTimeout(() => { setOpen(false); setOk(false); router.refresh(); }, 1000);
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600";

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Proyectos</h1>
          <p className="text-slate-500 mt-1">{proyectos.length} proyectos registrados</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Nuevo proyecto
        </button>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {proyectos.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay proyectos aún.</p>
            <button onClick={() => setOpen(true)} className="text-brand-600 text-sm font-medium mt-2 hover:underline">Crear el primero →</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {["Nombre","Cliente","Horas acum.","$/h base","$/h alto","Estado"].map((h) => (
                <th key={h} className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {proyectos.map((p) => {
                const cliente = clientes.find((c) => c.id === p.cliente_id);
                return (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-ink">{p.nombre}</td>
                    <td className="p-3 text-slate-500">{cliente?.nombre ?? "—"}</td>
                    <td className="p-3 font-mono text-slate-700">{p.horas_acumuladas}h</td>
                    <td className="p-3 font-mono text-slate-700">${p.precio_base}</td>
                    <td className="p-3 font-mono text-slate-700">${p.precio_alto}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[p.estado]}`}>{p.estado}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-lg text-ink">Nuevo proyecto</h2>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>

              <div className="flex flex-col gap-4">
                <Field label="Nombre del proyecto *">
                  <input className={inputCls} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: Rediseño web 2026" />
                </Field>
                <Field label="Cliente">
                  <select className={inputCls} value={form.cliente_id} onChange={(e) => set("cliente_id", e.target.value)}>
                    <option value="">Sin cliente asignado</option>
                    {clientes.filter((c) => c.activo).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="$/h base">
                    <input type="number" className={inputCls} value={form.precio_base} onChange={(e) => set("precio_base", e.target.value)} />
                  </Field>
                  <Field label="$/h alto">
                    <input type="number" className={inputCls} value={form.precio_alto} onChange={(e) => set("precio_alto", e.target.value)} />
                  </Field>
                  <Field label="Umbral (h)">
                    <input type="number" className={inputCls} value={form.umbral_precio_alto} onChange={(e) => set("umbral_precio_alto", e.target.value)} />
                  </Field>
                </div>
                <Field label="Presupuesto de horas (opcional)">
                  <input type="number" className={inputCls} value={form.presupuesto_horas} onChange={(e) => set("presupuesto_horas", e.target.value)} placeholder="Ej: 100" />
                </Field>
                <Field label="Estado">
                  <select className={inputCls} value={form.estado} onChange={(e) => set("estado", e.target.value)}>
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </Field>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button onClick={handleSave} disabled={saving || ok || !form.nombre.trim()}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors mt-1">
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {ok     && <CheckCircle size={15} />}
                  {ok ? "¡Guardado!" : saving ? "Guardando…" : "Crear proyecto"}
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
  return <div className="flex flex-col gap-1"><label className="text-xs font-medium text-slate-600">{label}</label>{children}</div>;
}
