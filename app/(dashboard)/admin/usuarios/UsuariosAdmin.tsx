"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Shield, ShieldOff, ToggleLeft, ToggleRight, ExternalLink, Trash2, AlertTriangle } from "lucide-react";
import { setUserRole, setUserActivo, deleteUserAction } from "@/app/actions/users";
import type { PtimeUser } from "@/app/actions/users";
import { formatDateShort } from "@/lib/utils/index";

export default function UsuariosAdmin({ users, currentEmail }: { users: PtimeUser[]; currentEmail: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<PtimeUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleRole(email: string, rol: "ADMIN" | "USER") {
    setLoading(`role-${email}`);
    await setUserRole(email, rol);
    setLoading(null);
    router.refresh();
  }

  async function handleToggle(email: string, activo: boolean) {
    setLoading(`toggle-${email}`);
    await setUserActivo(email, !activo);
    setLoading(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true); setError("");
    const res = await deleteUserAction(deleting.email);
    setSaving(false);
    if (!res.success) { setError(res.error ?? "Error"); return; }
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-heading">Usuarios</h1>
        <p className="text-sub mt-1">{users.length} usuarios registrados</p>
      </div>

      <div className="alert-amber">
        <strong className="text-heading">¿Cómo funciona?</strong>
        <span className="text-sub text-sm ml-1">
          Cada usuario que ingresa a Ptime con Google conecta su propio Google Sheet.
          Como admin podés cambiar roles o suspender acceso.
        </span>
      </div>

      <div className="table-container">
        {users.length === 0 ? (
          <div className="p-12 text-center text-sub text-sm">
            Todavía no hay otros usuarios registrados.<br />
            Cuando alguien ingrese con Google aparecerá aquí.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                {["Usuario", "Email", "Rol", "Último acceso", "Sheet", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="p-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-left"
                    style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.email === currentEmail;
                return (
                  <tr key={u.email} className={`table-row ${isMe ? "!bg-brand-600/5" : ""}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-heading truncate max-w-[120px]">{u.nombre}</span>
                        {isMe && <span className="badge badge-brand text-[10px]">vos</span>}
                      </div>
                    </td>
                    <td className="p-3 text-sub text-xs">{u.email}</td>
                    <td className="p-3">
                      <span className={`badge ${u.rol === "ADMIN" ? "badge-brand" : "badge-slate"}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-mono text-faint whitespace-nowrap">
                      {u.ultimoAcceso ? formatDateShort(u.ultimoAcceso) : "—"}
                    </td>
                    <td className="p-3">
                      {u.sheetId ? (
                        <a href={`https://docs.google.com/spreadsheets/d/${u.sheetId}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                          Ver <ExternalLink size={10} />
                        </a>
                      ) : <span className="text-faint text-xs">—</span>}
                    </td>
                    <td className="p-3">
                      <button onClick={() => !isMe && handleToggle(u.email, u.activo)}
                        disabled={isMe || loading === `toggle-${u.email}`}
                        className="disabled:opacity-40 disabled:cursor-not-allowed">
                        {loading === `toggle-${u.email}`
                          ? <Loader2 size={16} className="animate-spin text-faint" />
                          : u.activo
                            ? <ToggleRight size={20} className="text-green-500" />
                            : <ToggleLeft size={20} className="text-faint" />}
                      </button>
                    </td>
                    <td className="p-3">
                      {!isMe && (
                        <div className="flex gap-1">
                          {u.rol === "USER" ? (
                            <button onClick={() => handleRole(u.email, "ADMIN")}
                              disabled={loading === `role-${u.email}`}
                              title="Promover a Admin"
                              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 border border-brand-600/20 hover:border-brand-600/40 px-2 py-1 rounded-lg transition-colors disabled:opacity-40">
                              {loading === `role-${u.email}` ? <Loader2 size={11} className="animate-spin" /> : <Shield size={11} />}
                              Admin
                            </button>
                          ) : (
                            <button onClick={() => handleRole(u.email, "USER")}
                              disabled={loading === `role-${u.email}`}
                              title="Quitar Admin"
                              className="flex items-center gap-1 text-xs text-sub border px-2 py-1 rounded-lg transition-colors disabled:opacity-40"
                              style={{ borderColor: "var(--border-default)" }}>
                              {loading === `role-${u.email}` ? <Loader2 size={11} className="animate-spin" /> : <ShieldOff size={11} />}
                              User
                            </button>
                          )}
                          <button onClick={() => setDeleting(u)}
                            className="p-1.5 rounded-lg text-sub hover:text-red-500 transition-colors" title="Eliminar">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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
                  <h2 className="font-semibold text-heading">Eliminar usuario</h2>
                  <p className="text-sm text-sub">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p className="text-sm text-sub mb-5">
                ¿Eliminar a <strong className="text-heading">{deleting.nombre}</strong> ({deleting.email})?
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
