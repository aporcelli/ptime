"use client";
import { useState, useTransition } from "react";
import { UserPlus, Trash2, RefreshCw, Shield, Eye, Users } from "lucide-react";
import { inviteMemberAction, updateMemberRolAction, removeMemberAction } from "@/app/actions/workspace";
import type { WorkspaceMember, WorkspaceMemberRol } from "@/types/entities";

const ROL_CONFIG: Record<WorkspaceMemberRol, { label: string; desc: string; color: string; icon: React.ReactNode }> = {
  OWNER:       { label: "Owner",        desc: "Control total",            color: "text-primary-fixed bg-primary-fixed/10",   icon: <Shield size={12} /> },
  COLABORADOR: { label: "Colaborador",  desc: "Carga y edita horas",      color: "text-green-600 bg-green-100",              icon: <Users size={12} /> },
  VIEWER:      { label: "Viewer",       desc: "Solo lectura y reportes",  color: "text-amber-600 bg-amber-100",              icon: <Eye size={12} /> },
};

interface Props {
  members:            WorkspaceMember[];
  currentUserEmail:   string;
}

export default function WorkspaceClient({ members: initMembers, currentUserEmail }: Props) {
  const [members, setMembers]   = useState(initMembers);
  const [email, setEmail]       = useState("");
  const [rol, setRol]           = useState<WorkspaceMemberRol>("COLABORADOR");
  const [error, setError]       = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;

    startTransition(async () => {
      const res = await inviteMemberAction(email.trim(), rol);
      if (!res.success) { setError(res.error); return; }
      setMembers(prev => [...prev, res.data]);
      setEmail("");
    });
  }

  async function handleChangeRol(memberEmail: string, nuevoRol: WorkspaceMemberRol) {
    startTransition(async () => {
      const res = await updateMemberRolAction(memberEmail, nuevoRol);
      if (!res.success) { setError(res.error); return; }
      setMembers(prev => prev.map(m => m.email === memberEmail ? { ...m, rol: nuevoRol } : m));
    });
  }

  async function handleRemove(memberEmail: string) {
    if (!confirm(`¿Querés eliminar a ${memberEmail} del workspace?`)) return;
    startTransition(async () => {
      const res = await removeMemberAction(memberEmail);
      if (!res.success) { setError(res.error); return; }
      setMembers(prev => prev.filter(m => m.email !== memberEmail));
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Formulario de invitación */}
      <div className="bg-surface-lowest rounded-xl p-5 shadow-ambient">
        <h2 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
          <UserPlus size={16} className="text-primary-fixed" />
          Invitar miembro
        </h2>
        <form onSubmit={handleInvite} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="flex-1 h-9 px-3 rounded-lg border border-outline-variant bg-surface-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed/30"
              required
            />
            <select
              value={rol}
              onChange={e => setRol(e.target.value as WorkspaceMemberRol)}
              className="h-9 px-2 rounded-lg border border-outline-variant bg-surface-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed/30"
            >
              <option value="COLABORADOR">Colaborador</option>
              <option value="VIEWER">Viewer (solo lectura)</option>
            </select>
          </div>

          {/* Descripción del rol */}
          <div className="flex gap-4 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <Users size={11} className="text-green-600" />
              <strong>Colaborador:</strong> puede cargar y editar sus propias horas
            </span>
            <span className="flex items-center gap-1">
              <Eye size={11} className="text-amber-600" />
              <strong>Viewer:</strong> solo puede ver reportes y el Dashboard
            </span>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className="self-start h-9 px-4 bg-primary-fixed hover:bg-secondary text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? <RefreshCw size={13} className="animate-spin" /> : <UserPlus size={13} />}
            Invitar
          </button>
        </form>
      </div>

      {/* Lista de miembros */}
      <div className="bg-surface-lowest rounded-xl shadow-ambient overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/20">
          <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <Users size={15} className="text-on-surface-variant" />
            Miembros del workspace ({members.length})
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-on-surface-variant">No hay miembros invitados aún.</p>
            <p className="text-xs text-on-surface-variant mt-1 opacity-60">Invitá colaboradores o viewers usando el formulario de arriba.</p>
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant/10">
            {members.map((m) => {
              const cfg = ROL_CONFIG[m.rol];
              const isMe = m.email === currentUserEmail;
              return (
                <li key={m.email} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-low transition-colors">
                  {/* Avatar inicial */}
                  <div className="w-8 h-8 rounded-full bg-primary-fixed/10 flex items-center justify-center text-primary-fixed font-semibold text-sm shrink-0">
                    {m.email[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {m.email}
                      {isMe && <span className="ml-2 text-xs text-on-surface-variant">(vos)</span>}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Invitado por {m.invited_by} · {new Date(m.created_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>

                  {/* Badge rol */}
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                    {cfg.icon}{cfg.label}
                  </span>

                  {/* Cambiar rol */}
                  {!isMe && (
                    <select
                      value={m.rol}
                      onChange={e => handleChangeRol(m.email, e.target.value as WorkspaceMemberRol)}
                      disabled={isPending}
                      className="h-7 px-1.5 text-xs rounded border border-outline-variant bg-surface-low text-on-surface focus:outline-none"
                    >
                      <option value="COLABORADOR">Colaborador</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  )}

                  {/* Remover */}
                  {!isMe && (
                    <button
                      onClick={() => handleRemove(m.email)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Remover del workspace"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
