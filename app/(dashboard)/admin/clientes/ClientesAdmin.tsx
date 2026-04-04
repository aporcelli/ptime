"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, X, Users, CheckCircle, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { createClienteAction, updateClienteAction, deleteClienteAction } from "@/app/actions/clients";
import type { Cliente } from "@/types/entities";

export default function ClientesAdmin({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  function openCreate() {
    setEditing(null);
    setForm({ nombre: "", email: "", telefono: "" });
    setError("");
    setOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditing(c);
    setForm({ nombre: c.nombre, email: c.email, telefono: c.telefono ?? "" });
    setError("");
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true); setError("");
    if (editing) {
      const res = await updateClienteAction(editing.id, { ...form, activo: editing.activo });
      setSaving(false);
      if (!res.success) { setError(res.error); return; }
    } else {
      const res = await createClienteAction({ ...form, activo: true });
      setSaving(false);
      if (!res.success) { setError(res.error); return; }
    }
    setOk(true);
    setTimeout(() => { setOpen(false); setOk(false); setForm({ nombre: "", email: "", telefono: "" }); setEditing(null); router.refresh(); }, 700);
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    const res = await deleteClienteAction(deleting.id);
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-heading">Clientes</h1>
          <p className="text-sub mt-1">{clientes.length} clientes registrados</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="table-container">
        {clientes.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="text-faint mx-auto mb-3" />
            <p className="text-sub text-sm">No hay clientes aún.</p>
            <button onClick={openCreate} className="text-brand-600 text-sm font-medium mt-2 hover:underline">Crear el primero →</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="table-head">
              {["Nombre", "Email", "Teléfono", "Estado", ""].map((h) => (
                <th key={h} className="p-3 text-xs font-semibold uppercase tracking-wide text-left" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="p-3 font-medium text-heading">{c.nombre}</td>
                  <td className="p-3 text-sub">{c.email}</td>
                  <td className="p-3 text-sub">{c.telefono ?? "—"}</td>
                  <td className="p-3"><span className={`badge ${c.activo ? "badge-green" : "badge-slate"}`}>{c.activo ? "Activo" : "Inactivo"}</span></td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-sub hover:text-brand-600 transition-colors" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleting(c)} className="p-1.5 rounded-lg text-sub hover:text-red-500 transition-colors" title="Eliminar">
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
                <h2 className="font-semibold text-lg text-heading">{editing ? "Editar cliente" : "Nuevo cliente"}</h2>
                <button onClick={() => setOpen(false)} className="text-sub hover:text-heading"><X size={18} /></button>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { k: "nombre", label: "Nombre *", placeholder: "Empresa S.A." },
                  { k: "email", label: "Email *", placeholder: "contacto@empresa.com" },
                  { k: "telefono", label: "Teléfono", placeholder: "+54 11 1234-5678" },
                ].map(({ k, label, placeholder }) => (
                  <div key={k} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-sub">{label}</label>
                    <input className="input-field" value={(form as Record<string, string>)[k]}
                      onChange={(e) => set(k, e.target.value)} placeholder={placeholder} />
                  </div>
                ))}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={handleSave} disabled={saving || ok || !form.nombre.trim() || !form.email.trim()}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {ok && <CheckCircle size={15} />}
                  {ok ? "¡Guardado!" : saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear cliente"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Delete Confirmation */}
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
                  <h2 className="font-semibold text-heading">Eliminar cliente</h2>
                  <p className="text-sm text-sub">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p className="text-sm text-sub mb-5">
                ¿Estás seguro de eliminar a <strong className="text-heading">{deleting.nombre}</strong>?
              </p>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setDeleting(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border text-heading transition-colors"
                  style={{ borderColor: "var(--border-default)" }}>
                  Cancelar
                </button>
                <button onClick={handleDelete} disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
