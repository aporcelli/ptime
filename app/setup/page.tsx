// app/setup/page.tsx — FUERA del (dashboard) group, no requiere sheetId
import type { Metadata } from "next";
import { auth }     from "@/auth";
import { redirect } from "next/navigation";
import { cookies }  from "next/headers";
import SetupForm    from "./SetupForm";
import { findSharedSheetForEmail } from "@/lib/sheets/master";

export const metadata: Metadata = { title: "Configurar Sheet | Ptime" };

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Si ya tiene sheet configurado (en JWT o cookie), ir al dashboard
  const cookieStore = cookies();
  const sheetId     = (session.user as { sheetId?: string }).sheetId
                   ?? cookieStore.get("ptime-sheet-id")?.value;
  if (sheetId) redirect("/dashboard");

  // Verificar si tiene un workspace compartido / sheet previo persistido
  const sharedSheetId = await findSharedSheetForEmail(session.user.email ?? "");

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blobs decorativos */}
      <div aria-hidden className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-lg z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl font-extrabold tracking-tight">
            P<span className="text-emerald-500 italic">time</span>
          </h1>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{sharedSheetId ? "🎉" : "📊"}</div>
            <h2 className="font-semibold text-xl mb-1">
              {sharedSheetId ? "¡Tenés una invitación pendiente!" : "Conectá tu Google Sheet"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {sharedSheetId ? "Han compartido un workspace contigo." : "Ptime usa un Google Sheet como base de datos. Creá uno nuevo o usá uno existente."}
            </p>
          </div>

          <SetupForm sharedSheetId={sharedSheetId ?? undefined} />
        </div>
      </div>
    </main>
  );
}
