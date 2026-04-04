import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUsers } from "@/app/actions/users";
import { getSheetIdFromCookie } from "@/app/actions/setup";
import type { PtimeUser } from "@/app/actions/users";
import UsuariosAdmin from "./UsuariosAdmin";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsuariosPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard?error=unauthorized");

  let users: PtimeUser[] = [];
  try { users = await getUsers(); } catch { users = []; }

  // Fix: el admin actual puede no estar en el Sheet (primer login, sheet nuevo, etc.)
  // Si no aparece en la lista, lo inyectamos con los datos de sesión para que siempre se vea.
  const currentEmail = session.user.email ?? "";
  const adminEnLista = users.some((u) => u.email === currentEmail);

  if (!adminEnLista && currentEmail) {
    const sheetId = await getSheetIdFromCookie();
    const adminUser: PtimeUser = {
      id:           session.user.id ?? "session",
      nombre:       session.user.name ?? currentEmail,
      email:        currentEmail,
      rol:          "ADMIN",
      activo:       true,
      ultimoAcceso: new Date().toISOString(),
      sheetId:      sheetId ?? "",
    };
    // Insertar al admin al principio de la lista
    users = [adminUser, ...users];
  }

  return <UsuariosAdmin users={users} currentEmail={currentEmail} />;
}
