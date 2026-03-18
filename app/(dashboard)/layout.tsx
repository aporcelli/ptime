// app/(dashboard)/layout.tsx
import { auth }     from "@/auth";
import { redirect } from "next/navigation";
import { cookies }  from "next/headers";
import Sidebar  from "@/components/layout/Sidebar";
import Topbar   from "@/components/layout/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Verificar que el sheet esté configurado
  const cookieStore = cookies();
  const sheetId     = cookieStore.get("ptime-sheet-id")?.value;

  // Si no hay sheetId Y no estamos ya en /setup, redirigir
  // (el middleware también lo hace, pero esto es la segunda línea de defensa)
  if (!sheetId) {
    redirect("/setup");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar role={session.user.role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
