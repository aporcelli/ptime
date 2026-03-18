import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUsers } from "@/app/actions/users";
import UsuariosAdmin from "./UsuariosAdmin";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsuariosPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard?error=unauthorized");

  let users: Awaited<ReturnType<typeof getUsers>> = [];
  try { users = await getUsers(); } catch { users = []; }

  return <UsuariosAdmin users={users} currentEmail={session.user.email} />;
}
