"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Shield, ShieldOff, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import { setUserRole, setUserActivo } from "@/app/actions/users";
import type { PtimeUser } from "@/app/actions/users";

export default function UsuariosAdmin({ users, currentEmail }: { users: PtimeUser[]; currentEmail: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-ink">Usuarios</h1>
        <p className="text-slate-500 mt-1">{users.length} usuarios registrados</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>¿Cómo funciona?</strong> Cada usuario que ingresa a Ptime con su cuenta de Google conecta su propio Google Sheet.
        Como administrador podés ver quiénes se han registrado, cambiar su rol o suspender el acceso.
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Todavía no hay otros usuarios registrados.<br />
            Cuando alguien ingrese con Google aparecerá aquí.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Usuario","Email","Rol","Último acceso","Sheet","Estado","Acciones"].map((h) => (
                  <th key={h} className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.email === currentEmail;
                return (
                  <tr key={u.email} className={`border-b border-slate-100 last:border-0 transition-colors ${isMe ? "bg-blue-50/50" : "hover:bg-slate-50"}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-ink truncate max-w-[120px]">{u.nombre}</span>
                        {isMe && <span className="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-medium">vos</span>}
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 text-xs">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.rol === "ADMIN" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-mono text-slate-400 whitespace-nowrap">
                      {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleDateString("es-AR") : "—"}
                    </td>
                    <td className="p-3">
                      {u.sheetId ? (
                        <a href={`https://docs.google.com/spreadsheets/d/${u.sheetId}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                          Ver <ExternalLink size={10} />
                        </a>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="p-3">
                      <button onClick={() => !isMe && handleToggle(u.email, u.activo)}
                        disabled={isMe || loading === `toggle-${u.email}`}
                        className="disabled:opacity-40 disabled:cursor-not-allowed">
                        {loading === `toggle-${u.email}`
                          ? <Loader2 size={16} className="animate-spin text-slate-400" />
                          : u.activo
                            ? <ToggleRight size={20} className="text-green-500" />
                            : <ToggleLeft size={20} className="text-slate-400" />}
                      </button>
                    </td>
                    <td className="p-3">
                      {!isMe && (
                        <div className="flex gap-1">
                          {u.rol === "USER" ? (
                            <button onClick={() => handleRole(u.email, "ADMIN")}
                              disabled={loading === `role-${u.email}`}
                              title="Promover a Admin"
                              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-2 py-1 rounded-lg transition-colors disabled:opacity-40">
                              {loading === `role-${u.email}` ? <Loader2 size={11} className="animate-spin" /> : <Shield size={11} />}
                              Admin
                            </button>
                          ) : (
                            <button onClick={() => handleRole(u.email, "USER")}
                              disabled={loading === `role-${u.email}`}
                              title="Quitar Admin"
                              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-400 px-2 py-1 rounded-lg transition-colors disabled:opacity-40">
                              {loading === `role-${u.email}` ? <Loader2 size={11} className="animate-spin" /> : <ShieldOff size={11} />}
                              User
                            </button>
                          )}
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
    </div>
  );
}
