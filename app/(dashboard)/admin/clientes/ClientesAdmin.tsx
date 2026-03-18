"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, X, Users, CheckCircle } from "lucide-react";
import { createClienteAction } from "@/app/actions/clients";
import type { Cliente } from "@/types/entities";

export default function ClientesAdmin({ clientes }: { clientes: Cliente[] }) {
  const router  = useRouter();
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk]         = useState(false);
  const [error, setError]   = useState("");
  const [form, setForm]     = useState({ nombre: "", email: "", telefono: "" });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSave() {
    setSaving(true); setError("");
    const res = await createClienteAction({ ...form, activo: true });
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setOk(true);
    setTimeout(() => { setOpen(false); setOk(false); setForm({ nombre: "", email: "", telefono: "" }); router.refresh(); }, 900);
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600";

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Clientes</h1>
          <p className="text-slate-500 mt-1">{clientes.length} clientes registrados</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {clientes.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay clientes aún.</p>
            <button onClick={() => setOpen(true)} className="text-brand-600 text-sm font-medium mt-2 hover:underline">Crear el primero →</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {["Nombre","Email","Teléfono","Estado"].map((h) => (
                <th key={h} className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-ink">{c.nombre}</td>
                  <td className="p-3 text-slate-500">{c.email}</td>
                  <td className="p-3 text-slate-500">{c.telefono ?? "—"}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.activo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{c.activo ? "Activo" : "Inactivo"}</span></td>
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
                <h2 className="font-semibold text-lg text-ink">Nuevo cliente</h2>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { k: "nombre",   label: "Nombre *",   placeholder: "Empresa S.A." },
                  { k: "email",    label: "Email *",    placeholder: "contacto@empresa.com" },
                  { k: "telefono", label: "Teléfono",   placeholder: "+54 11 1234-5678" },
                ].map(({ k, label, placeholder }) => (
                  <div key={k} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-600">{label}</label>
                    <input className={inputCls} value={(form as Record<string,string>)[k]}
                      onChange={(e) => set(k, e.target.value)} placeholder={placeholder} />
                  </div>
                ))}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={handleSave} disabled={saving || ok || !form.nombre.trim() || !form.email.trim()}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {ok     && <CheckCircle size={15} />}
                  {ok ? "¡Guardado!" : saving ? "Guardando…" : "Crear cliente"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
