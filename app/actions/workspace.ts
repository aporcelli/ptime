'use server';
import { revalidatePath }         from "next/cache";
import { auth }                   from "@/auth";
import { getSheetCtx }            from "@/lib/sheets/context";
import { getWorkspaceMembers, getWorkspaceMemberByEmail } from "@/lib/sheets/queries";
import { inviteWorkspaceMember, updateWorkspaceMemberRol, removeWorkspaceMember } from "@/lib/sheets/mutations";
import { getSheetRows }           from "@/lib/sheets/client";
import type { ActionResult, WorkspaceMember, WorkspaceMemberRol } from "@/types/entities";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") throw new Error("Acceso denegado: se requiere rol ADMIN");
  return session;
}

// ── Listar miembros del workspace actual ──────────────────────────────────────

export async function getWorkspaceMembersAction(): Promise<ActionResult<WorkspaceMember[]>> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "No autenticado" };
  const ctx = await getSheetCtx();
  const members = await getWorkspaceMembers(ctx);
  return { success: true, data: members };
}

// ── Invitar nuevo miembro ─────────────────────────────────────────────────────

export async function inviteMemberAction(
  email: string,
  rol: WorkspaceMemberRol
): Promise<ActionResult<WorkspaceMember>> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "No autenticado" };

  const emailNorm = email.toLowerCase().trim();
  if (!emailNorm.includes("@")) return { success: false, error: "Email inválido" };

  const ctx = await getSheetCtx();

  // Verificar que no esté ya invitado
  const existing = await getWorkspaceMemberByEmail(ctx, emailNorm);
  if (existing) return { success: false, error: `${emailNorm} ya es miembro de este workspace` };

  const invitedBy = session.user.email;
  await inviteWorkspaceMember(ctx, emailNorm, rol, invitedBy);

  revalidatePath("/admin/workspace");
  return {
    success: true,
    data: {
      email: emailNorm,
      sheet_id: ctx.sheetId,
      rol,
      invited_by: invitedBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  };
}

// ── Cambiar rol de un miembro ─────────────────────────────────────────────────

export async function updateMemberRolAction(
  email: string,
  nuevoRol: WorkspaceMemberRol
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "No autenticado" };

  const ctx = await getSheetCtx();
  await updateWorkspaceMemberRol(ctx, email, nuevoRol);

  revalidatePath("/admin/workspace");
  return { success: true };
}

// ── Remover miembro ───────────────────────────────────────────────────────────

export async function removeMemberAction(email: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "No autenticado" };

  const ctx = await getSheetCtx();
  await removeWorkspaceMember(ctx, email);

  revalidatePath("/admin/workspace");
  return { success: true };
}

// ── Buscar workspace al que fue invitado un email ─────────────────────────────
// Esta función es usada internamente en auth.ts al hacer login

export async function findInvitedWorkspace(
  email: string,
  accessToken: string
): Promise<{ sheetId: string; rol: WorkspaceMemberRol } | null> {
  // El sistema de invitaciones busca en la base de datos central de Ptime
  // Un sheet "central" de invitaciones configurado via variable de entorno
  const centralSheetId = process.env.PTIME_INVITATIONS_SHEET_ID;
  if (!centralSheetId) return null;

  try {
    const rows = await getSheetRows(centralSheetId, accessToken, "Workspace_Members!A:F");
    const found = rows.find((r) => r[0]?.toLowerCase() === email.toLowerCase());
    if (!found) return null;
    return {
      sheetId: found[1],
      rol: (found[2] ?? "COLABORADOR") as WorkspaceMemberRol,
    };
  } catch {
    return null;
  }
}
