// app/(dashboard)/layout.tsx — Server Component (sin "use client")
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Si el refresh token falló, forzar re-login para obtener nuevas credenciales
  if (session.error === "RefreshTokenError") {
    redirect("/login?error=TokenExpired");
  }

  // Preferimos sheetId del JWT (persistente cross-device), luego cookie
  const cookieStore = cookies();
  const sheetId = (session.user as { sheetId?: string }).sheetId
               ?? cookieStore.get("ptime-sheet-id")?.value;

  if (!sheetId) {
    redirect("/setup");
  }

  return (
    <DashboardShell role={session.user.role} user={session.user}>
      {children}
    </DashboardShell>
  );
}
